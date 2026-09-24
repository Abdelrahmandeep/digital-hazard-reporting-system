import { HazardReport, DashboardStats, NotificationItem, User } from '../types';
import { calculateRisk } from '../utils/riskMatrix';

export const BACKEND_HOST = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '';
export const API_BASE = `${BACKEND_HOST}/api/v1`;

export function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && BACKEND_HOST) {
    return `${BACKEND_HOST}${url}`;
  }
  return url;
}


// Initial local storage fallback cache if offline
const LOCAL_STORAGE_KEY = 'hazard_reports_local_v1';

function getLocalReports(): HazardReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local reports', e);
  }
  return [];
}

function saveLocalReports(reports: HazardReport[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving local reports', e);
  }
}

export const api = {
  async fetchReports(params?: { status?: string; risk_level?: string; hazard_type?: string; search?: string; reporter_code?: string }): Promise<HazardReport[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.risk_level && params.risk_level !== 'all') query.append('risk_level', params.risk_level);
    if (params?.hazard_type && params.hazard_type !== 'all') query.append('hazard_type', params.hazard_type);
    if (params?.reporter_code) query.append('reporter_code', params.reporter_code);
    if (params?.search) query.append('search', params.search);

    try {
      const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
      if (!res.ok) throw new Error('Network error');
      const data: HazardReport[] = await res.json();
      saveLocalReports(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using cached/local reports', err);
      let local = getLocalReports();
      if (params?.reporter_code) {
        local = local.filter(r => r.reporter_code.toUpperCase() === params.reporter_code?.toUpperCase());
      }

      if (params?.status && params.status !== 'all') {
        local = local.filter(r => r.status === params.status);
      }
      if (params?.risk_level && params.risk_level !== 'all') {
        local = local.filter(r => r.risk_level === params.risk_level);
      }
      if (params?.hazard_type && params.hazard_type !== 'all') {
        local = local.filter(r => r.hazard_type === params.hazard_type);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        local = local.filter(r => 
          r.report_number.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.location_name.toLowerCase().includes(s)
        );
      }
      return local;
    }
  },

  async createReport(formData: FormData): Promise<HazardReport> {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to submit' }));
        throw new Error(err.detail || 'Failed to submit report');
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, creating local simulated report', err);
      // Fallback local report creation
      const sev = Number(formData.get('severity') || 1);
      const lik = Number(formData.get('likelihood') || 1);
      const risk = calculateRisk(sev, lik);
      const local = getLocalReports();
      const newReport: HazardReport = {
        id: Date.now(),
        report_number: `RPT-2026-${(local.length + 1).toString().padStart(4, '0')}`,
        reporter_code: String(formData.get('reporter_code') || 'EMP-000').toUpperCase(),
        reporter_name: String(formData.get('reporter_name') || 'عامل موقع'),
        description: String(formData.get('description') || ''),
        hazard_type: String(formData.get('hazard_type') || 'other'),
        location_name: String(formData.get('location_name') || 'الموقع العام'),
        severity: sev,
        likelihood: lik,
        risk_score: risk.score,
        risk_level: risk.level,
        status: 'new',
        image_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status_logs: [
          {
            id: Date.now(),
            changed_by: String(formData.get('reporter_name') || 'العامل'),
            old_status: 'none',
            new_status: 'new',
            comment: 'تم تقديم البلاغ بنجاح وتصنيفه عبر Risk Matrix',
            created_at: new Date().toISOString()
          }
        ]
      };
      local.unshift(newReport);
      saveLocalReports(local);
      return newReport;
    }
  },

  async updateReportStatus(reportId: number, updateData: { new_status: string; changed_by: string; comment?: string; assigned_to?: string; resolution_notes?: string }): Promise<HazardReport> {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, updating local report', err);
      const local = getLocalReports();
      const idx = local.findIndex(r => r.id === reportId);
      if (idx !== -1) {
        local[idx].status = updateData.new_status as any;
        if (updateData.assigned_to) local[idx].assigned_to = updateData.assigned_to;
        if (updateData.resolution_notes) local[idx].resolution_notes = updateData.resolution_notes;
        local[idx].status_logs = local[idx].status_logs || [];
        local[idx].status_logs.unshift({
          id: Date.now(),
          changed_by: updateData.changed_by,
          old_status: local[idx].status,
          new_status: updateData.new_status as any,
          comment: updateData.comment,
          created_at: new Date().toISOString()
        });
        saveLocalReports(local);
        return local[idx];
      }
      throw err;
    }
  },

  async fetchStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (!res.ok) throw new Error('Stats network error');
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, calculating local stats', err);
      const local = getLocalReports();
      const byType: Record<string, number> = {};
      const byRisk: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      const byStatus: Record<string, number> = { new: 0, under_review: 0, in_progress: 0, resolved: 0, closed: 0 };

      local.forEach(r => {
        byType[r.hazard_type] = (byType[r.hazard_type] || 0) + 1;
        byRisk[r.risk_level] = (byRisk[r.risk_level] || 0) + 1;
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      });

      return {
        total_reports: local.length,
        critical_reports: byRisk.critical || 0,
        high_reports: byRisk.high || 0,
        resolved_reports: byStatus.resolved || 0,
        in_progress_reports: (byStatus.in_progress || 0) + (byStatus.under_review || 0),
        new_reports: byStatus.new || 0,
        by_hazard_type: byType,
        by_risk_level: byRisk,
        by_status: byStatus,
        recent_trend: [
          { day: 'السبت', reports: 3, resolved: 2 },
          { day: 'الأحد', reports: 5, resolved: 4 },
          { day: 'الاثنين', reports: 8, resolved: 6 },
          { day: 'الثلاثاء', reports: 6, resolved: 5 },
          { day: 'الأربعاء', reports: 4, resolved: 3 },
          { day: 'الخميس', reports: 7, resolved: 6 },
          { day: 'اليوم', reports: local.length, resolved: byStatus.resolved || 0 }
        ]
      };
    }
  },

  async fetchNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error('Notifications error');
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async fetchUsers(role?: string): Promise<User[]> {
    const query = new URLSearchParams();
    if (role && role !== 'all') query.append('role', role);
    try {
      const res = await fetch(`${API_BASE}/users?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using default users list', err);
      return [];
    }
  },

  async createUser(userData: { employee_code: string; full_name: string; email?: string; role: string; department?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create user' }));
      throw new Error(err.detail || 'Failed to create user');
    }
    return await res.json();
  },

  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update user' }));
      throw new Error(err.detail || 'Failed to update user');
    }
    return await res.json();
  },

  async toggleUserActive(userId: number): Promise<{ status: string; is_active: boolean }> {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to toggle user status');
    return await res.json();
  },

  async login(employeeCode: string, password?: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_code: employeeCode, password: password || 'safety123' })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'فشل تسجيل الدخول' }));
      throw new Error(err.detail || 'بيانات الدخول غير صحيحة');
    }
    return await res.json();
  }
};



export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed';

export interface StatusLog {
  id: number;
  changed_by: string;
  old_status: string;
  new_status: ReportStatus;
  comment?: string;
  created_at: string;
}

export interface HazardReport {
  id: number;
  report_number: string;
  reporter_code: string;
  reporter_name?: string;
  description: string;
  hazard_type: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  severity: number;
  likelihood: number;
  risk_score: number;
  risk_level: RiskLevel;
  status: ReportStatus;
  assigned_to?: string;
  resolution_notes?: string;
  image_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  status_logs?: StatusLog[];
}

export interface RiskCalculation {
  score: number;
  level: RiskLevel;
  label_ar: string;
  color: string;
  badge_bg: string;
  action_ar: string;
  requires_immediate_alert: boolean;
  severity: number;
  likelihood: number;
}

export interface DashboardStats {
  total_reports: number;
  critical_reports: number;
  high_reports: number;
  resolved_reports: number;
  in_progress_reports: number;
  new_reports: number;
  by_hazard_type: Record<string, number>;
  by_risk_level: Record<string, number>;
  by_status: Record<string, number>;
  recent_trend: Array<{ day: string; reports: number; resolved: number }>;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  level: RiskLevel | 'info';
  report_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  employee_code: string;
  full_name: string;
  email?: string;
  role: 'worker' | 'engineer' | 'admin';
  department?: string;
  is_active: boolean;
  created_at: string;
}


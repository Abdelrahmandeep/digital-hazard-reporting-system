import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ReportWizard } from './components/reports/ReportWizard';
import { MyReports } from './components/reports/MyReports';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { AnalyticsCharts } from './components/dashboard/AnalyticsCharts';
import { RiskHeatmap } from './components/dashboard/RiskHeatmap';
import { ReportsFeed } from './components/dashboard/ReportsFeed';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { UsersManager } from './components/users/UsersManager';
import { LoginModal } from './components/auth/LoginModal';
import { LandingPage } from './components/landing/LandingPage';
import { PrototypeView } from './components/prototype/PrototypeView';
import { WhatsAppWidget } from './components/layout/WhatsAppWidget';
import { api } from './services/api';
import { HazardReport, DashboardStats, NotificationItem, ReportStatus, User } from './types';
import { 
  Shield, 
  RefreshCw, 
  Lock, 
  HardHat, 
  LogIn,
  CheckCircle2,
  Clock,
  Award,
  X,
  MessageCircle
} from 'lucide-react';

export const App: React.FC = () => {
  // Start on the flagship Landing Page by default
  const [currentTab, setCurrentTab] = useState<'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports' | 'landing' | 'prototype'>('landing');
  
  // User Authentication & Role State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('dhrs_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const activeRole: 'worker' | 'engineer' | 'admin' = currentUser ? currentUser.role : 'worker';

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dashboardRiskFilter, setDashboardRiskFilter] = useState<string>('all');
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_reports: 0,
    critical_reports: 0,
    high_reports: 0,
    resolved_reports: 0,
    in_progress_reports: 0,
    new_reports: 0,
    by_hazard_type: {},
    by_risk_level: { low: 0, medium: 0, high: 0, critical: 0 },
    by_status: { new: 0, under_review: 0, in_progress: 0, resolved: 0, closed: 0 },
    recent_trend: []
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Floating Toast Notification State
  const [toastInfo, setToastInfo] = useState<{
    reportNumber: string;
    hazardType: string;
    location: string;
    points: number;
  } | null>(null);

  // Load data
  const loadAllData = async () => {
    try {
      const [reportsData, statsData, notifsData] = await Promise.all([
        api.fetchReports(),
        api.fetchStats(),
        api.fetchNotifications(),
      ]);
      setReports(reportsData);
      setStats(statsData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => {
      loadAllData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('dhrs_user', JSON.stringify(user));
    localStorage.setItem('dhrs_token', token);
    // Switch engineer/admin directly to dashboard
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dhrs_user');
    localStorage.removeItem('dhrs_token');
    setCurrentTab('landing');
  };

  const handleReportSuccess = (newReport: HazardReport) => {
    setReports(prev => [newReport, ...prev]);
    loadAllData();
    
    // Trigger floating notification
    setToastInfo({
      reportNumber: newReport.report_number || `RPT-2026-${newReport.id}`,
      hazardType: newReport.hazard_type,
      location: newReport.location_name,
      points: 50
    });

    // Auto-dismiss after 7 seconds
    setTimeout(() => {
      setToastInfo(null);
    }, 7000);
  };

  const handleQuickCriticalAction = () => {
    if (activeRole === 'worker') {
      setIsLoginOpen(true);
    } else {
      setDashboardRiskFilter('critical');
      setCurrentTab('dashboard');
    }
  };

  const handleUpdateStatus = async (
    reportId: number, 
    newStatus: ReportStatus, 
    comment?: string, 
    assignedTo?: string, 
    notes?: string
  ) => {
    if (activeRole === 'worker') {
      setIsLoginOpen(true);
      return;
    }

    const updated = await api.updateReportStatus(reportId, {
      new_status: newStatus,
      changed_by: currentUser?.full_name || (activeRole === 'admin' ? 'مدير المنشأة' : 'مهندس السلامة'),
      comment,
      assigned_to: assignedTo,
      resolution_notes: notes
    });

    setReports(prev => prev.map(r => r.id === reportId ? updated : r));
    api.fetchStats().then(setStats);
  };

  const criticalCount = stats.critical_reports || reports.filter(r => r.risk_level === 'critical' && r.status !== 'resolved' && r.status !== 'closed').length;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'dashboard') setDashboardRiskFilter('all');
          setCurrentTab(tab);
        }}
        onQuickCriticalAction={handleQuickCriticalAction}
        criticalCount={criticalCount}
        activeRole={activeRole}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadNotifications={unreadCount}
      />

      {/* Main Content Area */}
      {currentTab === 'landing' ? (
        <LandingPage
          onGoToReport={() => setCurrentTab('report')}
          onGoToPrototype={() => setCurrentTab('prototype')}
          onGoToMatrix={() => {
            if (activeRole === 'worker') {
              setIsLoginOpen(true);
            } else {
              setCurrentTab('matrix');
            }
          }}
          onGoToDashboard={() => {
            if (activeRole === 'worker') {
              setIsLoginOpen(true);
            } else {
              setDashboardRiskFilter('all');
              setCurrentTab('dashboard');
            }
          }}
        />
      ) : (
        <main className="flex-1 container mx-auto px-4 py-6">
          {/* Tab 0: Solution Prototype Hub */}
          {currentTab === 'prototype' && (
            <PrototypeView 
              onGoToDashboard={() => {
                if (activeRole === 'worker') {
                  setIsLoginOpen(true);
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              onReportCreated={handleReportSuccess}
            />
          )}

          {/* Tab 1: Worker Hazard Reporting */}
          {currentTab === 'report' && (
            <ReportWizard
              onSuccess={handleReportSuccess}
              onViewDashboard={() => {
                if (activeRole === 'worker') {
                  setCurrentTab('my-reports');
                } else {
                  setDashboardRiskFilter('all');
                  setCurrentTab('dashboard');
                }
              }}
            />
          )}

          {/* Tab 2: Worker Personal Reports Tracking */}
          {currentTab === 'my-reports' && (
            <MyReports onNewReportClick={() => setCurrentTab('report')} />
          )}

          {/* Tab 3: Safety Engineer & Admin Dashboard */}
          {currentTab === 'dashboard' && (
            activeRole === 'worker' ? (
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">منطقة مخصصة لكادر السلامة والإدارة</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  لوحة التحكم المركزية مخصصة لمهندسي السلامة وإدارة المنشأة لرصد المؤشرات وتحديث الحالات وفقاً لمعايير التدقيق.
                </p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل دخول الكادر الفني</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Top Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <span>لوحة تحكم مهندس السلامة وإدارة المخاطر</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        مباشر (Live)
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      رصد ومتابعة البلاغات الميدانية وتحديث حالات المعالجة وسجل التدقيق الفوري
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadAllData}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تحديث البيانات</span>
                    </button>
                  </div>
                </div>

                {/* Metrics cards */}
                <StatsOverview 
                  stats={stats} 
                  onFilterByRisk={(level) => setDashboardRiskFilter(level)}
                />

                {/* Analytics charts */}
                <AnalyticsCharts stats={stats} />

                {/* Reports Feed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>جدول البلاغات الميدانية وسجل التدقيق (Audit Logs)</span>
                    </h3>
                  </div>
                  <ReportsFeed
                    reports={reports}
                    onUpdateStatus={handleUpdateStatus}
                    activeRole={activeRole}
                    filterRisk={dashboardRiskFilter}
                    onFilterRiskChange={setDashboardRiskFilter}
                  />
                </div>
              </div>
            )
          )}

          {/* Tab 4: Dedicated 5x5 Risk Matrix View */}
          {currentTab === 'matrix' && (
            activeRole === 'worker' ? (
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">مصفوفة المخاطر الإحصائية الشاملة</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تحليل التوزيع التكراري لمصفوفة 5x5 متاح للكوادر الفنية والإدارية فقط.
                </p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل دخول الكادر الفني</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="pb-2 border-b border-slate-800">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    مصفوفة تقييم المخاطر 5x5 والتوزيع الميداني
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    معيار تقييم شدة الأثر واحتمالية الحدوث المتوافق مع معايير السلامة المهنية ISO 45001 و OSHA
                  </p>
                </div>

                <RiskHeatmap 
                  reports={reports} 
                  onGoToDashboard={(level) => {
                    if (level) setDashboardRiskFilter(level);
                    setCurrentTab('dashboard');
                  }}
                />
              </div>
            )
          )}

          {/* Tab 5: User Management (Admin Only) */}
          {currentTab === 'users' && (
            activeRole !== 'admin' ? (
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">إدارة المستخدمين مقصورة على مدير المنشأة</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يلزم تسجيل الدخول بحساب مدير المنشأة (ADM-001) لإدارة الكوادر والمشرفين والصلاحيات.
                </p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول كمدير</span>
                </button>
              </div>
            ) : (
              <UsersManager />
            )
          )}
        </main>
      )}

      {/* Floating Report Success Toast */}
      {toastInfo && (
        <div className="fixed bottom-5 left-4 right-4 sm:right-auto sm:left-6 z-50 max-w-md bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3 text-right">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {toastInfo.reportNumber}
                </span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{toastInfo.points} نقطة أمان</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">تم تسجيل البلاغ وإشعار فريق السلامة!</h4>
              <p className="text-xs text-slate-300 truncate">
                {toastInfo.hazardType} — {toastInfo.location}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>الاستجابة المعتمدة (SLA): خلال 15 دقيقة</span>
                </span>
                <button
                  onClick={() => {
                    setToastInfo(null);
                    if (activeRole === 'worker') {
                      setCurrentTab('my-reports');
                    } else {
                      setCurrentTab('dashboard');
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                >
                  {activeRole === 'worker' ? 'عرض في بلاغاتي' : 'عرض في اللوحة'} ←
                </button>
              </div>
            </div>
            <button
              onClick={() => setToastInfo(null)}
              className="text-slate-500 hover:text-white p-1 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global WhatsApp Direct Floating Widget */}
      <WhatsAppWidget />

      {/* Staff Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onSelectNotification={(reportId) => {
          if (activeRole !== 'worker') {
            setDashboardRiskFilter('all');
            setCurrentTab('dashboard');
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-500 mt-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400 font-medium">Digital Hazard Reporting System — النسخة التشغيلية المتكاملة v2.0</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400">
            <span>متوافق مع معايير ISO 45001 & OSHA</span>
            <span>•</span>
            <a
              href="https://wa.me/201069218392?text=%E2%9A%A0%EF%B8%8F%20%D8%A8%D9%84%D8%A7%D8%BA%20%D8%AE%D8%B7%D8%B1%20%D8%B9%D8%A7%D8%AC%D9%84%20%5BDHRS%5D%0A%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%3A%20%D8%B9%D9%86%D8%A8%D8%B1%203%20-%20%D9%88%D8%B1%D8%B4%D8%A9%20%D8%A7%D9%84%D9%84%D8%AD%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A%D8%A9%0A%D9%86%D9%88%D8%B9%20%D8%A7%D9%84%D8%AE%D8%B7%D8%B1%3A%20%D9%83%D8%A7%D8%A8%D9%84%20%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A6%D9%8A%20%D9%85%D9%83%D8%B4%D9%88%D9%81%20%D9%88%D9%85%D9%8A%D8%A7%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A3%D8%B1%D8%B6%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1%20%D8%A8%D8%AA%D8%B4%D8%B1%D8%B2%20%D8%AC%D8%A7%D9%85%D8%AF%21%0A%D8%A8%D8%B1%D8%AC%D8%A7%D8%A1%20%D8%A7%D9%84%D8%AA%D8%AF%D8%AE%D9%84%20%D8%A7%D9%84%D9%81%D9%88%D8%B1%D9%8A%20%D9%88%D8%AA%D9%88%D8%AC%D9%8A%D9%87%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9."
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>واتساب البلاغات: 01069218392</span>
            </a>
            <span>•</span>
            <span className="font-mono text-amber-500">
              الدور الحالي: {activeRole === 'admin' ? 'مدير المنشأة' : activeRole === 'engineer' ? 'مهندس سلامة' : 'عامل موقع (دخول فوري)'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { 
  AlertTriangle, 
  LayoutDashboard, 
  PlusCircle, 
  Grid3X3, 
  Bell, 
  Users, 
  HardHat,
  Radio,
  LogIn,
  LogOut,
  FileText,
  Wrench,
  Briefcase,
  Shield
} from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentTab: 'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports';
  onSelectTab: (tab: 'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports') => void;
  onQuickCriticalAction: () => void;
  criticalCount: number;
  activeRole: 'worker' | 'engineer' | 'admin';
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotifications: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onQuickCriticalAction,
  criticalCount,
  activeRole,
  currentUser,
  onOpenLoginModal,
  onLogout,
  onOpenNotifications,
  unreadNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      {/* Critical Alert Bar: Only visible to Engineer and Admin */}
      {criticalCount > 0 && activeRole !== 'worker' && (
        <div className="bg-red-500/15 border-b border-red-500/30 text-red-200 px-4 py-1.5 text-xs md:text-sm font-medium flex items-center justify-between animate-pulse">
          <div className="container mx-auto flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-spin" />
            <span>
              <strong>تنبيه طوارئ نشط:</strong> يوجد {criticalCount} بلاغ بمستوى خطورة <span className="underline font-bold">حرج / طارئ</span> يتطلب تدخلاً فورياً!
            </span>
          </div>
          <button 
            onClick={onQuickCriticalAction} 
            className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <span>متابعة فورية</span>
            <span>◄</span>
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>نظام الإبلاغ الرقمي عن المخاطر</span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                DHRS v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Digital Hazard Reporting & Real-time Risk Matrix</p>
          </div>
        </div>

        {/* Dynamic RBAC Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {/* 1. Worker Specific Tabs */}
          {activeRole === 'worker' && (
            <>
              <button
                onClick={() => onSelectTab('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'report'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>إبلاغ جديد</span>
              </button>

              <button
                onClick={() => onSelectTab('my-reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'my-reports'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>بلاغاتي السابقة</span>
              </button>
            </>
          )}

          {/* 2. Engineer & Admin Tabs */}
          {(activeRole === 'engineer' || activeRole === 'admin') && (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة التحكم</span>
                {criticalCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('matrix')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'matrix'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>مصفوفة 5x5</span>
              </button>

              <button
                onClick={() => onSelectTab('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'report'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>إبلاغ جديد</span>
              </button>
            </>
          )}

          {/* 3. Admin Exclusive Tab */}
          {activeRole === 'admin' && (
            <button
              onClick={() => onSelectTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المستخدمين</span>
            </button>
          )}
        </nav>

        {/* Right Section: Role Identity, Login & Notifications */}
        <div className="flex items-center gap-2">
          {/* Notifications Button (Only visible to Engineer and Admin) */}
          {activeRole !== 'worker' && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
              title="الإشعارات والتنبيهات الفنية"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </button>
          )}

          {/* Role Status and Actions */}
          {activeRole === 'worker' ? (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دخول الكادر الفني / الإدارة</span>
              <span className="sm:hidden">دخول</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                {activeRole === 'engineer' ? (
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                )}
                <div className="text-right">
                  <span className="font-bold text-white block leading-none">
                    {currentUser?.full_name || (activeRole === 'engineer' ? 'م. كريم عبد الرحمن' : 'د. وليد النجار')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeRole === 'engineer' ? 'مهندس سلامة' : 'مدير المنشأة'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition cursor-pointer"
                title="تسجيل الخروج والعودة لوضع العامل"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

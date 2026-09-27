import React, { useState } from 'react';
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
  Shield,
  Globe,
  Sparkles,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentTab: 'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports' | 'landing' | 'prototype';
  onSelectTab: (tab: 'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports' | 'landing' | 'prototype') => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'report' | 'dashboard' | 'matrix' | 'users' | 'my-reports' | 'landing' | 'prototype') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      {/* Critical Alert Bar: Only visible to Engineer and Admin */}
      {criticalCount > 0 && activeRole !== 'worker' && (
        <div className="bg-red-500/15 border-b border-red-500/30 text-red-200 px-4 py-1.5 text-xs md:text-sm font-medium flex items-center justify-between animate-pulse">
          <div className="container mx-auto flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">
              <strong>تنبيه طوارئ نشط:</strong> يوجد {criticalCount} بلاغ <span className="underline font-bold">حرج / طارئ</span> يتطلب تدخلاً فورياً!
            </span>
          </div>
          <button 
            onClick={onQuickCriticalAction} 
            className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-bold shadow-md shadow-red-600/30 transition flex items-center gap-1 active:scale-95 cursor-pointer shrink-0 mr-2"
          >
            <span>متابعة</span>
            <span>◄</span>
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div 
          onClick={() => handleTabClick('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="العودة لصفحة البداية"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>نظام الإبلاغ الرقمي</span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                DHRS v2.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">Digital Hazard Reporting & Real-time Risk Matrix</p>
          </div>
        </div>

        {/* Desktop Dynamic Navigation Tabs (Hidden on mobile) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {/* Public Landing Page */}
          <button
            onClick={() => handleTabClick('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'landing'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>صفحة الهبوط والرؤية</span>
          </button>

          {/* Prototype Simulator Tab */}
          <button
            onClick={() => handleTabClick('prototype')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'prototype'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>البروتوتايب العملي</span>
          </button>

          {/* 1. Worker Specific Tabs */}
          {activeRole === 'worker' && (
            <>
              <button
                onClick={() => handleTabClick('report')}
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
                onClick={() => handleTabClick('my-reports')}
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
                onClick={() => handleTabClick('dashboard')}
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
                onClick={() => handleTabClick('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'matrix'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>مصفوفة 5x5</span>
              </button>

              <button
                onClick={() => handleTabClick('report')}
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
              onClick={() => handleTabClick('users')}
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

        {/* Right Section: Role Identity, Login, Notifications & Mobile Toggle */}
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

          {/* Direct WhatsApp Link to 01069218392 */}
          <a
            href="https://wa.me/201069218392?text=%E2%9A%A0%EF%B8%8F%20%D8%A8%D9%84%D8%A7%D8%BA%20%D8%AE%D8%B7%D8%B1%20%D8%B9%D8%A7%D8%AC%D9%84%20%5BDHRS%5D%0A%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%3A%20%D8%B9%D9%86%D8%A8%D8%B1%203%20-%20%D9%88%D8%B1%D8%B4%D8%A9%20%D8%A7%D9%84%D9%84%D8%AD%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A%D8%A9%0A%D9%86%D9%88%D8%B9%20%D8%A7%D9%84%D8%AE%D8%B7%D8%B1%3A%20%D9%83%D8%A7%D8%A8%D9%84%20%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A6%D9%8A%20%D9%85%D9%83%D8%B4%D9%88%D9%81%20%D9%88%D9%85%D9%8A%D8%A7%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A3%D8%B1%D8%B6%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1%20%D8%A8%D8%AA%D8%B4%D8%B1%D8%B2%20%D8%AC%D8%A7%D9%85%D8%AF%21%0A%D8%A8%D8%B1%D8%AC%D8%A7%D8%A1%20%D8%A7%D9%84%D8%AA%D8%AF%D8%AE%D9%84%20%D8%A7%D9%84%D9%81%D9%88%D8%B1%D9%8A%20%D9%88%D8%AA%D9%88%D8%AC%D9%8A%D9%87%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9."
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
            title="إرسال بلاغ واتساب مباشر إلى 01069218392"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xl:inline">واتساب: 01069218392</span>
            <span className="xl:hidden">واتساب</span>
          </a>

          {/* Role Status and Actions */}
          {activeRole === 'worker' ? (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دخول الكادر الفني</span>
              <span className="sm:hidden">دخول</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
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

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {/* Landing Page */}
            <button
              onClick={() => handleTabClick('landing')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                currentTab === 'landing'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>صفحة الهبوط</span>
            </button>

            {/* Prototype */}
            <button
              onClick={() => handleTabClick('prototype')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                currentTab === 'prototype'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>البروتوتايب</span>
            </button>

            {/* Report */}
            <button
              onClick={() => handleTabClick('report')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                currentTab === 'report'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>إبلاغ جديد</span>
            </button>

            {/* My Reports */}
            {activeRole === 'worker' && (
              <button
                onClick={() => handleTabClick('my-reports')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                  currentTab === 'my-reports'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>بلاغاتي</span>
              </button>
            )}

            {/* Dashboard (Staff) */}
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                currentTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>لوحة التحكم</span>
            </button>

            {/* 5x5 Matrix */}
            <button
              onClick={() => handleTabClick('matrix')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                currentTab === 'matrix'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-emerald-400" />
              <span>مصفوفة 5x5</span>
            </button>

            {/* Users (Admin Only) */}
            {activeRole === 'admin' && (
              <button
                onClick={() => handleTabClick('users')}
                className={`col-span-2 flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-right ${
                  currentTab === 'users'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>إدارة المستخدمين والصلاحيات</span>
              </button>
            )}

            {/* Mobile WhatsApp Direct Button */}
            <a
              href="https://wa.me/201069218392?text=%E2%9A%A0%EF%B8%8F%20%D8%A8%D9%84%D8%A7%D8%BA%20%D8%AE%D8%B7%D8%B1%20%D8%B9%D8%A7%D8%AC%D9%84%20%5BDHRS%5D%0A%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%3A%20%D8%B9%D9%86%D8%A8%D8%B1%203%20-%20%D9%88%D8%B1%D8%B4%D8%A9%20%D8%A7%D9%84%D9%84%D8%AD%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A%D8%A9%0A%D9%86%D9%88%D8%B9%20%D8%A7%D9%84%D8%AE%D8%B7%D8%B1%3A%20%D9%83%D8%A7%D8%A8%D9%84%20%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A6%D9%8A%20%D9%85%D9%83%D8%B4%D9%88%D9%81%20%D9%88%D9%85%D9%8A%D8%A7%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A3%D8%B1%D8%B6%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1%20%D8%A8%D8%AA%D8%B4%D8%B1%D8%B2%20%D8%AC%D8%A7%D9%85%D8%AF%21%0A%D8%A8%D8%B1%D8%AC%D8%A7%D8%A1%20%D8%A7%D9%84%D8%AA%D8%AF%D8%AE%D9%84%20%D8%A7%D9%84%D9%81%D9%88%D8%B1%D9%8A%20%D9%88%D8%AA%D9%88%D8%AC%D9%8A%D9%87%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9."
              target="_blank"
              rel="noreferrer"
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/30"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>إبلاغ فوري عبر واتساب: 01069218392 ◄</span>
            </a>
          </div>

          {/* Mobile Current User status footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              الحساب الحالي: <strong className="text-white">{currentUser?.full_name || 'عامل موقع (دخول مباشر)'}</strong>
            </span>
            {activeRole === 'worker' ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="text-amber-400 font-bold hover:underline"
              >
                دخول الكادر الفني
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-red-400 font-bold hover:underline"
              >
                خروج
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

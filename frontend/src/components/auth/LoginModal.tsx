import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  User as UserIcon, 
  Wrench, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  HardHat,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (codeToUse?: string, passToUse?: string) => {
    const targetCode = (codeToUse || employeeCode).trim();
    if (!targetCode) {
      setErrorMessage('يرجى إدخال كود الموظف أولاً');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login(targetCode, passToUse || password || 'safety123');
      onLoginSuccess(res.user, res.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تسجيل الدخول. يرجى التحقق من الكود.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            تسجيل دخول الكادر الفني والإداري
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            صلاحيات إدارة البلاغات، مصفوفة المخاطر، والتدقيق الميداني
          </p>
        </div>

        {/* Worker Notice Callout */}
        <div className="mb-6 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-start gap-3 text-xs text-blue-200">
          <HardHat className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">👷 تنبيه لعمال الموقع:</span>
            لست بحاجة لأي كلمة سر أو تسجيل دخول معقد! يمكنك التبليغ مباشرة وإدخال كودك الميداني فقط ومتابعة بلاغاتك بحرية.
          </div>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="space-y-2.5 mb-6">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span>⚡ الدخول التجريبي السريع (ضغطة واحدة):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Engineer preset */}
            <button
              type="button"
              onClick={() => handleLogin('ENG-101', 'safety123')}
              disabled={isLoading}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/40 text-right group transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">مهندس سلامة</div>
                  <div className="text-[10px] text-slate-400 font-mono">ENG-101 (م. كريم)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:-translate-x-1" />
            </button>

            {/* Admin preset */}
            <button
              type="button"
              onClick={() => handleLogin('ADM-001', 'admin123')}
              disabled={isLoading}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 hover:bg-purple-500/10 border border-slate-700/80 hover:border-purple-500/40 text-right group transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-400 transition">مدير المنشأة</div>
                  <div className="text-[10px] text-slate-400 font-mono">ADM-001 (د. وليد)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-xs">أو تسجيل الدخول اليدوي</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كود الموظف أو البريد الوظيفي
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="مثال: ENG-101 أو ADM-001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono uppercase"
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كلمة المرور / الرمز السري
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              (كلمة المرور الافتراضية للتجربة: <span className="font-mono text-slate-400">safety123</span>)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>دخول النظام وتفعيل الصلاحيات</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

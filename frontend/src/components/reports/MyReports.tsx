import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  HardHat, 
  PlusCircle, 
  RefreshCw,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { HazardReport } from '../../types';
import { api } from '../../services/api';

interface MyReportsProps {
  onNewReportClick: () => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onNewReportClick }) => {
  const [workerCode, setWorkerCode] = useState(() => {
    return localStorage.getItem('dhrs_reporter_code') || 'EMP-408';
  });
  const [tempCode, setTempCode] = useState(workerCode);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyReports = async (codeToFetch: string) => {
    if (!codeToFetch.trim()) return;
    setIsLoading(true);
    try {
      const data = await api.fetchReports({ reporter_code: codeToFetch.trim().toUpperCase() });
      setReports(data);
      localStorage.setItem('dhrs_reporter_code', codeToFetch.trim().toUpperCase());
    } catch (err) {
      console.error('Failed to load my reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports(workerCode);
  }, [workerCode]);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCode.trim()) {
      setWorkerCode(tempCode.trim().toUpperCase());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>تم الحل والمعالجة</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>جاري المعالجة والإصلاح</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold">
            <Search className="w-3.5 h-3.5" />
            <span>قيد المعاينة الميدانية</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>تم الاستلام (جديد)</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Worker Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                سجل بلاغاتي الميدانية
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                متابعة حالة المخاطر التي أبلغت عنها وتحديثات مهندس السلامة
              </p>
            </div>
          </div>

          <button
            onClick={onNewReportClick}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إبلاغ عن خطر جديد</span>
          </button>
        </div>

        {/* Worker Code Quick Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            أنت تستعرض البلاغات المسجلة بكود: <span className="font-mono font-bold text-amber-400 px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">{workerCode}</span>
          </div>

          <form onSubmit={handleApplyCode} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="تغيير كود الموظف..."
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
            >
              تطبيق
            </button>
            <button
              type="button"
              onClick={() => fetchMyReports(workerCode)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="تحديث"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </form>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-3xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
            <p className="text-sm">جاري جلب بلاغاتك الميدانية...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">لا توجد بلاغات مسجلة بهذا الكود حتى الآن</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
              إذا لاحظت أي خطر في موقع عملك أو ورشتك، أبلغ عنه فوراً ليتحرك فريق السلامة لمعالجته وحماية الجميع.
            </p>
            <button
              onClick={onNewReportClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إرسال أول بلاغ ميداني الآن</span>
            </button>
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition shadow-lg space-y-4"
            >
              {/* Header: Number, Status, Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">{report.report_number}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(report.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                  </span>
                </div>
                <div>{getStatusBadge(report.status)}</div>
              </div>

              {/* Description & Photo */}
              <div className="flex flex-col md:flex-row gap-4">
                {report.image_url && (
                  <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img 
                      src={report.image_url} 
                      alt="دليل البلاغ" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {report.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{report.location_name}</span>
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      مستوى الخطورة: {report.risk_level === 'critical' ? '🔴 طارئ' : report.risk_level === 'high' ? '🟠 مرتفع' : report.risk_level === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Note if available */}
              {report.resolution_notes && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      ملاحظات المعالجة ({report.assigned_to || 'مهندس السلامة'}):
                    </span>
                    <p className="text-emerald-300/90 leading-relaxed">{report.resolution_notes}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Clock, 
  AlertOctagon, 
  CheckCircle, 
  FileText, 
  ExternalLink,
  ChevronDown,
  History,
  ShieldCheck,
  Send,
  X,
  AlertTriangle,
  Zap,
  Cog,
  FlaskConical,
  Flame,
  Building,
  ShieldAlert,
  Wind,
  HelpCircle
} from 'lucide-react';
import { HazardReport, ReportStatus } from '../../types';
import { calculateRisk, STATUS_LABELS } from '../../utils/riskMatrix';

interface ReportsFeedProps {
  reports: HazardReport[];
  onUpdateStatus: (reportId: number, newStatus: ReportStatus, comment?: string, assignedTo?: string, notes?: string) => Promise<void>;
  activeRole: 'worker' | 'engineer' | 'admin';
  filterRisk?: string;
  onFilterRiskChange?: (risk: string) => void;
}

export const ReportsFeed: React.FC<ReportsFeedProps> = ({
  reports,
  onUpdateStatus,
  activeRole,
  filterRisk,
  onFilterRiskChange,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>(filterRisk || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<HazardReport | null>(null);

  React.useEffect(() => {
    if (filterRisk) {
      setSelectedRisk(filterRisk);
    }
  }, [filterRisk]);


  // Status modal state
  const [modalNewStatus, setModalNewStatus] = useState<ReportStatus>('in_progress');
  const [modalAssignedTo, setModalAssignedTo] = useState('');
  const [modalComment, setModalComment] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (selectedRisk !== 'all' && r.risk_level !== selectedRisk) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const match = 
        r.report_number.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.location_name.toLowerCase().includes(s) ||
        r.reporter_code.toLowerCase().includes(s) ||
        (r.reporter_name && r.reporter_name.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenDetailModal = (report: HazardReport) => {
    setActiveReport(report);
    setModalNewStatus(report.status);
    setModalAssignedTo(report.assigned_to || (activeRole === 'engineer' ? 'م. كريم عبد الرحمن (سلامة)' : ''));
    setModalComment('');
    setModalNotes(report.resolution_notes || '');
  };

  const handleSaveStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(
        activeReport.id,
        modalNewStatus,
        modalComment || `تحديث الحالة إلى ${STATUS_LABELS[modalNewStatus]?.ar || modalNewStatus}`,
        modalAssignedTo,
        modalNotes
      );
      // Close modal
      setActiveReport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderHazardIcon = (type: string) => {
    switch (type) {
      case 'electrical': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'mechanical': return <Cog className="w-3.5 h-3.5 text-blue-400" />;
      case 'slip_fall': return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'chemical': return <FlaskConical className="w-3.5 h-3.5 text-purple-400" />;
      case 'fire': return <Flame className="w-3.5 h-3.5 text-red-400" />;
      case 'structural': return <Building className="w-3.5 h-3.5 text-stone-300" />;
      case 'ppe': return <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />;
      case 'environmental': return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم البلاغ، الوصف، الموقع، أو كود الموظف..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filter by Risk Level */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">الخطورة:</span>
          <button
            onClick={() => setSelectedRisk('all')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRisk === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            الكل ({reports.length})
          </button>
          <button
            onClick={() => setSelectedRisk('critical')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              selectedRisk === 'critical'
                ? 'bg-red-500 text-white font-bold'
                : 'bg-slate-900 text-red-400 hover:bg-slate-800'
            }`}
          >
            <span>حرج</span>
            <span className="font-mono text-[10px]">({reports.filter(r => r.risk_level === 'critical').length})</span>
          </button>
          <button
            onClick={() => setSelectedRisk('high')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              selectedRisk === 'high'
                ? 'bg-orange-500 text-white font-bold'
                : 'bg-slate-900 text-orange-400 hover:bg-slate-800'
            }`}
          >
            <span>عالي</span>
            <span className="font-mono text-[10px]">({reports.filter(r => r.risk_level === 'high').length})</span>
          </button>
          <button
            onClick={() => setSelectedRisk('medium')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRisk === 'medium'
                ? 'bg-yellow-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-yellow-400 hover:bg-slate-800'
            }`}
          >
            متوسط
          </button>
          <button
            onClick={() => setSelectedRisk('low')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRisk === 'low'
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            منخفض
          </button>
        </div>

        {/* Filter by Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all">كل الحالات</option>
          <option value="new">جديد وغير مراجع</option>
          <option value="under_review">تحت المراجعة</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">تم الحل</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-white mb-1">لا توجد بلاغات تطابق شروط البحث</h4>
          <p className="text-xs">جرب تغيير كلمات البحث أو إلغاء الفلاتر المحددة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const risk = calculateRisk(report.severity, report.likelihood);
            const statusInfo = STATUS_LABELS[report.status] || STATUS_LABELS.new;
            const dateStr = new Date(report.created_at).toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={report.id}
                className="glass-panel glass-panel-hover p-4 rounded-2xl flex flex-col justify-between border-slate-800 hover:border-slate-700 relative overflow-hidden"
              >
                {/* Top Strip by Risk Level */}
                <div 
                  className="absolute top-0 right-0 left-0 h-1" 
                  style={{ backgroundColor: risk.color }}
                ></div>

                <div>
                  {/* Header: ID, Hazard Type & Risk Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {report.report_number}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${risk.badge_bg}`}>
                      <AlertOctagon className="w-3 h-3" />
                      <span>{risk.label_ar} ({risk.score}/25)</span>
                    </span>
                  </div>

                  {/* Hazard Image (if any) */}
                  {report.image_url && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800 relative group cursor-pointer"
                         onClick={() => handleOpenDetailModal(report)}>
                      <img 
                        src={report.image_url} 
                        alt={report.description} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] text-white/90 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {renderHazardIcon(report.hazard_type)}
                          <span>{report.hazard_type}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Location & Time */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="text-slate-300">{report.location_name}</span>
                    </span>
                    <span className="font-mono text-slate-500 whitespace-nowrap">{dateStr}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-200 line-clamp-3 mb-3 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Footer: Reporter, Status & Action */}
                <div className="pt-3 border-t border-slate-800/80 mt-auto">
                  <div className="flex items-center justify-between mb-2 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{report.reporter_code}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.ar}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenDetailModal(report)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold text-xs transition border border-slate-800 hover:border-amber-500 flex items-center justify-center gap-1.5"
                  >
                    <span>متابعة وتحديث الحالة</span>
                    <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal & Status Update Dialog */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border-slate-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setActiveReport(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <span className="font-mono text-sm font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeReport.report_number}
              </span>
              <h3 className="text-base font-bold text-white">تفاصيل ومتابعة البلاغ</h3>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              {/* Photo Evidence */}
              {activeReport.image_url && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 max-h-56 flex items-center justify-center">
                  <img src={activeReport.image_url} alt="إثبات الخطر" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">موقع الخطر</span>
                  <span className="font-semibold text-white">{activeReport.location_name}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">مقدم البلاغ</span>
                  <span className="font-semibold text-white">{activeReport.reporter_name} ({activeReport.reporter_code})</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">درجة الخطورة 5x5</span>
                  <span className="font-semibold text-amber-400">
                    {calculateRisk(activeReport.severity, activeReport.likelihood).label_ar} ({activeReport.risk_score}/25)
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] mb-1">وصف الخطر المسجل:</span>
                <p className="text-slate-200 leading-relaxed">{activeReport.description}</p>
              </div>

              {/* Engineer Update Form or Worker Read-only View */}
              {activeRole === 'worker' ? (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-300">وضع القراءة فقط (صلاحيات عامل موقع)</div>
                  <p className="text-[11px] text-slate-400">
                    تحديث الحالات وتكليف المهندسين مقتصر على كوادر السلامة وإدارة المنشأة بعد تسجيل الدخول.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveStatusChange} className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>تحديث الحالة وإجراءات مهندس السلامة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        حالة البلاغ الجديدة
                      </label>
                      <select
                        value={modalNewStatus}
                        onChange={(e) => setModalNewStatus(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                      >
                        <option value="new">جديد وغير مراجع</option>
                        <option value="under_review">تحت المراجعة والفحص</option>
                        <option value="in_progress">قيد المعالجة والإصلاح الفعلي</option>
                        <option value="resolved">تم الحل وعزل الخطر نهائياً</option>
                        <option value="closed">مغلق ومؤرشف</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        المهندس / الفريق المسؤول المكلف
                      </label>
                      <input
                        type="text"
                        value={modalAssignedTo}
                        onChange={(e) => setModalAssignedTo(e.target.value)}
                        placeholder="مثال: م. كريم عبد الرحمن"
                        className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      الإجراءات التصحيحية المتخذة وملاحظات الحل
                    </label>
                    <textarea
                      rows={2}
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      placeholder="ما الإجراء الذي تم لتأمين الموقع؟ (مثال: تم فصل القاطع واستبدال السلك المعطوب بالكامل)"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveReport(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'جاري الحفظ...' : 'حفظ التحديث وسجل التدقيق'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Audit Trail History Logs */}
              {activeReport.status_logs && activeReport.status_logs.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>سجل التدقيق والتحديثات غير القابل للتعديل (Audit Trail)</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {activeReport.status_logs.map((log) => (
                      <div key={log.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-white">{log.changed_by}: </span>
                          <span className="text-slate-300">{log.comment}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                          {new Date(log.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

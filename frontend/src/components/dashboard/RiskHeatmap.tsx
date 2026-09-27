import React, { useState } from 'react';
import { 
  Grid3X3, 
  Info, 
  AlertOctagon, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  User as UserIcon,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { HazardReport } from '../../types';
import { calculateRisk, SEVERITY_SCALE, LIKELIHOOD_SCALE } from '../../utils/riskMatrix';

interface RiskHeatmapProps {
  reports: HazardReport[];
  onSelectCell?: (severity: number, likelihood: number) => void;
  onGoToDashboard?: (filterRisk?: string) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ 
  reports, 
  onSelectCell,
  onGoToDashboard 
}) => {
  const [selectedCell, setSelectedCell] = useState<{ s: number; l: number } | null>(null);

  // Group reports by [severity][likelihood]
  const matrixCounts: Record<string, number> = {};
  reports.forEach(r => {
    const key = `${r.severity}-${r.likelihood}`;
    matrixCounts[key] = (matrixCounts[key] || 0) + 1;
  });

  const likelihoodRows = [5, 4, 3, 2, 1]; // Top to bottom
  const severityCols = [1, 2, 3, 4, 5];   // Left to right

  const handleCellClick = (s: number, l: number) => {
    // If clicking same cell, toggle it off
    if (selectedCell && selectedCell.s === s && selectedCell.l === l) {
      setSelectedCell(null);
      if (onSelectCell) onSelectCell(0, 0);
    } else {
      setSelectedCell({ s, l });
      if (onSelectCell) onSelectCell(s, l);
    }
  };

  const activeRiskDetails = selectedCell ? calculateRisk(selectedCell.s, selectedCell.l) : null;

  // Filter reports that match the selected cell
  const matchingReports = selectedCell
    ? reports.filter(r => r.severity === selectedCell.s && r.likelihood === selectedCell.l)
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">تم الحل والإغلاق</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">جاري المعالجة</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">قيد المراجعة الفنية</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">بلاغ جديد (غير معالج)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. The Matrix Container Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-amber-400" />
              <span>مصفوفة تقييم المخاطر الميدانية (5x5 Risk Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              اضغط على أي مربع لفحص تقاطع الشدة والاحتمالية واستعراض البلاغات الواقعة فيه مباشرة دون مغادرة الصفحة
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="w-3 h-3 rounded-full bg-red-600"></span> حرج (17-25)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> عالي (10-16)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span> متوسط (6-9)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span> منخفض (1-5)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* The Matrix Grid */}
          <div className="lg:col-span-2 overflow-x-auto pb-2">
            <div className="min-w-[480px]">
              {/* Header X: Severity */}
              <div className="text-center text-xs font-bold text-amber-400 mb-3 bg-slate-950/80 py-1.5 rounded-xl border border-slate-800">
                شدة الأثر والضرر المتوقع (Severity) ◄
              </div>

              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {/* Corner header */}
                <div className="p-2 font-bold text-slate-400 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/60">
                  الاحتمالية ▼
                </div>
                {severityCols.map(s => (
                  <div key={`col-${s}`} className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-semibold shadow-inner">
                    <div className="text-[10px] text-amber-400 font-mono">درجة {s}</div>
                    <div className="text-xs mt-0.5">{SEVERITY_SCALE[s - 1].label}</div>
                  </div>
                ))}

                {/* Rows */}
                {likelihoodRows.map(l => (
                  <React.Fragment key={`row-${l}`}>
                    {/* Row Header */}
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-semibold flex flex-col justify-center shadow-inner">
                      <span className="text-[10px] text-amber-400 font-mono">درجة {l}</span>
                      <span className="text-xs line-clamp-1">{LIKELIHOOD_SCALE[l - 1].label}</span>
                    </div>

                    {/* 5 Cells in this row */}
                    {severityCols.map(s => {
                      const score = s * l;
                      const count = matrixCounts[`${s}-${l}`] || 0;
                      const isSelected = selectedCell?.s === s && selectedCell?.l === l;

                      // Color based on risk level
                      let bgClass = '';
                      if (score >= 17) bgClass = 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40';
                      else if (score >= 10) bgClass = 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border-orange-500/40';
                      else if (score >= 6) bgClass = 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/40';
                      else bgClass = 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40';

                      return (
                        <button
                          type="button"
                          key={`cell-${s}-${l}`}
                          onClick={() => handleCellClick(s, l)}
                          className={`h-16 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${bgClass} ${
                            isSelected ? 'ring-4 ring-amber-400 scale-105 shadow-2xl z-10 font-black' : 'hover:scale-102'
                          }`}
                          title={`الشدة ${s} × الاحتمالية ${l} = درجة ${score}`}
                        >
                          <span className="text-base font-black font-mono">{score}</span>
                          {count > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/90 text-white border border-white/20 mt-1 shadow-sm">
                              {count} بلاغ
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400/60 mt-1">0</span>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Cell Inspector Sidebar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-4 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>فاحص الخلية المحددة</span>
                </span>
                {selectedCell && (
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>إلغاء</span>
                  </button>
                )}
              </div>

              {activeRiskDetails ? (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className={`p-4 rounded-xl border ${activeRiskDetails.badge_bg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black font-mono">الدرجة: {activeRiskDetails.score} / 25</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80">
                        {activeRiskDetails.label_ar}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-slate-300">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 block font-bold mb-0.5">مستوى الشدة ({activeRiskDetails.severity}/5):</span>
                      <span className="font-semibold text-white">{SEVERITY_SCALE[activeRiskDetails.severity - 1].label} — </span>
                      <span className="text-slate-400">{SEVERITY_SCALE[activeRiskDetails.severity - 1].desc}</span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 block font-bold mb-0.5">مستوى الاحتمالية ({activeRiskDetails.likelihood}/5):</span>
                      <span className="font-semibold text-white">{LIKELIHOOD_SCALE[activeRiskDetails.likelihood - 1].label} — </span>
                      <span className="text-slate-400">{LIKELIHOOD_SCALE[activeRiskDetails.likelihood - 1].desc}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <span className="text-amber-400 font-bold block mb-1">البروتوكول الصناعي المعتمد:</span>
                    <p className="text-slate-300 leading-relaxed">{activeRiskDetails.action_ar}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <Grid3X3 className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />
                  <p className="font-semibold text-slate-300">لم يتم اختيار أي مربع بعد</p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    اضغط على أي مربع في شبكة 5x5 لعرض تفاصيله وبلاغاته مباشرة بالأسفل
                  </p>
                </div>
              )}
            </div>

            {selectedCell && (
              <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
                <div className="text-center text-xs text-slate-400">
                  يوجد <strong className="text-white font-mono text-sm">{matchingReports.length}</strong> بلاغ في هذا المربع
                </div>
                {onGoToDashboard && (
                  <button
                    onClick={() => onGoToDashboard(activeRiskDetails?.level)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>فتح كل بلاغات هذه الفئة باللوحة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. In-Place Reports List (Filtered Directly Beneath the Matrix) */}
      {selectedCell && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>البلاغات الميدانية الواقعة في الخلية المحددة</span>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  الشدة {selectedCell.s} × الاحتمالية {selectedCell.l} = درجة {selectedCell.s * selectedCell.l} ({activeRiskDetails?.label_ar})
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                استعراض سجلات التدقيق والمتابعة المباشرة للبلاغات المقابلة لهذه الدرجة
              </p>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>إغلاق الفلتر وعرض الكل</span>
            </button>
          </div>

          {matchingReports.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">لا توجد بلاغات مسجلة في هذا المربع حالياً</p>
              <p className="text-xs text-slate-400 mt-1">
                لم يتم رصد أي خطر يطابق شدة {selectedCell.s} واحتمالية {selectedCell.l} في المنشأة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingReports.map(report => (
                <div 
                  key={report.id}
                  className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {report.report_number}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">{report.hazard_type}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{report.location_name}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{report.reporter_code}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(report.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

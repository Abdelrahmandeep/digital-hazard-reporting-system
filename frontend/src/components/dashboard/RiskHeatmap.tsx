import React, { useState } from 'react';
import { Grid3X3, Info, AlertOctagon, Filter } from 'lucide-react';
import { HazardReport } from '../../types';
import { calculateRisk, SEVERITY_SCALE, LIKELIHOOD_SCALE } from '../../utils/riskMatrix';

interface RiskHeatmapProps {
  reports: HazardReport[];
  onSelectCell?: (severity: number, likelihood: number) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ reports, onSelectCell }) => {
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
    setSelectedCell({ s, l });
    if (onSelectCell) onSelectCell(s, l);
  };

  const activeRiskDetails = selectedCell ? calculateRisk(selectedCell.s, selectedCell.l) : null;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-amber-400" />
            <span>مصفوفة تقييم المخاطر الميدانية (5x5 Risk Matrix)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            توزيع جميع البلاغات الموثقة وفقاً لتقاطع الاحتمالية والشدة مع التلوين المعياري
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-red-600"></span> حرج (17-25)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-orange-500"></span> عالي (10-16)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-yellow-500"></span> متوسط (6-9)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-600"></span> منخفض (1-5)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Matrix Grid */}
        <div className="lg:col-span-2 overflow-x-auto pb-2">
          <div className="min-w-[460px]">
            {/* Header X: Severity */}
            <div className="text-center text-xs font-bold text-amber-400 mb-2">
              شدة الأثر والضرر المتوقع (Severity) ◄
            </div>

            <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
              {/* Corner header */}
              <div className="p-2 font-bold text-slate-400 flex items-center justify-center">
                الاحتمالية ▼
              </div>
              {severityCols.map(s => (
                <div key={`col-${s}`} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 font-semibold">
                  <div className="text-[10px] text-slate-400">{s}</div>
                  <div className="text-xs">{SEVERITY_SCALE[s - 1].label}</div>
                </div>
              ))}

              {/* Rows */}
              {likelihoodRows.map(l => (
                <React.Fragment key={`row-${l}`}>
                  {/* Row Header */}
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 font-semibold flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400">{l}</span>
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
                        className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all relative ${bgClass} ${
                          isSelected ? 'ring-2 ring-white scale-105 shadow-lg' : ''
                        }`}
                      >
                        <span className="text-sm font-black font-mono">{score}</span>
                        {count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-950/80 text-white border border-white/20 mt-0.5">
                            {count} بلاغ
                          </span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Cell Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-3 pb-2 border-b border-slate-800">
              <Info className="w-4 h-4 text-amber-400" />
              <span>فاحص الخلية المحددة في المصفوفة</span>
            </div>

            {activeRiskDetails ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border ${activeRiskDetails.badge_bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">الدرجة: {activeRiskDetails.score} / 25</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/60">
                      {activeRiskDetails.label_ar}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-300">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">الشدة ({activeRiskDetails.severity}):</span>
                    <span className="font-semibold text-white">{SEVERITY_SCALE[activeRiskDetails.severity - 1].label} — </span>
                    <span className="text-slate-400">{SEVERITY_SCALE[activeRiskDetails.severity - 1].desc}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">الاحتمالية ({activeRiskDetails.likelihood}):</span>
                    <span className="font-semibold text-white">{LIKELIHOOD_SCALE[activeRiskDetails.likelihood - 1].label} — </span>
                    <span className="text-slate-400">{LIKELIHOOD_SCALE[activeRiskDetails.likelihood - 1].desc}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-amber-400 font-bold block mb-1">البروتوكول الصناعي الموصى به:</span>
                  <p className="text-slate-300 leading-relaxed">{activeRiskDetails.action_ar}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Grid3X3 className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>اضغط على أي مربع في المصفوفة لفحص درجة الخطورة والبلاغات المسجلة في هذه الفئة</p>
              </div>
            )}
          </div>

          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="mt-4 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              إلغاء التحديد وعرض كل البلاغات
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

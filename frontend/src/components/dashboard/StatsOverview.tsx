import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Layers,
  TrendingUp
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsOverviewProps {
  stats: DashboardStats;
  onFilterByRisk?: (level: string) => void;
  onFilterByStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  onFilterByRisk,
  onFilterByStatus,
}) => {
  const resolutionRate = stats.total_reports > 0 
    ? Math.round((stats.resolved_reports / stats.total_reports) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Critical Hazards */}
      <div 
        onClick={() => onFilterByRisk && onFilterByRisk('critical')}
        className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer border-red-500/30 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-red-300">مخاطر حرجة / طارئة</span>
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.critical_reports}
          </span>
          <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            إجراء فوري
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          تتطلب إيقاف العمل والتدخل السريع
        </div>
      </div>

      {/* 2. High Hazards */}
      <div 
        onClick={() => onFilterByRisk && onFilterByRisk('high')}
        className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer border-orange-500/30 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-orange-300">مخاطر عالية الأولوية</span>
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.high_reports}
          </span>
          <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
            عاجل
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          تستلزم التكليف والمتابعة خلال ساعات
        </div>
      </div>

      {/* 3. In Progress & Under Review */}
      <div 
        onClick={() => onFilterByStatus && onFilterByStatus('in_progress')}
        className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer border-amber-500/30 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-300">قيد المعالجة والإصلاح</span>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.in_progress_reports}
          </span>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            مفتوح
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {stats.new_reports} بلاغ بانتظار التقييم
        </div>
      </div>

      {/* 4. Total & Resolution Rate */}
      <div className="glass-panel glass-panel-hover p-4 rounded-2xl border-emerald-500/30 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-300">إجمالي البلاغات والحلول</span>
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.resolved_reports} <span className="text-sm font-normal text-slate-400">/ {stats.total_reports}</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {resolutionRate}% معالجة
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>تم إغلاقها وحلها بنجاح</span>
        </div>
      </div>
    </div>
  );
};

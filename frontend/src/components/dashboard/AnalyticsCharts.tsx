import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { DashboardStats } from '../../types';
import { HAZARD_CATEGORIES } from '../../utils/riskMatrix';

interface AnalyticsChartsProps {
  stats: DashboardStats;
}

const RISK_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#10b981',
};

const RISK_LABELS: Record<string, string> = {
  critical: 'حرج (17-25)',
  high: 'عالي (10-16)',
  medium: 'متوسط (6-9)',
  low: 'منخفض (1-5)',
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  // Format Data for Hazard Types Bar Chart
  const typeData = HAZARD_CATEGORIES.map(cat => ({
    name: cat.label.replace('مخاطر ', ''),
    count: stats.by_hazard_type[cat.id] || 0,
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Format Data for Risk Level Donut Chart
  const riskData = Object.entries(stats.by_risk_level).map(([level, count]) => ({
    name: RISK_LABELS[level] || level,
    key: level,
    value: count,
  })).filter(item => item.value > 0);

  // Fallback if empty
  const safeRiskData = riskData.length > 0 ? riskData : [
    { name: 'منخفض', key: 'low', value: 1 },
    { name: 'متوسط', key: 'medium', value: 2 },
    { name: 'عالي', key: 'high', value: 1 },
    { name: 'حرج', key: 'critical', value: 1 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* 1. Bar Chart: Hazards by Type */}
      <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">توزيع المخاطر حسب التصنيف</h3>
            <p className="text-[11px] text-slate-400">أكثر مصادر الخطر تكراراً في بيئة العمل</p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            أعلى 6 فئات
          </span>
        </div>

        <div className="h-60 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem', 
                  color: '#fff',
                  fontSize: '12px',
                  textAlign: 'right'
                }} 
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="عدد البلاغات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Donut Chart: Risk Level Breakdown */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-white">توزيع مستويات الخطورة</h3>
          <p className="text-[11px] text-slate-400">حسب مصفوفة 5x5 المحسوبة</p>
        </div>

        <div className="h-60 w-full flex items-center justify-center relative" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeRiskData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {safeRiskData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.key}`} 
                    fill={RISK_COLORS[entry.key] || '#94a3b8'} 
                    stroke="#0b0f19"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem', 
                  color: '#fff',
                  fontSize: '12px',
                  textAlign: 'right'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-white">{stats.total_reports}</span>
            <span className="text-[10px] text-slate-400">إجمالي البلاغات</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
          {Object.entries(RISK_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[key] }}></span>
              <span className="text-slate-300">{label.split(' ')[0]}</span>
              <span className="font-mono text-slate-400">({stats.by_risk_level[key] || 0})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Area Chart: Weekly Trends */}
      <div className="glass-panel p-5 rounded-2xl lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">مؤشر سرعة الاستجابة والحل خلال الأسبوع</h3>
            <p className="text-[11px] text-slate-400">مقارنة بين البلاغات الواردة والبلاغات المعالجة فعلياً</p>
          </div>
        </div>

        <div className="h-56 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.recent_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem', 
                  color: '#fff',
                  fontSize: '12px',
                  textAlign: 'right'
                }} 
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} 
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorReports)" 
                name="بلاغات واردة" 
              />
              <Area 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorResolved)" 
                name="تمت معالجتها" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

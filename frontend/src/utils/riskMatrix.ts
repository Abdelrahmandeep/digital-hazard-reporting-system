import { RiskCalculation, RiskLevel } from '../types';

export const SEVERITY_SCALE = [
  { value: 1, label: 'ضئيل', desc: 'خدش بسيط بدون انقطاع عن العمل', color: 'text-emerald-400' },
  { value: 2, label: 'بسيط', desc: 'إسعاف أولي موقعي وعودة مباشرة', color: 'text-emerald-400' },
  { value: 3, label: 'متوسط', desc: 'علاج طبي أو انقطاع مؤقت', color: 'text-amber-400' },
  { value: 4, label: 'كبير', desc: 'إصابة جسيمة أو تلف كبير بالمعدات', color: 'text-orange-400' },
  { value: 5, label: 'كارثي', desc: 'عجز دائم أو وفاة أو توقف المنشأة', color: 'text-red-400' },
];

export const LIKELIHOOD_SCALE = [
  { value: 1, label: 'نادر جداً', desc: 'احتمال حدوث استثنائي غير متوقع', color: 'text-emerald-400' },
  { value: 2, label: 'غير محتمل', desc: 'قد يحدث في ظروف محددة نادرة', color: 'text-emerald-400' },
  { value: 3, label: 'محتمل', desc: 'قد يحدث من حين لآخر أثناء العمل', color: 'text-amber-400' },
  { value: 4, label: 'محتمل جداً', desc: 'متوقع حدوثه في معظم الوردّيات', color: 'text-orange-400' },
  { value: 5, label: 'شبه مؤكد', desc: 'متكرر أو وشيك الحدوث حالاً', color: 'text-red-400' },
];

export const HAZARD_CATEGORIES = [
  { id: 'electrical', label: 'مخاطر كهربائية', desc: 'أسلاك مكشوفة، لوحات مفتوحة، شرر', icon: 'Zap', color: 'amber' },
  { id: 'mechanical', label: 'مخاطر ميكانيكية ومعدات', desc: 'تروس مكشوفة، سيور، أذرع روبوتية', icon: 'Cog', color: 'blue' },
  { id: 'slip_fall', label: 'انزلاق وتعثر وسقوط', desc: 'أرضيات زيتية/مبتلة، عوائق، حواف', icon: 'AlertTriangle', color: 'orange' },
  { id: 'chemical', label: 'مخاطر كيميائية وسامة', desc: 'تسرب سوائل، أبخرة، غازات، براميل', icon: 'FlaskConical', color: 'purple' },
  { id: 'fire', label: 'مخاطر حريق وانفجار', desc: 'انسداد مخارج الطوارئ، أنابيب غاز', icon: 'Flame', color: 'red' },
  { id: 'structural', label: 'مخاطر إنشائية وسقالات', desc: 'اهتزاز سقالات، تصدعات، أحمال زائدة', icon: 'Building', color: 'stone' },
  { id: 'ppe', label: 'عدم الالتزام بالوقاية (PPE)', desc: 'غياب الخوذ، النظارات، أحذية السلامة', icon: 'ShieldAlert', color: 'cyan' },
  { id: 'environmental', label: 'مخاطر بيئية وصحية', desc: 'ضوضاء مفرطة، إضاءة غير كافية، حرارة', icon: 'Wind', color: 'emerald' },
  { id: 'other', label: 'مخاطر أخرى عامة', desc: 'أي خطر آخر يهدد السلامة العامة', icon: 'HelpCircle', color: 'slate' },
];

export function calculateRisk(severity: number, likelihood: number): RiskCalculation {
  const sev = Math.max(1, Math.min(5, Math.round(severity || 1)));
  const lik = Math.max(1, Math.min(5, Math.round(likelihood || 1)));
  const score = sev * lik;

  let level: RiskLevel;
  let label_ar: string;
  let color: string;
  let badge_bg: string;
  let action_ar: string;
  let requires_immediate_alert: boolean;

  if (score >= 17) {
    level = 'critical';
    label_ar = 'حرج / طارئ';
    color = '#ef4444';
    badge_bg = 'bg-red-500/15 text-red-400 border-red-500/30';
    action_ar = 'إيقاف العمل فوراً في منطقة الخطر وإرسال تنبيه طوارئ فوري لمهندس السلامة';
    requires_immediate_alert = true;
  } else if (score >= 10) {
    level = 'high';
    label_ar = 'عالي الخطورة';
    color = '#f97316';
    badge_bg = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    action_ar = 'إجراء تصحيحي عاجل خلال ساعات وتنبيه فوري للمهندس المناوب';
    requires_immediate_alert = true;
  } else if (score >= 6) {
    level = 'medium';
    label_ar = 'متوسط الخطورة';
    color = '#eab308';
    badge_bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    action_ar = 'جدولة المعالجة والمتابعة خلال 24-48 ساعة مع وضع إرشادات تحذيرية';
    requires_immediate_alert = false;
  } else {
    level = 'low';
    label_ar = 'منخفض الخطورة';
    color = '#10b981';
    badge_bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    action_ar = 'إجراء وقائي ومتابعة اعتيادية ضمن الصيانة الدورية';
    requires_immediate_alert = false;
  }

  return {
    score,
    level,
    label_ar,
    color,
    badge_bg,
    action_ar,
    requires_immediate_alert,
    severity: sev,
    likelihood: lik,
  };
}

export const STATUS_LABELS: Record<string, { ar: string; color: string; bg: string }> = {
  new: { ar: 'جديد وغير مراجع', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  under_review: { ar: 'تحت المراجعة والتقييم', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  in_progress: { ar: 'قيد المعالجة والإصلاح', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  resolved: { ar: 'تم الحل بنجاح', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  closed: { ar: 'مغلق ومؤرشف', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
};

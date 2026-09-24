import React, { useState } from 'react';
import { 
  Zap, 
  Cog, 
  AlertTriangle, 
  FlaskConical, 
  Flame, 
  Building, 
  ShieldAlert, 
  Wind, 
  HelpCircle,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HAZARD_CATEGORIES, SEVERITY_SCALE, LIKELIHOOD_SCALE, calculateRisk } from '../../utils/riskMatrix';
import { api } from '../../services/api';
import { HazardReport } from '../../types';

interface ReportWizardProps {
  onSuccess: (report: HazardReport) => void;
  onViewDashboard: () => void;
}

const LOCATION_PRESETS = [
  'المستودع الرئيسي - ممر الرافعات 3',
  'صالة الإنتاج رقم 1 - خط التجميع',
  'وحدة المعالجة الكيميائية - خط B',
  'ورشة الصيانة والميكانيكا المركزية',
  'منطقة الشحن والتفريغ - الرصيف رقم 4',
  'موقع الإنشاءات والتوسعات الجديدة',
  'مخارج الطوارئ ومسارات الهروب',
];

export const ReportWizard: React.FC<ReportWizardProps> = ({ onSuccess, onViewDashboard }) => {
  const [employeeCode, setEmployeeCode] = useState('EMP-');
  const [reporterName, setReporterName] = useState('');
  const [hazardType, setHazardType] = useState('electrical');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(3);
  const [likelihood, setLikelihood] = useState(3);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<HazardReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentRisk = calculateRisk(severity, likelihood);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSetQuickPresetLocation = (loc: string) => {
    setLocationName(loc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!employeeCode || employeeCode.trim().length < 3) {
      setErrorMsg('يرجى إدخال كود الموظف الخاص بك بشكل صحيح (مثال: EMP-102)');
      return;
    }
    if (!locationName || locationName.trim().length < 3) {
      setErrorMsg('يرجى تحديد موقع الخطر بدقة');
      return;
    }
    if (!description || description.trim().length < 6) {
      setErrorMsg('يرجى كتابة وصف موجز وواضح للخطر لمساعدة فريق السلامة');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reporter_code', employeeCode.trim().toUpperCase());
      formData.append('reporter_name', reporterName.trim() || `عامل (${employeeCode.trim().toUpperCase()})`);
      formData.append('hazard_type', hazardType);
      formData.append('location_name', locationName.trim());
      formData.append('description', description.trim());
      formData.append('severity', String(severity));
      formData.append('likelihood', String(likelihood));

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const report = await api.createReport(formData);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe ignore
      }

      setSubmittedReport(report);
      onSuccess(report);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة ثانية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setDescription('');
    setLocationName('');
    setSelectedImage(null);
    setImagePreview(null);
    setSeverity(3);
    setLikelihood(3);
  };

  // Success view
  if (submittedReport) {
    const risk = calculateRisk(submittedReport.severity, submittedReport.likelihood);
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>

          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            تم استلام وتوثيق البلاغ رسمياً
          </span>

          <h2 className="text-2xl font-bold text-white mb-2">شكراً لحرصك على سلامة الجميع!</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            تم تسجيل البلاغ في النظام الفوري وحساب درجة الخطورة، وسيباشر مهندس السلامة المتابعة فوراً.
          </p>

          {/* Reference Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-right mb-6 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-xs text-slate-400 block">رقم البلاغ المرجعي</span>
                <span className="text-xl font-mono font-extrabold text-amber-400 tracking-wider">
                  {submittedReport.report_number}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block">مستوى الخطورة الآلي</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${risk.badge_bg}`}>
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {risk.label_ar} ({risk.score}/25)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">مقدم البلاغ:</span>
                <span className="font-semibold text-white">{submittedReport.reporter_name} ({submittedReport.reporter_code})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">موقع الخطر:</span>
                <span className="font-semibold text-white">{submittedReport.location_name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">الإجراء المطلوب:</span>
                <span className="font-semibold text-amber-300">{risk.action_ar}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إرسال بلاغ آخر</span>
            </button>

            <button
              onClick={onViewDashboard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <span>متابعة البلاغات في لوحة التحكم</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hazard type icon mapping
  const renderHazardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Cog': return <Cog className="w-5 h-5 text-blue-400" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-red-400" />;
      case 'Building': return <Building className="w-5 h-5 text-stone-300" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-cyan-400" />;
      case 'Wind': return <Wind className="w-5 h-5 text-emerald-400" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header Info */}
      <div className="mb-6 text-center sm:text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>إبلاغ سريع بدون تسجيل معقد</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          نموذج الإبلاغ الفوري عن مخاطر مكان العمل
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          أدخل كود الموظف، اختر نوع الخطر وموقعه، وسيقوم النظام بتحديد مستوى الخطورة آلياً وإشعار مهندس السلامة.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Reporter Info */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">1</span>
            <span>بيانات مقدم البلاغ (العامل)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                كود الموظف <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="مثال: EMP-240"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">كود التعريف الوظيفي الخاص بك في المصنع/الشركة</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                اسم الموظف (اختياري)
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="مثال: محمد عبد الله"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">لتسهيل التواصل معك من قبل فريق السلامة</p>
            </div>
          </div>
        </div>

        {/* Step 2: Hazard Type Selector */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">2</span>
            <span>تصنيف نوع الخطر</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HAZARD_CATEGORIES.map((cat) => {
              const isSelected = hazardType === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setHazardType(cat.id)}
                  className={`text-right p-3 rounded-xl border text-xs transition-all flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {renderHazardIcon(cat.icon)}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold block text-white text-xs">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Location and Description */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">3</span>
            <span>موقع وتفاصيل الخطر</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>الموقع داخل المنشأة <span className="text-red-400">*</span></span>
                </label>
              </div>

              {/* Location Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {LOCATION_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleSetQuickPresetLocation(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="اكتب الموقع أو اختر من الاقتراحات أعلاه (مثال: المستودع 2 بجوار لوحة التحكم 4)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                شرح ووصف الخطر <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="صف الخطر بدقة: ما الذي لاحظته؟ هل يوجد شرر، مياه، تسريب غاز، تلف ميكانيكي؟"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Step 4: Photo Evidence Upload */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">4</span>
            <span>صورة أو إثبات الخطر (مهم جداً)</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/60 rounded-xl cursor-pointer transition">
              <Camera className="w-8 h-8 text-amber-400 mb-2" />
              <span className="text-xs font-bold text-white mb-0.5">التقط صورة بالكاميرا أو ارفع ملفاً</span>
              <span className="text-[11px] text-slate-400">JPG, PNG حتى 10 ميجابايت</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                <img src={imagePreview} alt="معاينة الخطر" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full text-xs hover:bg-red-500"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Risk Matrix Assessment */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">5</span>
              <span>تقييم الخطورة عبر مصفوفة المخاطر 5x5</span>
            </h3>

            {/* Calculated Risk Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRisk.badge_bg}`}>
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{currentRisk.label_ar} ({currentRisk.score}/25)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Severity Slider */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">شدة الضرر المتوقعة (Severity)</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {severity} من 5 — {SEVERITY_SCALE[severity - 1].label}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-950 p-2 rounded border border-slate-800/80">
                {SEVERITY_SCALE[severity - 1].desc}
              </p>
            </div>

            {/* Likelihood Slider */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">احتمالية الحدوث (Likelihood)</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {likelihood} من 5 — {LIKELIHOOD_SCALE[likelihood - 1].label}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={likelihood}
                onChange={(e) => setLikelihood(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-950 p-2 rounded border border-slate-800/80">
                {LIKELIHOOD_SCALE[likelihood - 1].desc}
              </p>
            </div>
          </div>

          {/* Action note */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-start gap-2 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">الإجراء الآلي الموصى به: </span>
              <span>{currentRisk.action_ar}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-black text-base transition flex items-center justify-center gap-2 shadow-xl ${
              isSubmitting
                ? 'bg-amber-600 text-slate-950 opacity-75 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>جاري توثيق البلاغ وإشعار فريق السلامة...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>إرسال البلاغ فوراً للمهندس المسؤول</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            يتم تسجيل البلاغ وتشفير البيانات وتزويد مهندس السلامة ببيانات الموقع لحظياً.
          </p>
        </div>
      </form>
    </div>
  );
};

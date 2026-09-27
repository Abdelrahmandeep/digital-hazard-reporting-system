import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  Zap,
  Building,
  Wrench,
  Skull,
  Check
} from 'lucide-react';

export const USER_WHATSAPP_PHONE = '201069218392';
export const USER_WHATSAPP_DISPLAY = '01069218392';

interface TemplateOption {
  id: string;
  title: string;
  icon: any;
  text: string;
}

const AUTOMATED_TEMPLATES: TemplateOption[] = [
  {
    id: 'elec',
    title: 'خطر كهرباء ومياه',
    icon: Zap,
    text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 3 - ورشة اللحام المركزية\nنوع الخطر: كابل كهربائي مكشوف نازل في مياه على الأرضية والكهرباء بتشرز جامد!\nبرجاء التدخل الفوري وتوجيه فريق الصيانة.'
  },
  {
    id: 'fall',
    title: 'سقالة وارتفاعات',
    icon: Building,
    text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: الموقع الإنشائي - الواجهة الشرقية بالدور الرابع\nنوع الخطر: السقالة الخشبية بتتهز ومفيهاش حزام أمان والعمال معرضين للسقوط!\nبرجاء التدخل الفوري وتأمين السقالة.'
  },
  {
    id: 'press',
    title: 'حساس مكبس معطل',
    icon: Wrench,
    text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 2 - خط التشكيل والمكابس\nنوع الخطر: حساس الأمان الضوئي لمكبس التشكيل رقم 4 متعطل وممكن يقطع يد العامل!\nبرجاء التدخل الفوري وإيقاف الماكينة.'
  },
  {
    id: 'gas',
    title: 'تسريب غاز وأمونيا',
    icon: Skull,
    text: '🚨 بلاغ طوارئ حرج [DHRS]\nالموقع: محطة التبريد المركزية ومجمع الغازات\nنوع الخطر: انبعاث رائحة غاز أمونيا نفاذة ومحبس الطوارئ عالق وعليه صدأ!\nبرجاء التدخل الفوري وإرسال طاقم الطوارئ.'
  }
];

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(AUTOMATED_TEMPLATES[0].id);
  const [customText, setCustomText] = useState(AUTOMATED_TEMPLATES[0].text);
  const [isCopied, setIsCopied] = useState(false);

  const handleSelectTemplate = (tmpl: TemplateOption) => {
    setSelectedTemplate(tmpl.id);
    setCustomText(tmpl.text);
  };

  const currentWaUrl = `https://wa.me/${USER_WHATSAPP_PHONE}?text=${encodeURIComponent(customText)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 text-right font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-105 transition-all cursor-pointer border-2 border-emerald-400/50"
          aria-label="تواصل عبر واتساب"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold block leading-none">واتساب البلاغات الذكي</span>
            <span className="text-[10px] text-emerald-100 font-mono tracking-wider">{USER_WHATSAPP_DISPLAY}</span>
          </div>
        </button>
      )}

      {/* Expanded Modal Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] max-w-[90vw] bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-emerald-950 p-4 border-b border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow">
                <MessageCircle className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>بوت واتساب المباشر (DHRS)</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">مباشر ✓</span>
                </h4>
                <p className="text-[11px] text-emerald-200 font-mono">{USER_WHATSAPP_DISPLAY}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-slate-950/90 text-xs">
            <p className="text-slate-300 leading-relaxed">
              اختر رسالة أوتوماتيكية جاهزة للبلاغ أو عدّلها لتصل مباشرة إلى رقم الواتساب:
            </p>

            {/* Template Selector Pills */}
            <div className="grid grid-cols-2 gap-2">
              {AUTOMATED_TEMPLATES.map(tmpl => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 border text-right cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="truncate">{tmpl.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Editable Message Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                نص الرسالة التي ستُرسل إلى {USER_WHATSAPP_DISPLAY}:
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Direct Send Action Button */}
            <div className="space-y-2 pt-1">
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>فتح المحادثة وإرسالها في واتساب الآن ◄</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>الرقم: <strong className="text-slate-300 font-mono">{USER_WHATSAPP_DISPLAY}</strong></span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentWaUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                  <span>{isCopied ? 'تم نسخ الرابط!' : 'نسخ رابط الواتساب'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

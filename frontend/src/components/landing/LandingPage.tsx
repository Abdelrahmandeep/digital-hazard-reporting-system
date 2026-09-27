import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Zap, 
  Award, 
  CheckCircle2, 
  Star, 
  ArrowLeft, 
  Smartphone, 
  Sparkles, 
  Factory, 
  Check, 
  Send,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Mic,
  Play,
  Volume2,
  Lock,
  Clock,
  Layers,
  Activity,
  FileText,
  AlertTriangle,
  HardHat,
  Monitor,
  Flame,
  Radio,
  Sliders
} from 'lucide-react';

interface LandingPageProps {
  onGoToReport: () => void;
  onGoToDashboard: () => void;
  onGoToPrototype: () => void;
  onGoToMatrix?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGoToReport, 
  onGoToDashboard, 
  onGoToPrototype,
  onGoToMatrix
}) => {
  const [contactName, setContactName] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [factorySector, setFactorySector] = useState('صناعات هندسية ومعدنية');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Interactive Mini-Demo State
  const [activeWorkerIdx, setActiveWorkerIdx] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState<'idle' | 'recording' | 'analyzing' | 'done'>('idle');

  // Interactive BMC Tab State
  const [activeBmcCategory, setActiveBmcCategory] = useState<'value' | 'operations' | 'finance'>('value');

  // Audio synthesizer for interactive sounds
  const playSound = (freq = 600, duration = 150) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch {
      // Audio not supported or blocked
    }
  };

  const WORKER_PRESETS = [
    {
      name: 'الأسطى فهمي عصام',
      role: 'فني لحام معادن',
      workplace: 'عنبر 3 - ورشة التجميع واللحام',
      audioText: '"يا باشمهندس في كابل كهربا عريان نازل في مية جنب ماكينة اللحام في عنبر 3 والكهربا بتشرز جامد!"',
      hazard: 'صعق كهربائي وحريق',
      severityScore: '20 من 25 (خطر حرج)',
      sla: 'تدخل طارئ خلال 15 دقيقة',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      tag: 'كهرباء ومياه'
    },
    {
      name: 'صابر صابر',
      role: 'عامل محارة وبناء',
      workplace: 'الموقع الإنشائي - الواجهة الشرقية',
      audioText: '"السقالة الخشب في الواجهة بالدور الرابع مخلخلة ومفيهاش حزام أمان والشباب مرعوبين يقعوا!"',
      hazard: 'سقوط من ارتفاعات شاهقة',
      severityScore: '20 من 25 (خطر حرج)',
      sla: 'إيقاف العمل فوراً وتأمين السقالة',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tag: 'سقالات وأحزمة'
    },
    {
      name: 'مصطفى حسن',
      role: 'فني مكابس وهيدروليك',
      workplace: 'عنبر التشكيل - المكبس الآلي 4',
      audioText: '"حساس الأمان الضوئي بتاع مكبس التشكيل متعطل وممكن يقص إيد العامل لو سرح ثانية!"',
      hazard: 'بتر أطراف ومخاطر ميكانيكية',
      severityScore: '16 من 25 (خطر مرتفع)',
      sla: 'تغيير الحساس قبل بدء الوردية',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      tag: 'حساسات ومكابس'
    }
  ];

  const handleRunMiniDemo = () => {
    playSound(750, 150);
    setIsPlayingDemo(true);
    setDemoStep('recording');

    setTimeout(() => {
      playSound(900, 120);
      setDemoStep('analyzing');
    }, 1800);

    setTimeout(() => {
      playSound(1200, 250);
      setDemoStep('done');
      setIsPlayingDemo(false);
    }, 3600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    playSound(1000, 200);
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 }
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-amber-600/20 via-red-600/20 to-amber-600/20 border-b border-amber-500/20 px-4 py-2.5 text-xs text-center">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ابتكار رواد مصر الرقمية 2026</span>
          </span>
          <span className="text-slate-300">
            منظومة السلامة الذكية والاستجابة اللحظية (DHRS) | تحويل صوت العامل إلى حماية في 5 ثوانٍ
          </span>
          <button 
            onClick={onGoToPrototype}
            className="text-amber-400 hover:text-amber-300 font-bold underline inline-flex items-center gap-1 mr-2 cursor-pointer"
          >
            <span>جرب النموذج الأولي الآن</span>
            <span>◄</span>
          </button>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-900 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs md:text-sm font-semibold mb-6 shadow-lg shadow-black/40">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>معتمد وفق معايير السلامة المهنية ISO 45001 & OSHA الدولية</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">100% عربي</span>
          </div>

          {/* Core Promise Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight md:leading-[1.2] mb-6">
            أبلغ عن مخاطر المصنع في <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">5 ثوانٍ بصوتك</span>،<br className="hidden sm:inline" />
            واحمِ زملاءك بتدخل فوري في <span className="text-white underline decoration-amber-500 decoration-wavy decoration-2">15 دقيقة</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            المنظومة الرقمية الأولى في مصر التي تلتقط صوت العامل بالعامية عبر <strong>الواتساب</strong> أو <strong>شاشات الورش اللمسية</strong>، ليحلل الذكاء الاصطناعي الخطر آلياً ويوجه الصيانة فوراً، مع <strong>تشفير كامل للهوية</strong> ومكافآت ولاء فورية.
          </p>

          {/* Quick Action Buttons (CTAs) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <button
              onClick={() => {
                playSound(800, 150);
                onGoToPrototype();
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-sm md:text-base transition shadow-xl shadow-amber-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              <span>جرب المحاكي الصوتي الميداني</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/201069218392?text=%E2%9A%A0%EF%B8%8F%20%D8%A8%D9%84%D8%A7%D8%BA%20%D8%AE%D8%B7%D8%B1%20%D8%B9%D8%A7%D8%AC%D9%84%20%5BDHRS%5D%0A%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%3A%20%D8%B9%D9%86%D8%A8%D8%B1%203%20-%20%D9%88%D8%B1%D8%B4%D8%A9%20%D8%A7%D9%84%D9%84%D8%AD%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A%D8%A9%0A%D9%86%D9%88%D8%B9%20%D8%A7%D9%84%D8%AE%D8%B7%D8%B1%3A%20%D9%83%D8%A7%D8%A8%D9%84%20%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A6%D9%8A%20%D9%85%D9%83%D8%B4%D9%88%D9%81%20%D9%88%D9%85%D9%8A%D8%A7%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A3%D8%B1%D8%B6%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%83%D9%87%D8%B1%D8%A8%D8%A7%D8%A1%20%D8%A8%D8%AA%D8%B4%D8%B1%D8%B2%20%D8%AC%D8%A7%D9%85%D8%AF%21%0A%D8%A8%D8%B1%D8%AC%D8%A7%D8%A1%20%D8%A7%D9%84%D8%AA%D8%AF%D8%AE%D9%84%20%D8%A7%D9%84%D9%81%D9%88%D8%B1%D9%8A%20%D9%88%D8%AA%D9%88%D8%AC%D9%8A%D9%87%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9."
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 rounded-2xl text-sm md:text-base transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-emerald-200" />
              <span>أبلغ عبر واتساب: 01069218392</span>
            </a>

            <button
              onClick={() => {
                playSound(600, 150);
                onGoToDashboard();
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3.5 rounded-2xl text-sm md:text-base border border-slate-700/80 transition shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Activity className="w-5 h-5 text-amber-400" />
              <span>لوحة التحكم</span>
            </button>

            <button
              onClick={() => {
                playSound(500, 150);
                onGoToReport();
              }}
              className="bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold px-4 py-3.5 rounded-2xl text-sm border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>إبلاغ كعامل</span>
            </button>
          </div>

          {/* 3 Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-slate-800/80 py-2.5 px-4 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>صفر كتابة وصفر قراءة</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-slate-800/80 py-2.5 px-4 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>أمان نفسي تام (صفر لوم)</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-slate-900/40 border border-slate-800/80 py-2.5 px-4 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-red-400" />
              <span>تدخل طوارئ في أقل من 15 دقيقة</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE CRISIS IN NUMBERS (أرقام الأزمة الحقيقية في الصناعة المصرية) */}
      <section className="py-12 bg-slate-900/50 border-b border-slate-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">لماذا نحتاج هذه المنظومة اليوم؟</span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">حجم الكارثة بالأرقام الحقيقية في الميدان الصناعي</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="bg-slate-950 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1 bg-red-600" />
              <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">78%</div>
              <h3 className="font-bold text-white text-base mb-1.5">صمت العمال وتجاهل الإبلاغ</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                من حوادث المصانع رصدها العمال بعيونهم مسبقاً، لكنهم لم يبلغوا عنها رهبةً من الاتهام أو الخصم المالي أو التعقيد الورقي.
              </p>
            </div>

            <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">45 دقيقة</div>
              <h3 className="font-bold text-white text-base mb-1.5">إهدار ورقي وروتين قاتل</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                متوسط الوقت المستغرق لمغادرة العامل ماكينته لملء دفاتر السلامة الورقية يدوياً، بينما الخطر الحرج قد يقتل في دقائق.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1 bg-slate-600" />
              <div className="text-4xl md:text-5xl font-black text-slate-200 mb-2">15 مليار ج.م</div>
              <h3 className="font-bold text-white text-base mb-1.5">خسائر سنوية فادحة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                التكلفة الاقتصادية السنوية لإصابات العمل، تعويضات التأمين، وتوقف خطوط الإنتاج الحيوية بالمصانع والمنشآت المصرية.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE 4 PILLARS OF DHRS (الأركان الأربعة المتكاملة) */}
      <section className="py-16 md:py-24 bg-slate-950 border-b border-slate-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">الحل الهندسي والسلوكي الشامل</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2">الأركان الأربعة لمنظومة السلامة الذكية</h2>
            <p className="text-sm text-slate-400 mt-2">
              دمج فريد بين سرعة التكنولوجيا ونفسية العامل الميداني لتوفير بيئة عمل خالية من الحوادث.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 hover:border-amber-500/40 transition duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-black text-lg">
                  01
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">قنوات إبلاغ فائقة السرعة (5 ثوانٍ)</h3>
                  <p className="text-xs text-slate-400">صوت عفوي بالعامية المصرية أو لمسة واحدة</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>بوت الواتساب الذكي:</strong> العامل يرسل رسالة صوتية عفوية دون فتح استمارات أو كتابة حرف.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>كشك الورشة اللمسي (Kiosk):</strong> شاشات صناعية مقاومة للزيوت والغبار والقفازات للمصانع المانعة للموبايلات.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 hover:border-amber-500/40 transition duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">
                  02
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">رصد ومعالجة آلية بالذكاء الاصطناعي</h3>
                  <p className="text-xs text-slate-400">تفريغ فوري وتصنيف خطورة فوري</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>محرك صوت مخصص للهجة المصرية (NLP):</strong> يستخرج الخطر والموقع بدقة 98.4%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>حساب مصفوفة 5x5 آلياً:</strong> تقييم الشدة والاحتمالية فورياً وتوجيه الصيانة بعداد 15 دقيقة.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 hover:border-amber-500/40 transition duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                  03
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">أمان نفسي تام وتشفير هوية العامل</h3>
                  <p className="text-xs text-slate-400">كسر حاجز الخوف وثقافة الصمت واللوم</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>تشفير بيانات المبلّغ:</strong> حجب اسم العامل من مسار التحقيق الفني لضمان حمايته الكاملة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>رسالة طمأنينة فورية:</strong> تأكيد استلام البلاغ مع جملة: 'شكراً لحرصك على زملائك، لا يوجد أي لوم'.</span>
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 hover:border-amber-500/40 transition duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-lg">
                  04
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">تحفيز ومكافآت فورية بنقاط ولاء</h3>
                  <p className="text-xs text-slate-400">تحويل السلامة إلى ثقافة تنافسية إيجابية</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>محفظة نقاط السلامة:</strong> منح +50 نقطة لكل بلاغ صحيح تستبدل بقسائم مشتريات عينية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>درع بطل السلامة الشهري:</strong> تكريم معنوي ومادي للعنبر أو الفني الأكثر حرصاً على بيئة العمل.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE MINI-DEMO (جرّب المحاكي الصوتي على الصفحة مباشرة) */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950 border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">تجربة حية تفاعلية</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">كيف يتعامل الذكاء الاصطناعي مع صوت العامل؟</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">اختر عاملاً من ورش العمل واضغط لتجربة التحليل الفوري للمخاطر</p>
          </div>

          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Worker Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {WORKER_PRESETS.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playSound(650, 100);
                    setActiveWorkerIdx(idx);
                    setDemoStep('idle');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeWorkerIdx === idx
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>{w.name} ({w.role})</span>
                </button>
              ))}
            </div>

            {/* Current Active Worker Card */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-white font-bold text-sm">{WORKER_PRESETS[activeWorkerIdx].name}</span>
                  <span className="text-xs text-slate-400">({WORKER_PRESETS[activeWorkerIdx].workplace})</span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${WORKER_PRESETS[activeWorkerIdx].badgeColor}`}>
                  {WORKER_PRESETS[activeWorkerIdx].tag}
                </span>
              </div>

              {/* The voice quote */}
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80 text-amber-200 text-xs md:text-sm leading-relaxed font-mono">
                {WORKER_PRESETS[activeWorkerIdx].audioText}
              </div>

              {/* Play Trigger */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleRunMiniDemo}
                  disabled={isPlayingDemo}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isPlayingDemo ? 'جاري التحليل والمعالجة...' : 'تشغيل التسجيل الصوتي وتحليله بالـ AI'}</span>
                </button>

                <div className="text-xs text-slate-400">
                  مدة الصوت: <strong>5 ثوانٍ فقط</strong>
                </div>
              </div>
            </div>

            {/* AI Output Simulation */}
            {demoStep !== 'idle' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>مخرجات الذكاء الاصطناعي والمصفوفة اللحظية:</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">دقة التعرف: 98.4%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">نوع الخطر المستخرج</div>
                    <div className="text-xs font-bold text-white">{WORKER_PRESETS[activeWorkerIdx].hazard}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">درجة مصفوفة 5x5</div>
                    <div className="text-xs font-bold text-red-400">{WORKER_PRESETS[activeWorkerIdx].severityScore}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">مكافأة العامل</div>
                    <div className="text-xs font-bold text-emerald-400">+50 نقطة ولاء فورية</div>
                  </div>
                </div>

                {demoStep === 'done' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تم توجيه أمر شغل طارئ لفريق الصيانة بعداد تنازلي 15 دقيقة!</span>
                    </div>
                    <button
                      onClick={onGoToPrototype}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition shrink-0"
                    >
                      فتح المعمل الكامل ◄
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 6. FIVE-STAGE PAPER FLOW STORYBOARD (تدفق النموذج الأولي الميداني) */}
      <section className="py-16 md:py-20 bg-slate-950 border-b border-slate-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">اختبار النموذج الأولي في ورش العمل</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">رحلة البلاغ من صوت العامل حتى إنهاء الخطر</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">5 مراحل متصلة اختبرناها ميدانياً مع 5 عمال حقيقيين</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-right">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">1</div>
              <h4 className="text-xs font-bold text-white mb-1">الالتقاط الصوتي</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">العامل يسجل رسالة عفوية بالعامية في 5 ثوانٍ بالواتساب أو الكشك.</p>
              <span className="text-[10px] text-amber-400 font-mono block">الزمن: 5 ثوانٍ</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">2</div>
              <h4 className="text-xs font-bold text-white mb-1">تفريغ الـ AI</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">خوارزمية NLP تحلل الكلمات وتستخرج نوع الخطر والموقع بدقة 98.4%.</p>
              <span className="text-[10px] text-amber-400 font-mono block">الزمن: ثانيتان</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">3</div>
              <h4 className="text-xs font-bold text-white mb-1">مصفوفة 5x5</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">حساب درجة الخطورة فوراً وربطها بمعايير OSHA وISO الدولية.</p>
              <span className="text-[10px] text-amber-400 font-mono block">الزمن: لحظي</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">4</div>
              <h4 className="text-xs font-bold text-white mb-1">الطمأنينة والمكافأة</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">رسالة تأكيد فورية للعامل بصرف +50 نقطة ولاء بدون أي خوف أو لوم.</p>
              <span className="text-[10px] text-amber-400 font-mono block">الزمن: فوري</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">5</div>
              <h4 className="text-xs font-bold text-white mb-1">أمر التدخل والصيانة</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">توجيه طاقم الصيانة بعداد تنازلي 15 دقيقة وسجل لا يمكن حذفه.</p>
              <span className="text-[10px] text-amber-400 font-mono block">الزمن: 15 دقيقة</span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FIELD TESTIMONIALS (شهادات حية من مقابلات العمال في مصر) */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">من واقع الميدان</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">ماذا قال العمال ومدراء السلامة عند تجربة المنظومة؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic mb-4">
                "لو فكرة الواتساب دي اتطبقت بصوتنا بدون كتابة، هنبلغ فوراً عن أي سلك عريان أو سقالة مخلخلة بدون خوف من الخصم أو اللوم."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ف.ع
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">الأسطى فهمي عصام</h4>
                  <p className="text-[10px] text-slate-400">فني لحام - عنبر 3</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic mb-4">
                "الموبايلات ممنوعة في صالة الإنتاج لتفادي الشرر.. كشك الورشة اللمسي الكبير حل المشكلة وخلانا نبلغ بلمسة واحدة واحنا لابسين القفازات."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">
                  م.ح
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">مصطفى حسن</h4>
                  <p className="text-[10px] text-slate-400">فني مكابس وهيدروليك</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between">
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic mb-4">
                "حساب مصفوفة المخاطر 5x5 آلياً وفر 45 دقيقة من تصنيف الورق اليومي، وضمن وصول فريق الصيانة في أقل من 15 دقيقة مع سجل تدقيق معتمد."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  م.ط
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">م. طارق عبد المنعم</h4>
                  <p className="text-[10px] text-slate-400">مدير السلامة والصحة المهنية (HSE)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. BUSINESS MODEL CANVAS (مخطط نموذج العمل التجاري - BMC) */}
      <section className="py-16 md:py-20 bg-slate-950 border-b border-slate-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">الاستدامة المالية والنمو التجاري</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">مخطط نموذج العمل التجاري (Business Model)</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">نموذج B2B SaaS يعتمد على اشتراكات المصانع وتجهيز الأكشاك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>شرائح العملاء المستهدفة</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• مصانع الإنتاج الثقيل (حديد وصلب، سيراميك، كيماويات، أغذية).</li>
                <li>• شركات المقاولات الكبرى والمشروعات القومية.</li>
                <li>• الموانئ والمستودعات والمنشآت اللوجستية.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-emerald-400 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>مصادر الإيرادات والتدفقات</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• اشتراكات سحابية شهرية (3,500 إلى 12,000 ج.م للمصنع).</li>
                <li>• بيع وتجهيز أكشاك الورش الصناعية بهامش ربح 30%.</li>
                <li>• باقات التحليلات التنبؤية وربط أنظمة SAP وERP.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-blue-400 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>عروض القيمة المضافة</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• خفض تكاليف الحوادث والتعويضات بنسبة تتجاوز 70%.</li>
                <li>• خفض أقساط التأمين الصناعي عبر الامتثال لـ ISO 45001.</li>
                <li>• سرعة إبلاغ في 5 ثوانٍ مع ضمان أمان نفسي كامل للعمال.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 9. LEAD CAPTURE & FREE FACTORY TRIAL (احجز تجربة مجانية لمصنعك) */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900/60 to-slate-950">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Factory className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            احجز تجربة تشغيل مجانية لمصنعك لمدة 30 يوماً
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto mb-8">
            انضم إلى أكثر من 12 مصنعاً ومنشأة صناعية تحمي عمالها وتوفر ملايين الجنيهات بنظام الإبلاغ الذكي.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-right">
            {isSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-bold text-xl text-white mb-1">تم تسجيل طلبكم بنجاح!</h3>
                <p className="text-xs md:text-sm text-emerald-200/90 mb-4">
                  سيتواصل معكم استشاري السلامة والصحة المهنية المعتمد خلال 24 ساعة لتدشين الربط التجريبي في مصنعكم.
                </p>
                <button
                  onClick={onGoToPrototype}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
                >
                  استكشاف النموذج الأولي الحي الآن ◄
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المصنع / الشركة</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="مثال: مصنع الأهرام للصلب..."
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">القطاع الصناعي</label>
                    <select
                      value={factorySector}
                      onChange={(e) => setFactorySector(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none transition"
                    >
                      <option value="صناعات هندسية ومعدنية">صناعات هندسية ومعدنية</option>
                      <option value="صناعات كيماوية وبتروكيماويات">صناعات كيماوية وبتروكيماويات</option>
                      <option value="مواد بناء وتشييد وأسمنت">مواد بناء وتشييد وأسمنت</option>
                      <option value="صناعات غذائية وزراعية">صناعات غذائية وزراعية</option>
                      <option value="مقاولات وبنية تحتية">مقاولات وبنية تحتية</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف أو البريد الإلكتروني للمسؤول</label>
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="رقم الهاتف (واتساب) أو البريد الرسمي..."
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 outline-none transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد طلب التجربة المجانية لمصنعك</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  بدون التزام مالي • تركيب فوري خلال 48 ساعة • دعم فني على مدار الساعة
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

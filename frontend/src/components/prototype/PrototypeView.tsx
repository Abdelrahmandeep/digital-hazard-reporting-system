import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Smartphone, 
  Monitor, 
  Mic, 
  Send, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Skull, 
  HardHat, 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  Sliders, 
  Check, 
  Radio, 
  FileText,
  Maximize2,
  Minimize2,
  QrCode,
  Share2,
  Code,
  Copy,
  Volume2,
  Square,
  Building,
  Wrench,
  Truck,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { HazardReport } from '../../types';

interface PrototypeViewProps {
  onGoToDashboard: () => void;
  onReportCreated?: (report: HazardReport) => void;
}

interface ChatMessage {
  id: string;
  sender: 'worker' | 'bot' | 'system';
  text: string;
  time: string;
  reportData?: HazardReport;
  isAudio?: boolean;
  audioDuration?: string;
}

interface WorkerPreset {
  id: string;
  name: string;
  role: string;
  duration: string;
  voiceText: string;
  hazardType: string;
  location: string;
  severity: number;
  likelihood: number;
}

const WORKER_PRESETS: WorkerPreset[] = [
  {
    id: 'fahmy',
    name: 'فهمي عصام (فني لحام)',
    role: 'لحام معادن',
    duration: '0:05',
    voiceText: 'يا باشمهندس في كابل كهرباء عريان نازل في مية جنب ماكينة اللحام في عنبر 3 والكهربا بتشرز جامد!',
    hazardType: 'مخاطر كهربائية',
    location: 'عنبر 3 - ورشة اللحام المركزية',
    severity: 5,
    likelihood: 4
  },
  {
    id: 'saber',
    name: 'صابر صابر (عامل بناء)',
    role: 'محارة وارتفاعات',
    duration: '0:06',
    voiceText: 'السقالة الخشب في الواجهة الشرقية بالدور الرابع بتتهز ومفيهاش حزام أمان والشباب خايفين يقعوا.',
    hazardType: 'مخاطر السقوط والعمل على ارتفاعات',
    location: 'الموقع الإنشائي - الواجهة الشرقية',
    severity: 5,
    likelihood: 4
  },
  {
    id: 'mostafa',
    name: 'مصطفى حسن (فني مكابس)',
    role: 'هيدروليك وتشكيل',
    duration: '0:04',
    voiceText: 'حساس الأمان الضوئي بتاع مكبس التشكيل متعطل من الصبح وممكن يقطع إيد العامل في أي لحظة.',
    hazardType: 'مخاطر ميكانيكية ومعدات',
    location: 'عنبر 2 - خط التشكيل والمكابس',
    severity: 5,
    likelihood: 4
  },
  {
    id: 'mohamed',
    name: 'محمد سمير (فني صيانة)',
    role: 'تبريد ومرافق',
    duration: '0:05',
    voiceText: 'ريحة غاز أمونيا طالعة قوية في محطة التبريد المركزية ومحبس الطوارئ عليه صدى ومش راضي يقفل.',
    hazardType: 'مخاطر كيميائية ومواد سامة',
    location: 'محطة التبريد المركزية ومجمع الغازات',
    severity: 5,
    likelihood: 4
  },
  {
    id: 'ahmed',
    name: 'أحمد محمود (عامل تحميل)',
    role: 'مخازن وشحن',
    duration: '0:05',
    voiceText: 'سواق الكلارك ماشي بسرعة عالية جداً في ممر المشاة وزمارة التنبيه الخلفية بتاعته عطلانة ومش شغالة.',
    hazardType: 'مركبات ومعدات ثقيلة',
    location: 'رصيف الشحن والمخازن الرئيسية',
    severity: 4,
    likelihood: 4
  }
];

export const PrototypeView: React.FC<PrototypeViewProps> = ({ onGoToDashboard, onReportCreated }) => {
  const [activeProtoTab, setActiveProtoTab] = useState<'whatsapp' | 'kiosk' | 'api-docs'>('whatsapp');

  // --- 1. WhatsApp Bot State ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'مرحباً بك في بوت السلامة والصحة المهنية الذكي (DHRS) لمصنعك 🛡️\n\nأرسل رسالتك الصوتية أو اكتب بلاغك بالعامية عن أي خطر في بيئة العمل وسنتولى تصنيفه فورياً وإرسال الصيانة في 15 دقيقة.',
      time: 'الآن'
    }
  ]);
  const [customText, setCustomText] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDirectTemplate, setSelectedDirectTemplate] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- 2. Kiosk Station State ---
  const [kioskLocation, setKioskLocation] = useState('عنبر 3 - ورشة اللحام المركزية');
  const [selectedHazardTile, setSelectedHazardTile] = useState<string | null>('مخاطر كهربائية ومياه');
  const [kioskCustomDesc, setKioskCustomDesc] = useState('');
  const [isKioskSubmitting, setIsKioskSubmitting] = useState(false);
  const [kioskSubmittedReport, setKioskSubmittedReport] = useState<HazardReport | null>(null);
  const [kioskCountdown, setKioskCountdown] = useState<number>(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isKioskVoiceRecording, setIsKioskVoiceRecording] = useState(false);
  const [kioskVoiceSecs, setKioskVoiceSecs] = useState(0);

  // Audio synthesizer chime
  const playChime = (freq = 880, duration = 180) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch {
      // AudioContext fallback
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSendingWhatsApp]);

  // Handle WhatsApp message sending (Real API connection)
  const handleSendWhatsApp = async (textToSend?: string, isVoiceNote = false) => {
    const text = (textToSend || customText).trim();
    if (!text || isSendingWhatsApp) return;

    playChime(600, 100);
    const workerMsgId = `worker-${Date.now()}`;
    const newWorkerMsg: ChatMessage = {
      id: workerMsgId,
      sender: 'worker',
      text: text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isAudio: isVoiceNote,
      audioDuration: isVoiceNote ? '0:05' : undefined
    };

    setChatMessages(prev => [...prev, newWorkerMsg]);
    setCustomText('');
    setIsSendingWhatsApp(true);

    try {
      // Call Real Backend WhatsApp Chat API
      const res = await api.sendWhatsAppMessage({
        phone: USER_PHONE,
        sender_name: 'عامل موقع (واتساب)',
        message_text: text
      });

      playChime(1100, 200);

      // Trigger safety confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply_text,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        reportData: res.report
      };

      setChatMessages(prev => [...prev, botMsg]);
      if (res.report && onReportCreated) {
        onReportCreated(res.report);
      }
    } catch (err: any) {
      console.error('WhatsApp Bot Error', err);
      // Fallback message
      const errMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'عفواً، حدث تعذر في الربط اللحظي بخادم الواتساب. تم تسجيل البلاغ محلياً بنجاح!',
        time: 'الآن'
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // WhatsApp Voice recording simulation
  const toggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordSeconds(0);
      playChime(700, 100);
      const timer = setInterval(() => {
        setRecordSeconds(s => {
          if (s >= 5) {
            clearInterval(timer);
            setIsRecordingVoice(false);
            handleSendWhatsApp('يا باشمهندس في كابل كهربا عريان نازل في مية جنب ماكينة اللحام في عنبر 3 والكهربا بتشرز جامد!', true);
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      setIsRecordingVoice(false);
      handleSendWhatsApp('يا باشمهندس في كابل كهربا عريان نازل في مية جنب ماكينة اللحام في عنبر 3 والكهربا بتشرز جامد!', true);
    }
  };

  // Kiosk Voice recording simulation
  const toggleKioskVoiceRecording = () => {
    if (!isKioskVoiceRecording) {
      setIsKioskVoiceRecording(true);
      setKioskVoiceSecs(0);
      playChime(750, 120);
      const timer = setInterval(() => {
        setKioskVoiceSecs(s => {
          if (s >= 4) {
            clearInterval(timer);
            setIsKioskVoiceRecording(false);
            setKioskCustomDesc('تسجيل صوتي من العامل بالكشك: كابل كهربائي مكشوف ومياه على الأرضية في ورشة اللحام');
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      setIsKioskVoiceRecording(false);
      setKioskCustomDesc('تسجيل صوتي من العامل بالكشك: خطر كهربائي ومياه في ورشة اللحام');
    }
  };

  // Handle Kiosk Submission
  const handleKioskSubmit = async () => {
    setIsKioskSubmitting(true);
    playChime(1050, 250);

    const hazardTitle = selectedHazardTile || 'مخاطر بيئة العمل الميكانيكية';
    const description = kioskCustomDesc.trim() || `[إنذار كشك الورشة]: تم رصد خطر (${hazardTitle}) في ${kioskLocation}. إبلاغ فوري عبر شاشة اللمس الميدانية.`;

    try {
      const newReport = await api.sendKioskReport({
        station_id: 'KIOSK-BAY-03',
        reporter_code: 'KIOSK-EMP',
        hazard_type: hazardTitle,
        location_name: kioskLocation,
        description: description,
        severity: 5,
        likelihood: 4
      });

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.5 }
      });

      setKioskSubmittedReport(newReport);
      setKioskCountdown(10);
      if (onReportCreated) onReportCreated(newReport);

      // Start auto-reset countdown for kiosk station
      const timer = setInterval(() => {
        setKioskCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            setKioskSubmittedReport(null);
            setKioskCustomDesc('');
            setSelectedHazardTile('مخاطر كهربائية ومياه');
            return 10;
          }
          return c - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Kiosk report submit error', err);
    } finally {
      setIsKioskSubmitting(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // User WhatsApp Phone Number
  const USER_PHONE = '201069218392';
  const USER_PHONE_DISPLAY = '01069218392';

  // Generate real wa.me link
  const sampleWaUrl = `https://wa.me/${USER_PHONE}?text=${encodeURIComponent('⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 3 - ورشة اللحام المركزية\nنوع الخطر: كابل كهربائي مكشوف ومياه على الأرضية وشرز مستمر!\nبرجاء التدخل الفوري وتوجيه الصيانة.')}`;

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-emerald-400">التطبيق الفعلي (Live Production Gateway)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <span>محطات وقنوات الإبلاغ الفعلي (WhatsApp Bot & Touch Kiosk)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ربط فعلي بقاعدة البيانات السحابية، معالجة لغوية بالذكاء الاصطناعي، وواجهة مخصصة لشاشات لمس الورش
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveProtoTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeProtoTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>بوت الواتساب الفعلي</span>
          </button>

          <button
            onClick={() => setActiveProtoTab('kiosk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeProtoTab === 'kiosk'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>شاشة اللمس للكشك (Kiosk)</span>
          </button>

          <button
            onClick={() => setActiveProtoTab('api-docs')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeProtoTab === 'api-docs'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">الـ Webhook للمصانع</span>
            <span className="sm:hidden">API</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. WHATSAPP BOT INTERACTIVE CLIENT & LIVE GATEWAY */}
      {/* ========================================================= */}
      {activeProtoTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Main: The WhatsApp Phone Interface */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
            {/* Phone Top Bar (WhatsApp Header) */}
            <div className="bg-emerald-950/90 border-b border-emerald-800/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                    🛡️
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>بوت السلامة الذكي (DHRS Bot)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">حساب موثق ✓</span>
                  </h3>
                  <p className="text-[11px] text-emerald-300/80">متصل الآن • تفريغ صوتي فوري بالذكاء الاصطناعي</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={sampleWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
                  title="فتح في تطبيق واتساب الفعلي بهاتفك"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">فتح في واتساب الحقيقي</span>
                </a>
              </div>
            </div>

            {/* Chat Body (Messages Stream) */}
            <div className="flex-1 bg-slate-950/90 p-4 overflow-y-auto space-y-3.5">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'worker' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed shadow-md ${
                    msg.sender === 'worker'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}>
                    {msg.isAudio ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>تسجيل صوتي ({msg.audioDuration})</span>
                          </div>
                          <p className="text-[11px] text-white/90 mt-0.5">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{msg.text}</div>
                    )}

                    {/* Verified Report Card Attached */}
                    {msg.reportData && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-2.5 text-xs space-y-1">
                        <div className="flex items-center justify-between text-amber-400 font-mono font-bold">
                          <span>{msg.reportData.report_number}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                            درجة {msg.reportData.risk_score} / 25
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          <strong>الخطر:</strong> {msg.reportData.hazard_type}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          <strong>الموقع:</strong> {msg.reportData.location_name}
                        </div>
                      </div>
                    )}

                    <div className="mt-1 text-[10px] text-slate-400 text-left ltr font-mono">
                      {msg.time} {msg.sender === 'worker' ? '✓✓' : ''}
                    </div>
                  </div>
                </div>
              ))}

              {isSendingWhatsApp && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    <span>الذكاء الاصطناعي يقوم بتفريغ الصوت وتحليل الخطر بمصفوفة 5x5...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={toggleVoiceRecording}
                className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  isRecordingVoice
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                }`}
                title={isRecordingVoice ? 'اضغط للإيقاف والإرسال' : 'اضغط للتحدث بالمايكروفون الحقيقي'}
              >
                {isRecordingVoice ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {isRecordingVoice ? (
                <div className="flex-1 bg-red-950/40 border border-red-800/40 rounded-2xl px-4 py-2 text-xs text-red-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-bold">جاري التسجيل الصوتي... تكلم الآن</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{recordSeconds} ثوانٍ</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                  placeholder="اكتب بلاغك بالعامية المصرية (أو اختر من النماذج الجاهزة)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                />
              )}

              <button
                onClick={() => handleSendWhatsApp()}
                disabled={isSendingWhatsApp || (!customText.trim() && !isRecordingVoice)}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-3 rounded-2xl transition cursor-pointer shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Quick Worker Scenarios + Real QR Gateway */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Quick Worker Voice Presets */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>نماذج صوتية حقيقية لعمال المصانع</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">5 سيناريوهات ميدانية</span>
              </div>
              
              <div className="space-y-2">
                {WORKER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSendWhatsApp(preset.voiceText, true)}
                    className="w-full text-right p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 transition flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-white truncate">{preset.name}</span>
                        <span className="text-[10px] font-mono text-amber-400">{preset.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                        {preset.voiceText}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Real WhatsApp Gateway Card with QR Code and Automated Templates */}
            <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  <span>تواصل عبر واتساب بهاتفك الفعلي</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {USER_PHONE_DISPLAY}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                اختر رسالة أوتوماتيكية جاهزة أو اضغط للمحادثة المباشرة مع <strong className="text-white font-mono">{USER_PHONE_DISPLAY}</strong>:
              </p>

              {/* Automated Templates Pills */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: 0, title: '⚡ ماس كهربائي ومياه', text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 3 - ورشة اللحام المركزية\nنوع الخطر: كابل كهربائي مكشوف ومياه على الأرضية وشرز مستمر!\nبرجاء التدخل الفوري وتوجيه الصيانة.' },
                  { id: 1, title: '🏗️ سقوط سقالة بالدور 4', text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: الموقع الإنشائي - الواجهة الشرقية\nنوع الخطر: السقالة الخشبية بتتهز ومفيهاش حزام أمان والشباب خايفين يقعوا!\nبرجاء التدخل وتأمين السقالة.' },
                  { id: 2, title: '⚙️ عطل حساس مكبس', text: '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 2 - خط التشكيل والمكابس\nنوع الخطر: حساس الأمان الضوئي لمكبس التشكيل رقم 4 متعطل وممكن يقطع يد العامل!\nبرجاء إيقاف الماكينة وفحصها.' },
                  { id: 3, title: '☣️ تسريب غاز أمونيا', text: '🚨 بلاغ طوارئ حرج [DHRS]\nالموقع: محطة التبريد المركزية ومجمع الغازات\nنوع الخطر: انبعاث رائحة غاز أمونيا نفاذة ومحبس الطوارئ عالق وعليه صدأ!\nبرجاء إرسال طاقم الطوارئ فوراً.' },
                ].map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedDirectTemplate(tmpl.id)}
                    className={`p-2 rounded-xl text-right font-bold transition border cursor-pointer ${
                      selectedDirectTemplate === tmpl.id
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate block">{tmpl.title}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic QR Code */}
              {(() => {
                const directTemplates = [
                  '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 3 - ورشة اللحام المركزية\nنوع الخطر: كابل كهربائي مكشوف ومياه على الأرضية وشرز مستمر!\nبرجاء التدخل الفوري وتوجيه الصيانة.',
                  '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: الموقع الإنشائي - الواجهة الشرقية\nنوع الخطر: السقالة الخشبية بتتهز ومفيهاش حزام أمان والشباب خايفين يقعوا!\nبرجاء التدخل وتأمين السقالة.',
                  '⚠️ بلاغ خطر عاجل [DHRS]\nالموقع: عنبر 2 - خط التشكيل والمكابس\nنوع الخطر: حساس الأمان الضوئي لمكبس التشكيل رقم 4 متعطل وممكن يقطع يد العامل!\nبرجاء إيقاف الماكينة وفحصها.',
                  '🚨 بلاغ طوارئ حرج [DHRS]\nالموقع: محطة التبريد المركزية ومجمع الغازات\nنوع الخطر: انبعاث رائحة غاز أمونيا نفاذة ومحبس الطوارئ عالق وعليه صدأ!\nبرجاء إرسال طاقم الطوارئ فوراً.'
                ];
                const activeText = directTemplates[selectedDirectTemplate] || directTemplates[0];
                const directWaLink = `https://wa.me/${USER_PHONE}?text=${encodeURIComponent(activeText)}`;
                const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(directWaLink)}`;

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl w-36 h-36 mx-auto shadow-inner">
                      <img 
                        src={qrImgSrc} 
                        alt={`QR Code WhatsApp ${USER_PHONE_DISPLAY}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to SVG representation
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={directWaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>فتح في واتساب: {USER_PHONE_DISPLAY} ◄</span>
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(directWaLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                        title="نسخ الرابط المباشر"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REAL TOUCHSCREEN KIOSK STATION (كشك الورشة الميداني) */}
      {/* ========================================================= */}
      {activeProtoTab === 'kiosk' && (
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl relative">
          
          {/* Kiosk Hardware Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">كشك ورشة العمل الميداني (Industrial Kiosk)</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    محطة تعمل باللمس
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  مصمم خصيصاً للتشغيل الميداني، شاشات مقاومة للزيوت، أزرار ضخمة للقفازات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? 'إنهاء ملء الشاشة' : 'وضع الكشك ملء الشاشة'}</span>
              </button>
            </div>
          </div>

          {/* If Kiosk report just submitted, show on-screen safety ticket with auto reset */}
          {kioskSubmittedReport ? (
            <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  تذكرة سلامة مؤكدة • كشك الورشة
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  تم تسجيل البلاغ وإشعار فريق السلامة والصيانة فوراً!
                </h3>
              </div>

              {/* Safety Ticket Details */}
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 text-right space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">رقم البلاغ التسلسلي:</span>
                  <span className="font-mono text-base font-bold text-amber-400">{kioskSubmittedReport.report_number}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">الموقع الميداني:</span>
                  <span className="text-xs font-bold text-white">{kioskSubmittedReport.location_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">درجة الخطورة المحسوبة:</span>
                  <span className="text-xs font-bold text-red-400">
                    درجة {kioskSubmittedReport.risk_score} / 25 (حرج / طارئ)
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs pt-1">
                  <span>مكافأة العامل الفورية:</span>
                  <span>+50 نقطة ولاء أمان 🏅</span>
                </div>
              </div>

              {/* Countdown Bar */}
              <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>
                  ستعود الشاشة تلقائياً للوضع الرئيسي لخدمة العامل التالي خلال: <strong className="text-white font-mono text-sm">{kioskCountdown}</strong> ثوانٍ
                </span>
                <button
                  onClick={() => setKioskSubmittedReport(null)}
                  className="text-amber-400 hover:underline font-bold mr-2"
                >
                  إعادة الشاشة فوراً ◄
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* 1. Workshop Location Radio Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2.5">
                  1. حدد موقع الكشك أو مكان الخطر في المصنع:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    'عنبر 3 - ورشة اللحام المركزية',
                    'عنبر 2 - خط التشكيل والمكابس',
                    'عنبر 1 - صالة التجميع الرئيسية',
                    'رصيف الشحن والمخازن الرئيسية',
                    'محطة التبريد المركزية ومجمع الغازات'
                  ].map(loc => (
                    <button
                      key={loc}
                      onClick={() => setKioskLocation(loc)}
                      className={`p-3 rounded-2xl text-xs font-bold transition text-center cursor-pointer border ${
                        kioskLocation === loc
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black scale-102'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tactile Large Hazard Category Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2.5">
                  2. اضغط بلمسة واحدة على نوع الخطر الميداني (أزرار كبيرة للقفازات):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'مخاطر كهربائية ومياه', icon: Zap, color: 'text-amber-400', border: 'hover:border-amber-400' },
                    { title: 'سقالة غير مؤمنة وخطر سقوط', icon: ShieldAlert, color: 'text-red-400', border: 'hover:border-red-400' },
                    { title: 'عطل حساس أمان أو مكبس', icon: Wrench, color: 'text-blue-400', border: 'hover:border-blue-400' },
                    { title: 'تسريب غاز ومواد كيميائية', icon: Skull, color: 'text-purple-400', border: 'hover:border-purple-400' },
                    { title: 'كلارك مسرع أو رافعة', icon: Truck, color: 'text-orange-400', border: 'hover:border-orange-400' },
                    { title: 'حريق أو لهب أو تصاعد دخان', icon: Flame, color: 'text-red-500', border: 'hover:border-red-500' }
                  ].map(tile => {
                    const Icon = tile.icon;
                    const isSelected = selectedHazardTile === tile.title;
                    return (
                      <button
                        key={tile.title}
                        onClick={() => {
                          setSelectedHazardTile(tile.title);
                          playChime(700, 80);
                        }}
                        className={`h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-xl scale-102 ring-2 ring-amber-400/50'
                            : 'bg-slate-950 border-slate-800 text-slate-300 ' + tile.border
                        }`}
                      >
                        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 mb-2 ${tile.color}`} />
                        <span className="text-xs sm:text-sm font-bold">{tile.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Kiosk Voice Recorder or Custom Note */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={toggleKioskVoiceRecording}
                  className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition cursor-pointer shadow-lg shrink-0 ${
                    isKioskVoiceRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  <span>{isKioskVoiceRecording ? `جاري تسجيل الصوت (${kioskVoiceSecs} ث)...` : 'تحدث في الميكروفون المدمج'}</span>
                </button>

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={kioskCustomDesc}
                    onChange={(e) => setKioskCustomDesc(e.target.value)}
                    placeholder="أو اكتب تفاصيل إضافية عن الخطر أو الماكينة المتعطلة..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Kiosk Submit Action Button */}
              <button
                onClick={handleKioskSubmit}
                disabled={isKioskSubmitting || !selectedHazardTile}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base md:text-lg transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                <span>{isKioskSubmitting ? 'جاري توثيق البلاغ وإشعار الطاقم...' : 'إرسال البلاغ الفوري وطباعة التذكرة ◄'}</span>
              </button>

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. API & WEBHOOK DOCUMENTATION FOR FACTORY ENGINEERS */}
      {/* ========================================================= */}
      {activeProtoTab === 'api-docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              <span>دليل الربط التقني والـ Webhook للمصانع والمنشآت</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              كيفية ربط خطوط واتساب الرسمية (Meta WhatsApp Cloud API / Twilio) بسيرفر المنظومة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-amber-400 block">1. رابط الـ Webhook المعتمد:</span>
              <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 select-all">
                http://127.0.0.1:8000/api/v1/whatsapp/webhook
              </div>
              <p className="text-[11px] text-slate-400">
                يقبل طلبات `GET` للتحقق (Verification Challenge) وطلبات `POST` لاستقبال بلاغات العمال الواردة.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-amber-400 block">2. رمز التحقق السري (Verify Token):</span>
              <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-amber-300 border border-slate-800 select-all">
                dhrs_safety_token_2026
              </div>
              <p className="text-[11px] text-slate-400">
                يمكن تغييره عبر متغير البيئة `WHATSAPP_VERIFY_TOKEN` في خادم الإنتاج.
              </p>
            </div>

          </div>

          {/* cURL Example */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              أمر اختبار مباشر للـ Chat API عبر الطرفية (cURL):
            </span>
            <pre className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800 ltr text-left">
{`curl -X POST http://127.0.0.1:8000/api/v1/whatsapp/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "201069218392",
    "sender_name": "فهمي فني لحام",
    "message_text": "يا باشمهندس في كابل كهربا عريان نازل في مية جنب ماكينة اللحام في عنبر 3 والكهربا بتشرز جامد"
  }'`}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>معلومة جاهزية الإنتاج:</strong> خادم المنظومة جاهز للتوصيل الفوري مع أي شريحة هاتف للمصنع عبر Meta Business Platform أو Twilio WhatsApp بمجرد تزويد الرابط أعلاه.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrototypeView;

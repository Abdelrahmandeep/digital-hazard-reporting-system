"""
محرك حساب درجات ومستويات الخطورة وفقاً لـ 5x5 Risk Matrix
Digital Hazard Reporting System
"""
from typing import Dict, Any, Tuple

LIKELIHOOD_LABELS = {
    1: {"ar": "نادر", "en": "Rare", "desc": "احتمال الحدوث ضعيف جداً أو استثنائي"},
    2: {"ar": "غير محتمل", "en": "Unlikely", "desc": "قد يحدث في ظروف نادرة"},
    3: {"ar": "محتمل", "en": "Possible", "desc": "يمكن أن يحدث في بعض الأوقات"},
    4: {"ar": "محتمل جداً", "en": "Likely", "desc": "من المتوقع حدوثه في معظم الظروف"},
    5: {"ar": "شبه مؤكد", "en": "Almost Certain", "desc": "متكرر أو وشيك الحدوث ما لم يتم التدخل"}
}

SEVERITY_LABELS = {
    1: {"ar": "ضئيل", "en": "Insignificant", "desc": "إصابات خدش طفيفة لا تتطلب إسعاف"},
    2: {"ar": "بسيط", "en": "Minor", "desc": "إسعافات أولية موقعية دون انقطاع العمل"},
    3: {"ar": "متوسط", "en": "Moderate", "desc": "علاج طبي وانقطاع مؤقت عن العمل"},
    4: {"ar": "كبير", "en": "Major", "desc": "إصابات بليغة أو عجز جزئي أو تلف معدات جسيم"},
    5: {"ar": "كارثي", "en": "Catastrophic", "desc": "وفاة أو إصابات متعددة بالغة أو توقف المنشأة"}
}

HAZARD_TYPES = {
    "electrical": {"ar": "مخاطر كهربائية", "icon": "Zap", "color": "amber"},
    "mechanical": {"ar": "مخاطر ميكانيكية ومعدات", "icon": "Cog", "color": "blue"},
    "slip_fall": {"ar": "انزلاق وتعثر وسقوط", "icon": "AlertTriangle", "color": "orange"},
    "chemical": {"ar": "مخاطر كيميائية ومواد سامة", "icon": "FlaskConical", "color": "purple"},
    "fire": {"ar": "مخاطر حريق وانفجار", "icon": "Flame", "color": "red"},
    "structural": {"ar": "مخاطر إنشائية ومباني", "icon": "Building", "color": "stone"},
    "environmental": {"ar": "مخاطر بيئية وانبعاثات", "icon": "Wind", "color": "emerald"},
    "ppe": {"ar": "عدم الالتزام بمعدات الوقاية (PPE)", "icon": "ShieldAlert", "color": "cyan"},
    "other": {"ar": "مخاطر أخرى عامة", "icon": "HelpCircle", "color": "slate"}
}

def calculate_risk(severity: int, likelihood: int) -> Dict[str, Any]:
    """
    حساب درجة الخطورة بناءً على مصفوفة المخاطر 5x5
    """
    # Validation
    severity = max(1, min(5, int(severity)))
    likelihood = max(1, min(5, int(likelihood)))
    
    score = severity * likelihood
    
    if score >= 17:
        level = "critical"
        label_ar = "حرج / طارئ"
        color = "#ef4444"
        badge_bg = "bg-red-500/10 text-red-400 border-red-500/30"
        action_ar = "إيقاف العمل فوراً في منطقة الخطر وإرسال تنبيه طوارئ فوري لمهندسي السلامة والمدير"
        requires_immediate_alert = True
    elif score >= 10:
        level = "high"
        label_ar = "عالي الخطورة"
        color = "#f97316"
        badge_bg = "bg-orange-500/10 text-orange-400 border-orange-500/30"
        action_ar = "إجراء تصحيحي عاجل خلال ساعات وتنبيه فوري لمهندس السلامة المناوب"
        requires_immediate_alert = True
    elif score >= 6:
        level = "medium"
        label_ar = "متوسط الخطورة"
        color = "#eab308"
        badge_bg = "bg-amber-500/10 text-amber-400 border-amber-500/30"
        action_ar = "جدولة المعالجة والمتابعة خلال 24-48 ساعة مع وضع إرشادات تحذيرية"
        requires_immediate_alert = False
    else:
        level = "low"
        label_ar = "منخفض الخطورة"
        color = "#10b981"
        badge_bg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        action_ar = "إجراء وقائي ومتابعة اعتيادية ضمن الصيانة الدورية"
        requires_immediate_alert = False
        
    return {
        "score": score,
        "level": level,
        "label_ar": label_ar,
        "color": color,
        "badge_bg": badge_bg,
        "action_ar": action_ar,
        "requires_immediate_alert": requires_immediate_alert,
        "severity": severity,
        "likelihood": likelihood,
        "severity_info": SEVERITY_LABELS.get(severity),
        "likelihood_info": LIKELIHOOD_LABELS.get(likelihood)
    }

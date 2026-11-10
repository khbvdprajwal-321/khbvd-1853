export type ThoughtLanguage = 'en' | 'kn' | 'hi' | 'sa' | 'ur';

const THOUGHTS: Record<ThoughtLanguage, string[]> = {
  en: [
    'Small steps, taken every day, can carry you to remarkable places.',
    'Your curiosity today is building the confidence you will use tomorrow.',
    'Every thoughtful question is a doorway to new understanding.',
    'Keep showing up for your dreams; steady effort makes them stronger.',
    'Learning grows brighter when you are patient with yourself.',
    'A little progress today is still progress worth celebrating.',
    'Your ideas matter. Give them time, practice and room to grow.',
    'Kindness and knowledge together can make a lasting difference.',
    'Believe in the learner you are becoming, one lesson at a time.',
    'Consistency turns the things you practise into strengths.',
    'You do not need to know everything to take your next good step.',
    'Your effort today is a gift to the future you.',
  ],
  kn: [
    'ಪ್ರತಿದಿನದ ಚಿಕ್ಕ ಹೆಜ್ಜೆಗಳು ನಿಮ್ಮನ್ನು ದೊಡ್ಡ ಗುರಿಗಳತ್ತ ಕರೆದೊಯ್ಯುತ್ತವೆ.',
    'ಇಂದಿನ ಕುತೂಹಲ ನಾಳೆಯ ಆತ್ಮವಿಶ್ವಾಸಕ್ಕೆ ಬುನಾದಿ.',
    'ಪ್ರತಿ ಒಳ್ಳೆಯ ಪ್ರಶ್ನೆಯೂ ಹೊಸ ತಿಳುವಳಿಕೆಯ ಬಾಗಿಲು.',
    'ನಿಮ್ಮ ಕನಸುಗಳಿಗಾಗಿ ನಿರಂತರವಾಗಿ ಪ್ರಯತ್ನಿಸಿ; ನಿಮ್ಮ ಶ್ರಮ ಅವುಗಳಿಗೆ ಬಲ ನೀಡುತ್ತದೆ.',
    'ನಿಮ್ಮ ಮೇಲೆ ತಾಳ್ಮೆ ಇಟ್ಟಾಗ ಕಲಿಕೆ ಇನ್ನಷ್ಟು ಸುಂದರವಾಗುತ್ತದೆ.',
    'ಇಂದಿನ ಸ್ವಲ್ಪ ಪ್ರಗತಿಯೂ ಸಂಭ್ರಮಿಸಲು ಅರ್ಹವಾಗಿದೆ.',
    'ನಿಮ್ಮ ಆಲೋಚನೆಗಳಿಗೆ ಅಭ್ಯಾಸ ಮತ್ತು ಬೆಳವಣಿಗೆಗೆ ಅವಕಾಶ ನೀಡಿ.',
    'ದಯೆ ಮತ್ತು ಜ್ಞಾನ ಒಟ್ಟಾಗಿ ಜಗತ್ತಿನಲ್ಲಿ ಒಳ್ಳೆಯ ಬದಲಾವಣೆ ತರುತ್ತವೆ.',
    'ಪ್ರತಿ ಪಾಠದೊಂದಿಗೆ ಬೆಳೆಯುತ್ತಿರುವ ನಿಮ್ಮನ್ನು ನಂಬಿ.',
    'ನಿರಂತರ ಅಭ್ಯಾಸವು ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.',
    'ಮುಂದಿನ ಒಳ್ಳೆಯ ಹೆಜ್ಜೆ ಇಡಲು ಎಲ್ಲವನ್ನೂ ತಿಳಿದಿರಬೇಕಿಲ್ಲ.',
    'ಇಂದಿನ ಪರಿಶ್ರಮ ನಿಮ್ಮ ಭವಿಷ್ಯಕ್ಕೆ ಅಮೂಲ್ಯ ಕೊಡುಗೆ.',
  ],
  hi: [
    'हर दिन का छोटा कदम आपको बड़े सपनों के करीब ले जाता है।',
    'आज की जिज्ञासा कल के आत्मविश्वास की नींव है।',
    'हर अच्छा सवाल नई समझ का दरवाज़ा खोलता है।',
    'अपने सपनों के लिए लगातार प्रयास करें; मेहनत उन्हें मजबूत बनाती है।',
    'खुद के प्रति धैर्य रखने से सीखना और सुंदर बनता है।',
    'आज की थोड़ी-सी प्रगति भी खुशी मनाने योग्य है।',
    'अपने विचारों को अभ्यास और आगे बढ़ने का अवसर दें।',
    'दयालुता और ज्ञान मिलकर दुनिया में अच्छा बदलाव ला सकते हैं।',
    'हर पाठ के साथ बेहतर बन रहे अपने रूप पर भरोसा रखें।',
    'नियमित अभ्यास आपकी क्षमताओं को मजबूत बनाता है।',
    'अगला अच्छा कदम उठाने के लिए सब कुछ जानना ज़रूरी नहीं।',
    'आज की मेहनत आपके भविष्य के लिए अनमोल उपहार है।',
  ],
  sa: [
    'प्रतिदिनं लघवः प्रयासाः महान् लक्ष्यं साधयन्ति।',
    'अद्यतनं जिज्ञासु मनः श्वः आत्मविश्वासं वर्धयति।',
    'प्रत्येकः उत्तमः प्रश्नः नूतनज्ञानस्य द्वारम् उद्घाटयति।',
    'स्वप्नसिद्धये निरन्तरं प्रयतस्व; अभ्यासः सामर्थ्यं वर्धयति।',
    'आत्मनि धैर्यं धारय; तदा अध्ययनं सुखकरं भवति।',
    'अद्यतनः अल्पः प्रगतिरपि अभिनन्दनीयः।',
    'स्वविचारान् अभ्यासेन विकसितुं अवसरं देहि।',
    'दया ज्ञानं च मिलित्वा जगति हितं कुर्वतः।',
    'प्रतिपाठेन वर्धमानं स्वं विश्वसिहि।',
    'नियमितः अभ्यासः कौशलं दृढं करोति।',
    'अग्रे गन्तुं सर्वं ज्ञातव्यमिति नास्ति।',
    'अद्यतनः परिश्रमः भवतः भविष्याय उपहारः।',
  ],
  ur: [
    'ہر روز کا چھوٹا قدم آپ کو بڑے خوابوں کے قریب لے جاتا ہے۔',
    'آج کا تجسس کل کے اعتماد کی بنیاد ہے۔',
    'ہر اچھا سوال نئی سمجھ کا دروازہ کھولتا ہے۔',
    'اپنے خوابوں کے لیے مسلسل کوشش کریں؛ محنت انہیں مضبوط بناتی ہے۔',
    'اپنے ساتھ صبر کرنے سے سیکھنا مزید خوشگوار ہوتا ہے۔',
    'آج کی تھوڑی سی پیش رفت بھی خوشی منانے کے قابل ہے۔',
    'اپنے خیالات کو مشق اور ترقی کا موقع دیں۔',
    'مہربانی اور علم مل کر دنیا میں اچھی تبدیلی لا سکتے ہیں۔',
    'ہر سبق کے ساتھ بہتر ہوتے اپنے آپ پر بھروسا رکھیں۔',
    'باقاعدہ مشق آپ کی صلاحیتوں کو مضبوط کرتی ہے۔',
    'اگلا اچھا قدم اٹھانے کے لیے سب کچھ جاننا ضروری نہیں۔',
    'آج کی محنت آپ کے مستقبل کے لیے ایک قیمتی تحفہ ہے۔',
  ],
};

const LANGUAGE_LOCALES: Record<ThoughtLanguage, string> = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
  sa: 'sa-IN',
  ur: 'ur-IN',
};

const THOUGHT_TITLES: Record<ThoughtLanguage, string> = {
  en: 'Your Daily Thought',
  kn: 'ನಿಮ್ಮ ಇಂದಿನ ಚಿಂತನೆ',
  hi: 'आज का विचार',
  sa: 'अद्यतनः विचारः',
  ur: 'آج کی سوچ',
};

function languageCode(value: string | null | undefined): ThoughtLanguage {
  const normalized = value?.toLowerCase();
  if (normalized === 'kannada' || normalized === 'kn') return 'kn';
  if (normalized === 'hindi' || normalized === 'hi') return 'hi';
  if (normalized === 'sanskrit' || normalized === 'sa') return 'sa';
  if (normalized === 'urdu' || normalized === 'ur') return 'ur';
  return 'en';
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getDailyThought(language: string | null | undefined, date = new Date()) {
  const lang = languageCode(language);
  const dateKey = localDateKey(date);
  const cacheKey = `khbvd-daily-thought:${lang}:${dateKey}`;
  const thoughts = THOUGHTS[lang];
  const bundledThought = thoughts[stableHash(`${dateKey}:${lang}`) % thoughts.length];
  const title = THOUGHT_TITLES[lang];

  try {
    const cached = window.localStorage.getItem(cacheKey);
    if (cached === bundledThought) return { title, text: cached, dateKey, locale: LANGUAGE_LOCALES[lang] };
    window.localStorage.setItem(cacheKey, bundledThought);
  } catch {
    // The bundled daily selection remains available when browser storage is disabled.
  }

  return { title, text: bundledThought, dateKey, locale: LANGUAGE_LOCALES[lang] };
}

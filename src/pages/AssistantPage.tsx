import { useState } from 'react';
import { ArrowLeft, BookOpen, Briefcase, CheckCircle, Compass, GraduationCap, Heart, Lightbulb, MessageCircle, Mic, MicOff, Send, Target, TrendingUp, Volume2 } from 'lucide-react';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResultLike[] }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type BrowserWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const routines = [
  { title: 'CET routine', detail: 'Revise one concept, solve 20 mixed questions, then review every mistake.' },
  { title: 'NEET routine', detail: 'Give Biology the largest daily block, then rotate Chemistry and Physics with timed practice.' },
  { title: 'JEE routine', detail: 'Study the concept, solve progressively harder problems, and keep a short formula notebook.' },
  { title: 'Biology routine', detail: 'Read the summary, recall key diagrams, answer practice questions, and revisit weak topics the next day.' },
];

const quickPrompts = [
  'Which path is right for me?',
  'CET subject weightage',
  'Is Physics tough in NEET?',
  'Study plan for 1st PUC PCMB',
  'How to prepare for Infosys?',
  'Motivate me to study',
];

const offTopicKeywords = [
  'geography', 'social science', 'social studies', 'history', 'civics',
  'political science', 'economics', 'sociology', 'philosophy', 'psychology',
  'archaeology', 'anthropology', 'linguistics', 'literature', 'english grammar',
  'essay', 'poem', 'novel', 'story writing', 'music', 'painting', 'art',
  'cooking', 'recipe', 'travel', 'movie', 'game', 'sport', 'cricket', 'football',
  'news', 'politics', 'election', 'government policy', 'weather', 'astrology',
  'horoscope', 'religion', 'spiritual', 'gossip', 'celebrity',
];

const allowedTopics = [
  'cet', 'neet', 'jee', 'puc', 'physics', 'chemistry', 'mathematics', 'maths',
  'biology', 'botany', 'zoology', 'degree', 'coding', 'programming', 'python',
  'c programming', 'c++', 'java', 'dbms', 'data structures', 'operating system',
  'web development', 'machine learning', 'statistics', 'exam', 'assignment',
  'homework', 'study', 'routine', 'plan', 'motivation', 'tough', 'easy',
  'difficult', 'weightage', 'syllabus', 'subject', 'company', 'job', 'career',
  'interview', 'resume', 'skill', 'semester', 'department', 'engineering',
  'mba', 'diploma', 'learn', 'practice', 'test', 'score', 'improve', 'preparation',
  'time table', 'schedule', 'revision', 'formula', 'diagram', 'topic',
  'electronics', 'thermodynamics', 'circuit', 'mechanical', 'civil',
  'electrical', 'computer science', 'information science', 'data science',
  'cloud', 'cybersecurity', 'software', 'algorithm', 'sql',
];

function isOffTopic(_message: string): boolean {
  return false;
}

function getSubjectWeightage(stream: string): string {
  if (stream === 'cet') {
    return [
      'CET subject weightage (Karnataka):',
      'Mathematics — 60 marks, 60 questions. Highest weightage. Topics: Algebra, Calculus, Coordinate Geometry.',
      'Physics — 60 marks, 60 questions. Mechanics and Electromagnetism carry the most marks.',
      'Chemistry — 60 marks, 60 questions. Physical, Organic, and Inorganic are roughly equal.',
      'Biology — 60 marks, 60 questions (for PCB students). Botany and Zoology are balanced.',
      '',
      'Tip: Mathematics and Physics decide your rank. Give them the largest daily block.',
    ].join('\n');
  }
  if (stream === 'neet') {
    return [
      'NEET subject weightage (out of 720 total):',
      'Biology — 360 marks, 90 questions (50% of total). Botany and Zoology are equal.',
      'Chemistry — 180 marks, 45 questions. Organic and Physical Chemistry carry more marks.',
      'Physics — 180 marks, 45 questions. Mechanics and Electrodynamics are the biggest sections.',
      '',
      'Tip: Biology is your biggest scoring area. Master it first, then push Physics and Chemistry.',
    ].join('\n');
  }
  if (stream === 'jee') {
    return [
      'JEE (Main) subject weightage (out of 300 total):',
      'Mathematics — 100 marks, 30 questions. Calculus and Algebra are the highest-weighted topics.',
      'Physics — 100 marks, 30 questions. Mechanics and Modern Physics carry the most marks.',
      'Chemistry — 100 marks, 30 questions. Organic and Physical Chemistry are the biggest.',
      '',
      'Tip: All three subjects are equal in JEE. Do not skip any subject.',
    ].join('\n');
  }
  return 'Ask me about CET, NEET, or JEE subject weightage and I will break it down for you.';
}

function getToughEasyGuidance(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('physics')) {
    if (text.includes('neet') || text.includes('cet')) {
      return 'Physics is considered the toughest subject in NEET and CET because it tests application, not just memorization. The tough topics are Rotational Motion, Electromagnetism, and Modern Physics. The easier topics are Kinematics, Laws of Motion, and Work-Energy. Strategy: master the easy topics first for guaranteed marks, then tackle the tough ones with daily problem practice.';
    }
    if (text.includes('jee')) {
      return 'In JEE Physics, the toughest topics are Rotational Dynamics, Electromagnetism, and Thermodynamics. The easier topics are Kinematics, Units and Dimensions, and Oscillations. Start with the easy ones to build confidence, then spend extra time on the tough topics with solved examples.';
    }
    return 'Physics tough topics: Rotational Motion, Electromagnetism, Modern Physics. Easy topics: Kinematics, Units, Laws of Motion. Master easy topics first for guaranteed marks.';
  }
  if (text.includes('chemistry')) {
    if (text.includes('neet') || text.includes('cet')) {
      return 'Chemistry in NEET/CET is the most scoring subject. Physical Chemistry (Mole Concept, Thermodynamics) is tough because of calculations. Organic Chemistry (Reactions, Named Reactions) is medium — memorize + understand. Inorganic Chemistry (Periodic Table, Coordination Compounds) is easy if you revise regularly. Strategy: finish Inorganic first, then Physical, then Organic.';
    }
    return 'Chemistry: Physical is calculation-heavy (tough), Organic needs understanding (medium), Inorganic needs memory (easy with revision).';
  }
  if (text.includes('biology') || text.includes('botany') || text.includes('zoology')) {
    return 'Biology in NEET is the most scoring subject. Botany (Plant Physiology, Ecology) is generally easier. Zoology (Human Physiology, Genetics) has some tough chapters like Biotechnology and Genetics. Strategy: read NCERT line by line, draw diagrams from memory, and revise weak chapters daily.';
  }
  if (text.includes('math')) {
    return 'Mathematics in CET/JEE: tough topics are Calculus (Integration, Differential Equations), Coordinate Geometry (Conic Sections), and 3D Geometry. Easy topics are Matrices, Determinants, and Sequence and Series. Practice the easy ones first for guaranteed marks, then build up to Calculus.';
  }
  return 'Ask me which subject or topic is tough or easy for CET, NEET, or JEE and I will give you a breakdown.';
}

function getStudyPlan(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('1st puc') || text.includes('first puc') || text.includes('first year')) {
    return [
      '1st PUC Study Plan (PCMB / PCMCS):',
      'Daily: 2 hours study (1 subject concept + practice questions).',
      'Week 1-2: Finish one chapter each in Physics, Chemistry, Maths, Biology.',
      'Week 3: Solve practice questions for those chapters.',
      'Week 4: Take a timed test and review mistakes.',
      '',
      'PCMB = Physics, Chemistry, Maths, Biology. PCMCS = Physics, Chemistry, Maths, Computer Science.',
      'For PCMCS students: focus on Maths and Computer Science basics alongside Physics and Chemistry.',
    ].join('\n');
  }
  if (text.includes('2nd puc') || text.includes('second puc') || text.includes('second year')) {
    return [
      '2nd PUC Study Plan (Board + Entrance):',
      'Daily: 3-4 hours (2 hours concept + 1-2 hours practice).',
      'Phase 1 (Months 1-4): Complete all chapters in all subjects.',
      'Phase 2 (Months 5-6): Solve previous year papers and timed tests.',
      'Phase 3 (Month 7): Full revision, daily mock test, review every mistake.',
      '',
      'For CET/NEET/JEE: your board syllabus overlaps heavily. Study for boards first, then add entrance-style questions.',
    ].join('\n');
  }
  if (text.includes('semester') || text.includes('degree') || text.includes('engineering')) {
    return [
      'Degree Study Plan:',
      'Daily: 2 hours (1 hour theory + 1 hour coding/practice).',
      'Week 1-3: Learn the theory for current semester subjects.',
      'Week 4: Solve assignments and practice coding problems.',
      'Week 5: Take the KHBV.D exam for each subject.',
      'Week 6: Review weak topics and start next semester prep.',
      '',
      'For coding subjects: write code daily, even 30 minutes counts. For theory subjects: make short notes and revise weekly.',
    ].join('\n');
  }
  if (text.includes('company') || text.includes('job') || text.includes('interview')) {
    return [
      'Company Preparation Plan:',
      '1. Open Career Map and choose IT or Non-IT.',
      '2. Select your target company (e.g. Infosys, TCS, Bosch).',
      '3. Open the company post to see required skills and package.',
      '4. Learn each required skill using the Learn section.',
      '5. Practice with Assignments and Exams.',
      '6. Upload your resume for a skill-gap report.',
      '',
      'For IT companies: focus on Data Structures, Algorithms, and at least one programming language (Python/Java).',
      'For Non-IT companies: focus on core subjects like Thermodynamics, Circuit Design, or Structural Analysis.',
    ].join('\n');
  }
  return 'Tell me your year (1st PUC, 2nd PUC, or degree semester) and I will give you a detailed study plan.';
}

function getCodingGuidance(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('python')) {
    return 'Python for beginners: start with variables, loops, and functions. Then learn lists, dictionaries, and string manipulation. For placement: practice Data Structures (lists, stacks, queues), basic algorithms (sorting, searching), and solve 2-3 coding problems daily. Use the KHBV.D Learn and Exam sections to practice.';
  }
  if (text.includes('c programming') || text.includes('c++') || text.includes(' java')) {
    const lang = text.includes('c++') ? 'C++' : text.includes('java') ? 'Java' : 'C';
    return `${lang} for beginners: start with variables, data types, loops, and functions. Then learn pointers (C/C++) or objects and classes (Java). For placement: practice arrays, strings, recursion, and basic Data Structures. Write at least one program daily. Use KHBV.D Learn and Exam to test yourself.`;
  }
  if (text.includes('data structure') || text.includes('algorithm')) {
    return 'Data Structures and Algorithms: start with arrays and strings, then learn stacks, queues, linked lists, trees, and graphs. For algorithms: master sorting (bubble, selection, insertion, merge, quick) and searching (linear, binary). Practice 2 problems daily and time yourself. This is the most important topic for IT company interviews.';
  }
  if (text.includes('dbms') || text.includes('sql')) {
    return 'DBMS and SQL: start with relational model and normalization. Then learn SQL commands (SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY). For placement: practice writing queries on real data, understand indexing, and know the difference between INNER JOIN and LEFT JOIN. Use the KHBV.D Exam section to test your SQL knowledge.';
  }
  if (text.includes('web development') || text.includes('web dev')) {
    return 'Web Development: start with HTML, CSS, and JavaScript. Then learn a framework like React. For placement: build at least 2 small projects (a form page and a data display page), understand HTTP requests, and know the difference between frontend and backend. Practice in the KHBV.D Learn section.';
  }
  if (text.includes('machine learning') || text.includes(' ml ')) {
    return 'Machine Learning: start with Python, then learn linear algebra and statistics basics. Then study supervised learning (linear regression, logistic regression, decision trees) and unsupervised learning (clustering). For placement: build one small ML project and understand model evaluation metrics.';
  }
  return 'I can guide you in Python, C, C++, Java, Data Structures, DBMS, SQL, Web Development, and Machine Learning. Ask me about any coding topic and I will give you a learning path.';
}

function getAssistantReply(message: string): string {
  const text = message.toLowerCase();

  if (text.includes('weightage') || text.includes('marks distribution') || text.includes('marks pattern')) {
    if (text.includes('neet')) return getSubjectWeightage('neet');
    if (text.includes('jee')) return getSubjectWeightage('jee');
    if (text.includes('cet')) return getSubjectWeightage('cet');
    return 'Ask me about CET, NEET, or JEE weightage and I will break it down.';
  }

  if (text.includes('tough') || text.includes('easy') || text.includes('difficult') || text.includes('hard topic') || text.includes('easy topic')) {
    return getToughEasyGuidance(message);
  }

  if (text.includes('study plan') || text.includes('time table') || text.includes('schedule') || text.includes('routine') || text.includes('1st puc') || text.includes('2nd puc') || text.includes('first puc') || text.includes('second puc') || text.includes('semester plan')) {
    return getStudyPlan(message);
  }

  if (text.includes('pcmb')) {
    return 'PCMB stream: Physics, Chemistry, Mathematics, and Biology. This is ideal for students who want to keep both engineering (CET/JEE) and medical (NEET) options open. Strategy: give Maths and Biology equal time, with Physics and Chemistry shared between both paths. Use the KHBV.D Learn, Assignment, and Exam sections for all four subjects.';
  }
  if (text.includes('pcmcs')) {
    return 'PCMCS stream: Physics, Chemistry, Mathematics, and Computer Science. This is ideal for students aiming for engineering and IT careers. Strategy: focus on Maths and Computer Science alongside Physics and Chemistry. Start coding early — practice Python or C in the KHBV.D Learn section.';
  }
  if (text.includes('puc') || text.includes('pu college') || text.includes('pre university')) {
    return 'PUC (Pre-University) in Karnataka has two main science streams: PCMB (Physics, Chemistry, Maths, Biology) for students keeping both medical and engineering options open, and PCMCS (Physics, Chemistry, Maths, Computer Science) for students aiming for engineering and IT. After 2nd PUC, you can write CET, NEET, or JEE depending on your path. Ask me about subject weightage, tough/easy topics, or a study plan for your year.';
  }

  if (text.includes('coding') || text.includes('programming') || text.includes('python') || text.includes('c programming') || text.includes('c++') || text.includes('java') || text.includes('data structure') || text.includes('dbms') || text.includes('sql') || text.includes('web development') || text.includes('machine learning')) {
    return getCodingGuidance(message);
  }

  if (text.includes('biology') || text.includes('neet')) {
    return 'For NEET Biology, study one chapter in three passes: understand the summary, recall diagrams without looking, then solve timed questions. Botany (Plant Physiology, Ecology) is generally easier. Zoology (Human Physiology, Genetics) has some tough chapters. Keep an error notebook and revise it tomorrow. Biology is 50% of NEET marks, so give it the largest daily block.';
  }
  if (text.includes('cet')) {
    return 'For CET, rotate Maths, Physics, Chemistry, and Biology. Start with one concept, solve practice questions, and finish with a short timed exam so speed improves every day. Mathematics is 60 marks — the highest weightage. Use the KHBV.D Learn, Assignment, and Exam sections for daily practice.';
  }
  if (text.includes('jee')) {
    return 'For JEE, do not only read solutions. Try the problem first, mark the exact step where you get stuck, then learn that concept and solve a similar question immediately. All three subjects (Maths, Physics, Chemistry) are equal in JEE — do not skip any. Use the KHBV.D Learn and Exam sections for timed practice.';
  }

  if (text.includes('company') || text.includes('job') || text.includes('career') || text.includes('interview') || text.includes('placement')) {
    return getStudyPlan(message);
  }

  if (text.includes('department')) {
    return 'Degree departments on KHBV.D: CSE, ISE, Data Science (IT path), ECE, Mechanical, Civil, EEE (Non-IT path). Each department has its own subjects with Learn, Assignment, and Exam. Open Career Map to see which companies hire from your department and what skills they require.';
  }

  if (text.includes('motivat') || text.includes('tired') || text.includes('cannot') || text.includes('give up') || text.includes('stress')) {
    return 'You do not need a perfect day. Complete one focused lesson and five questions now. A small finished step is stronger than a large plan that never starts. Your exam score is feedback, not your identity — use it to improve, not to judge yourself.';
  }

  if (text.includes('learn') || text.includes('exam') || text.includes('assignment')) {
    return 'Use Learn to understand the idea, Assignment to practise without pressure, and Exam to measure speed. After every exam, read the explanations and try the weak topic again. This three-step cycle — Learn, Assignment, Exam — is how KHBV.D helps you improve every day.';
  }

  if (text.includes('which path') || text.includes('right for me') || text.includes('choose')) {
    return 'If you love Maths and problem solving, choose CET or JEE for engineering. If you love Biology and life sciences, choose NEET for medical. If you want career skills, coding, and company preparation, choose Degree. You can switch paths anytime from the home page.';
  }

  return `I can help with that. For your question about “${message}”, start by telling me what level you are studying and what result you want. I can explain the topic simply, create a step-by-step plan, give examples, make practice questions, or help you revise. For KHBV.D learning, you can also open Learn, Assignment, or Exam for the selected subject.`;
}

function speak(text: string): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

export function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi, I am your KHBV.D Assistant. I can guide you with CET, NEET, JEE preparation, PU streams (PCMB, PCMCS), subject weightage, tough and easy topics, degree subjects, coding, company preparation, study plans, and motivation. Ask me anything about your studies.' },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const sendMessage = (message: string = input) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const reply = getAssistantReply(trimmed);
    setMessages((current) => [...current, { role: 'user', text: trimmed }, { role: 'assistant', text: reply }]);
    setInput('');
  };

  const startVoice = () => {
    const browser = window as BrowserWithSpeech;
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex]?.[0]?.transcript || '';
      setInput(transcript);
      setListening(false);
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <section className="card p-6 sm:p-8 mb-6 gradient-hero text-white overflow-hidden relative">
          <div className="absolute -right-12 -top-16 w-56 h-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">Your learning companion</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">KHBV.D Assistant</h1>
              <p className="text-teal-50/85 leading-relaxed max-w-2xl">Chat with your study guide about competitive exams, PU streams, subject weightage, tough and easy topics, degree subjects, coding, company preparation, study plans, and motivation. You can also ask by voice when your hands are busy.</p>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 card overflow-hidden flex flex-col min-h-[520px]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-teal-600" /></div>
                <div><h2 className="font-heading font-bold">Ask Assistant</h2><p className="text-xs text-slate-500">Study guidance for your next step</p></div>
              </div>
              <button onClick={() => speak(messages[messages.length - 1].text)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Read latest answer aloud"><Volume2 className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 p-5 space-y-3 max-h-[360px] overflow-y-auto">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'bg-teal-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-700 rounded-bl-md'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)} className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors">{prompt}</button>)}
            </div>
            {!voiceSupported && <p className="px-5 pb-2 text-xs text-amber-700">Voice input is not available in this browser. You can still use text chat.</p>}
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="p-4 border-t border-slate-200 flex items-center gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} className="input-field flex-1" placeholder="Ask about your study plan..." aria-label="Message assistant" />
              <button type="button" onClick={startVoice} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${listening ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'}`} aria-label={listening ? 'Listening' : 'Ask by voice'}>
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button type="submit" className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors" aria-label="Send message"><Send className="w-5 h-5" /></button>
            </form>
          </section>

          <div className="lg:col-span-2 space-y-6">
            <section className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-3 mb-4"><Heart className="w-5 h-5 text-orange-600" /><h2 className="font-heading font-bold">Daily motivation</h2></div>
              <p className="text-lg font-heading font-semibold text-slate-900 leading-relaxed mb-4">Small focused sessions become strong results.</p>
              <p className="text-sm text-slate-600 leading-relaxed">Complete one lesson, correct one mistake, and return tomorrow. Progress grows from finished steps.</p>
              <div className="mt-5 pt-4 border-t border-amber-200 flex items-center gap-2 text-sm text-orange-700 font-semibold"><TrendingUp className="w-4 h-4" /> Keep your streak alive</div>
            </section>

            <section className="card p-6">
              <div className="flex items-center gap-3 mb-4"><Compass className="w-5 h-5 text-teal-600" /><h2 className="font-heading font-bold">What I can help with</h2></div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> CET, NEET, JEE subject weightage and marks</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Which topics are tough and which are easy</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Study plans for 1st PUC, 2nd PUC, and degree</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> PU streams: PCMB and PCMCS explained</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Coding: Python, C, C++, Java, DBMS, Web Dev</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Company preparation and interview skills</p>
                <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Department and semester guidance</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <button onClick={() => navigate('/dashboard')} className="p-3 rounded-xl bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100"><BookOpen className="w-4 h-4 mx-auto mb-1" />Study</button>
                <button onClick={() => navigate('/degree')} className="p-3 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-semibold hover:bg-cyan-100"><Briefcase className="w-4 h-4 mx-auto mb-1" />Career</button>
                <button onClick={() => navigate('/resume')} className="p-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100"><Target className="w-4 h-4 mx-auto mb-1" />Skills</button>
              </div>
            </section>
          </div>
        </div>

        <section className="card p-6 mt-6">
          <div className="flex items-center gap-3 mb-5"><GraduationCap className="w-5 h-5 text-teal-600" /><div><h2 className="font-heading font-bold text-lg">Study routines</h2><p className="text-sm text-slate-500">Use the routine that matches your goal.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {routines.map((routine) => <div key={routine.title} className="p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-colors"><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-teal-600" /><h3 className="font-semibold text-sm">{routine.title}</h3></div><p className="text-sm text-slate-600 leading-relaxed">{routine.detail}</p></div>)}
          </div>
        </section>

        <section className="card p-6 mt-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-teal-200 flex items-start gap-3"><Lightbulb className="w-5 h-5 text-teal-600 mt-0.5" /><div><h2 className="font-heading font-bold mb-1">Remember</h2><p className="text-sm text-slate-700 leading-relaxed">Your exam score is feedback, not your identity. Use the review, practise the weak topics, and try again with a better plan.</p></div></section>
      </main>
    </div>
  );
}

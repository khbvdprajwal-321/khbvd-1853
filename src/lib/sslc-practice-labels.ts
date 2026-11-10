interface SSLCPracticeLabels {
  showAnswer: string;
  hideAnswer: string;
  correctAnswer: string;
  whyCorrect: string;
  difficulty: Record<'easy' | 'medium' | 'difficult', string>;
  correct: string;
  incorrect: string;
  notAnswered: string;
  verifiedPreviousYear: string;
  generatedPractice: string;
  practiceQuestion: string;
  showMore: string;
  showLess: string;
  loading: string;
  nextAssignment: string;
  nextSet: string;
  revealAnswersToContinue: string;
  showing: (shown: number, total: number) => string;
  questionOf: (current: number, total: number) => string;
  mockComplete: string;
  correctCount: (count: number) => string;
  incorrectCount: (count: number) => string;
  unansweredCount: (count: number) => string;
  startNewMock: string;
  backToPractice: string;
  allAnswers: string;
  leaveTest: string;
  finishTest: string;
  nextQuestion: string;
}

const ENGLISH: SSLCPracticeLabels = {
  showAnswer: 'Show Answer',
  hideAnswer: 'Hide Answer',
  correctAnswer: 'Correct answer',
  whyCorrect: 'Why this is correct',
  difficulty: { easy: 'Easy', medium: 'Medium', difficult: 'Difficult' },
  correct: 'Correct',
  incorrect: 'Incorrect',
  notAnswered: 'Not answered',
  verifiedPreviousYear: 'Verified previous-year question',
  generatedPractice: 'Generated practice',
  practiceQuestion: 'Practice question',
  showMore: 'Show More',
  showLess: 'Show Less',
  loading: 'Loading…',
  nextAssignment: 'Next Assignment Set',
  nextSet: 'Next Set',
  revealAnswersToContinue: 'Reveal each displayed answer to continue to the next assignment set.',
  showing: (shown, total) => `Showing ${shown} of ${total} questions`,
  questionOf: (current, total) => `Question ${current} of ${total}`,
  mockComplete: 'Mock test complete',
  correctCount: (count) => `${count} correct`,
  incorrectCount: (count) => `${count} incorrect`,
  unansweredCount: (count) => `${count} unanswered`,
  startNewMock: 'Start New Mock Test',
  backToPractice: 'Back to Practice',
  allAnswers: 'All answers',
  leaveTest: 'Leave test',
  finishTest: 'Finish Test',
  nextQuestion: 'Next Question',
};

const LABELS: Record<string, SSLCPracticeLabels> = {
  Kannada: {
    ...ENGLISH,
    showAnswer: 'ಉತ್ತರ ತೋರಿಸಿ',
    hideAnswer: 'ಉತ್ತರ ಮರೆಮಾಡಿ',
    correctAnswer: 'ಸರಿಯಾದ ಉತ್ತರ',
    whyCorrect: 'ಇದು ಏಕೆ ಸರಿಯಾಗಿದೆ',
    difficulty: { easy: 'ಸುಲಭ', medium: 'ಮಧ್ಯಮ', difficult: 'ಕಠಿಣ' },
    correct: 'ಸರಿ',
    incorrect: 'ತಪ್ಪು',
    notAnswered: 'ಉತ್ತರಿಸಿಲ್ಲ',
    verifiedPreviousYear: 'ಪರಿಶೀಲಿಸಿದ ಹಿಂದಿನ ವರ್ಷದ ಪ್ರಶ್ನೆ',
    generatedPractice: 'ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ',
    practiceQuestion: 'ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ',
    showMore: 'ಇನ್ನಷ್ಟು ತೋರಿಸಿ',
    showLess: 'ಕಡಿಮೆ ತೋರಿಸಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    nextAssignment: 'ಮುಂದಿನ ಅಸೈನ್‌ಮೆಂಟ್',
    nextSet: 'ಮುಂದಿನ ಸೆಟ್',
    revealAnswersToContinue: 'ಮುಂದಿನ ಅಸೈನ್‌ಮೆಂಟ್‌ಗೆ ಹೋಗಲು ತೋರಿಸಿದ ಪ್ರತಿಯೊಂದು ಉತ್ತರವನ್ನು ನೋಡಿ.',
    showing: (shown, total) => `${shown}ರಲ್ಲಿ ${total} ಪ್ರಶ್ನೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ`,
    questionOf: (current, total) => `${total}ರಲ್ಲಿ ${current}ನೇ ಪ್ರಶ್ನೆ`,
    mockComplete: 'ಮಾದರಿ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    correctCount: (count) => `${count} ಸರಿ`,
    incorrectCount: (count) => `${count} ತಪ್ಪು`,
    unansweredCount: (count) => `${count} ಉತ್ತರಿಸಿಲ್ಲ`,
    startNewMock: 'ಹೊಸ ಮಾದರಿ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ',
    backToPractice: 'ಅಭ್ಯಾಸಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    allAnswers: 'ಎಲ್ಲಾ ಉತ್ತರಗಳು',
    leaveTest: 'ಪರೀಕ್ಷೆಯಿಂದ ಹೊರಬನ್ನಿ',
    finishTest: 'ಪರೀಕ್ಷೆ ಮುಗಿಸಿ',
    nextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ',
  },
  Hindi: {
    ...ENGLISH,
    showAnswer: 'उत्तर दिखाएँ',
    hideAnswer: 'उत्तर छिपाएँ',
    correctAnswer: 'सही उत्तर',
    whyCorrect: 'यह सही क्यों है',
    difficulty: { easy: 'आसान', medium: 'मध्यम', difficult: 'कठिन' },
    correct: 'सही',
    incorrect: 'गलत',
    notAnswered: 'उत्तर नहीं दिया',
    verifiedPreviousYear: 'सत्यापित पिछले वर्ष का प्रश्न',
    generatedPractice: 'अभ्यास प्रश्न',
    practiceQuestion: 'अभ्यास प्रश्न',
    showMore: 'और दिखाएँ',
    showLess: 'कम दिखाएँ',
    loading: 'लोड हो रहा है…',
    nextAssignment: 'अगला असाइनमेंट सेट',
    nextSet: 'अगला सेट',
    revealAnswersToContinue: 'अगले असाइनमेंट सेट पर जाने के लिए हर दिखाए गए उत्तर को देखें।',
    showing: (shown, total) => `${total} में से ${shown} प्रश्न दिखाए जा रहे हैं`,
    questionOf: (current, total) => `${total} में से प्रश्न ${current}`,
    mockComplete: 'मॉक टेस्ट पूरा हुआ',
    correctCount: (count) => `${count} सही`,
    incorrectCount: (count) => `${count} गलत`,
    unansweredCount: (count) => `${count} अनुत्तरित`,
    startNewMock: 'नया मॉक टेस्ट शुरू करें',
    backToPractice: 'अभ्यास पर वापस जाएँ',
    allAnswers: 'सभी उत्तर',
    leaveTest: 'टेस्ट छोड़ें',
    finishTest: 'टेस्ट समाप्त करें',
    nextQuestion: 'अगला प्रश्न',
  },
  Sanskrit: {
    ...ENGLISH,
    showAnswer: 'उत्तरं दर्शयतु',
    hideAnswer: 'उत्तरं गोपयतु',
    correctAnswer: 'सम्यगुत्तरम्',
    whyCorrect: 'एतत् उत्तरं किमर्थं सम्यक्',
    difficulty: { easy: 'सरलम्', medium: 'मध्यमम्', difficult: 'कठिनम्' },
    correct: 'सम्यक्',
    incorrect: 'असम्यक्',
    notAnswered: 'अनुत्तरितम्',
    verifiedPreviousYear: 'प्रमाणितः पूर्ववर्षीयः प्रश्नः',
    generatedPractice: 'अभ्यासप्रश्नः',
    practiceQuestion: 'अभ्यासप्रश्नः',
    showMore: 'अधिकं दर्शयतु',
    showLess: 'अल्पं दर्शयतु',
    loading: 'लोड् भवति…',
    nextAssignment: 'अग्रिमम् अभ्यासकार्यम्',
    nextSet: 'अग्रिमः समूहः',
    revealAnswersToContinue: 'अग्रिमम् अभ्यासकार्यं प्राप्तुं सर्वेषां प्रदर्शितप्रश्नानाम् उत्तराणि दर्शयतु।',
    showing: (shown, total) => `${total} प्रश्नेषु ${shown} प्रदर्श्यन्ते`,
    questionOf: (current, total) => `${total} मध्ये प्रश्नः ${current}`,
    mockComplete: 'नमूनापरीक्षा समाप्ता',
    correctCount: (count) => `${count} सम्यक्`,
    incorrectCount: (count) => `${count} असम्यक्`,
    unansweredCount: (count) => `${count} अनुत्तरितम्`,
    startNewMock: 'नूतनां नमूनापरीक्षां प्रारभत',
    backToPractice: 'अभ्यासं प्रति गच्छतु',
    allAnswers: 'सर्वाणि उत्तराणि',
    leaveTest: 'परीक्षां त्यजतु',
    finishTest: 'परीक्षां समापयतु',
    nextQuestion: 'अग्रिमः प्रश्नः',
  },
  Urdu: {
    ...ENGLISH,
    showAnswer: 'جواب دکھائیں',
    hideAnswer: 'جواب چھپائیں',
    correctAnswer: 'درست جواب',
    whyCorrect: 'یہ جواب درست کیوں ہے',
    difficulty: { easy: 'آسان', medium: 'درمیانہ', difficult: 'مشکل' },
    correct: 'درست',
    incorrect: 'غلط',
    notAnswered: 'جواب نہیں دیا',
    verifiedPreviousYear: 'تصدیق شدہ پچھلے سال کا سوال',
    generatedPractice: 'مشق کا سوال',
    practiceQuestion: 'مشق کا سوال',
    showMore: 'مزید دکھائیں',
    showLess: 'کم دکھائیں',
    loading: 'لوڈ ہو رہا ہے…',
    nextAssignment: 'اگلا اسائنمنٹ',
    nextSet: 'اگلا سیٹ',
    revealAnswersToContinue: 'اگلے اسائنمنٹ پر جانے کے لیے دکھائے گئے ہر جواب کو دیکھیں۔',
    showing: (shown, total) => `${total} میں سے ${shown} سوالات دکھائے جا رہے ہیں`,
    questionOf: (current, total) => `${total} میں سے سوال ${current}`,
    mockComplete: 'ماک ٹیسٹ مکمل',
    correctCount: (count) => `${count} درست`,
    incorrectCount: (count) => `${count} غلط`,
    unansweredCount: (count) => `${count} جواب نہیں دیا`,
    startNewMock: 'نیا ماک ٹیسٹ شروع کریں',
    backToPractice: 'مشق پر واپس جائیں',
    allAnswers: 'تمام جوابات',
    leaveTest: 'ٹیسٹ چھوڑیں',
    finishTest: 'ٹیسٹ ختم کریں',
    nextQuestion: 'اگلا سوال',
  },
};

export function getSSLCPracticeLabels(language?: string | null): SSLCPracticeLabels {
  return (language && LABELS[language]) || ENGLISH;
}

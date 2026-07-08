import { buildReviewQueue } from "./reviewEngine.js";

function getNextLesson(lessons, state) {
  const completedLessons = state.completedLessons || [];
  return lessons
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((lesson) => !completedLessons.includes(lesson.id)) || null;
}

function getReviewNeed(state) {
  const savedWords = state.savedWords || [];
  const queue = buildReviewQueue(state, 5);
  const dueQueue = queue.filter((item) => item.status.isDue);

  return {
    savedCount: savedWords.length,
    pendingCount: dueQueue.length,
    queue,
    shouldReview: savedWords.length > 0 && dueQueue.length > 0
  };
}

function getQuizNeed(quizzes, state) {
  const completedQuizzes = state.completedQuizzes || [];
  const activeLessonId = state.activeLessonId || "eng-001";
  const activeQuiz = quizzes.find((quiz) => quiz.lessonId === activeLessonId) || null;

  return {
    activeQuiz,
    completedCount: completedQuizzes.length,
    shouldQuiz: Boolean(activeQuiz && !completedQuizzes.includes(activeQuiz.id))
  };
}

export function getGuideMessage(state, lessons = [], quizzes = []) {
  const completedLessons = state.completedLessons || [];
  const nextLesson = getNextLesson(lessons, state);
  const reviewNeed = getReviewNeed(state);
  const quizNeed = getQuizNeed(quizzes, state);

  if (!completedLessons.length) {
    return "ابدأ بأول درس قصير. الهدف اليوم بسيط: افتح الدرس الأول، احفظ كلمة واحدة، ثم جرّب الاختبار.";
  }

  if (reviewNeed.shouldReview) {
    const firstWord = reviewNeed.queue[0]?.word?.word;
    return `لديك ${reviewNeed.pendingCount} كلمات تحتاج مراجعة. ابدأ بـ ${firstWord || "الكلمة الأولى"} قبل درس جديد.`;
  }

  if (quizNeed.shouldQuiz) {
    return "أكملت جزءاً جيداً. الخطوة الأفضل الآن هي حل اختبار الدرس الحالي لتثبيت الفهم والحصول على XP.";
  }

  if ((state.streak || 0) === 0) {
    return "نفّذ نشاطاً صغيراً اليوم لبناء أول سلسلة تعلم. حفظ كلمة أو إجابة اختبار يكفي كبداية.";
  }

  if (nextLesson) {
    return `ممتاز. حافظ على السلسلة وافتح الدرس التالي: ${nextLesson.title}.`;
  }

  return "رائع. أكملت كل الدروس المتاحة حالياً. ركّز الآن على مراجعة الكلمات والاختبارات حتى نضيف محتوى جديداً.";
}

export function buildTodayPlan(state, lessons = [], quizzes = []) {
  const nextLesson = getNextLesson(lessons, state);
  const reviewNeed = getReviewNeed(state);
  const quizNeed = getQuizNeed(quizzes, state);
  const plan = [];

  if (reviewNeed.shouldReview) {
    const firstItems = reviewNeed.queue.slice(0, 3).map((item) => item.word.word).join(", ");

    plan.push({
      title: "راجع الكلمات المحفوظة",
      description: `ابدأ بهذه الكلمات: ${firstItems}.`,
      route: "saved",
      priority: "high"
    });
  }

  if (nextLesson) {
    plan.push({
      title: "افتح الدرس التالي",
      description: `${nextLesson.title} — ${nextLesson.estimatedMinutes} دقائق تقريباً.`,
      route: "lesson",
      lessonId: nextLesson.id,
      priority: "medium"
    });
  }

  if (quizNeed.shouldQuiz) {
    plan.push({
      title: "حل اختبار قصير",
      description: `${quizNeed.activeQuiz.title} لتثبيت الدرس الحالي.`,
      route: "quiz",
      lessonId: quizNeed.activeQuiz.lessonId,
      priority: "medium"
    });
  }

  if (!plan.length) {
    plan.push({
      title: "مراجعة عامة",
      description: "راجع المحفوظات أو افتح المكتبة لاختيار قسم مفردات جديد.",
      route: "library",
      priority: "low"
    });
  }

  return plan.slice(0, 3);
}

export function buildGuideInsights(state, lessons = [], quizzes = []) {
  const completedLessons = state.completedLessons?.length || 0;
  const completedQuizzes = state.completedQuizzes?.length || 0;
  const savedWords = state.savedWords?.length || 0;
  const reviews = Object.values(state.wordReviews || {}).filter((review) => review.reviewCount > 0).length;
  const reviewQueue = buildReviewQueue(state, 5);
  const dueWords = reviewQueue.filter((item) => item.status.isDue).length;

  return [
    {
      label: "الدروس",
      value: completedLessons,
      hint: completedLessons === 0 ? "ابدأ بأول درس" : "تقدم جيد"
    },
    {
      label: "الاختبارات",
      value: completedQuizzes,
      hint: completedQuizzes === 0 ? "اختبار قصير سيقوي الفهم" : "استمر"
    },
    {
      label: "الكلمات",
      value: savedWords,
      hint: dueWords > 0 ? `${dueWords} تحتاج مراجعة` : "مكتبة جيدة"
    },
    {
      label: "المراجعات",
      value: reviews,
      hint: reviews === 0 ? "راجع كلمة محفوظة" : "تثبيت ممتاز"
    }
  ];
}

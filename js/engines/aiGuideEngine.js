import { buildAnalyticsSummary } from "./analyticsEngine.js";
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

function getActivityStrength(analytics) {
  const weekActions = analytics.lastSevenDays.reduce((total, day) => total + day.count, 0);

  if (weekActions >= 20) return "excellent";
  if (weekActions >= 8) return "good";
  if (weekActions >= 1) return "light";
  return "none";
}

function getActivityAdvice(analytics) {
  const strength = getActivityStrength(analytics);

  if (strength === "excellent") {
    return "نشاطك خلال آخر 7 أيام ممتاز. حافظ على الإيقاع ولا تضغط نفسك بمهام كثيرة.";
  }

  if (strength === "good") {
    return "نشاطك جيد. خطوة صغيرة يومياً ستجعل التقدم ثابتاً.";
  }

  if (strength === "light") {
    return "نشاطك خفيف. اختر مهمة واحدة فقط اليوم حتى لا تنقطع السلسلة.";
  }

  return "لم يبدأ نشاطك بعد. أفضل بداية هي درس قصير أو حفظ كلمة واحدة.";
}

export function getGuideMessage(state, lessons = [], quizzes = []) {
  const completedLessons = state.completedLessons || [];
  const nextLesson = getNextLesson(lessons, state);
  const reviewNeed = getReviewNeed(state);
  const quizNeed = getQuizNeed(quizzes, state);
  const analytics = buildAnalyticsSummary(state);
  const activityStrength = getActivityStrength(analytics);

  if (!completedLessons.length) {
    return "ابدأ بأول درس قصير. الهدف اليوم بسيط: افتح الدرس الأول، احفظ كلمة واحدة، ثم جرّب الاختبار.";
  }

  if (activityStrength === "none") {
    return "لا توجد نشاطات مسجلة بعد. نفّذ خطوة صغيرة الآن: راجع كلمة أو افتح الدرس التالي.";
  }

  if (reviewNeed.shouldReview) {
    const firstWord = reviewNeed.queue[0]?.word?.word;
    return `لديك ${reviewNeed.pendingCount} كلمات تحتاج مراجعة. ابدأ بـ ${firstWord || "الكلمة الأولى"} قبل درس جديد.`;
  }

  if (quizNeed.shouldQuiz && analytics.quizEvents > analytics.lessonEvents + 3) {
    return "أنت تتفاعل مع الاختبارات كثيراً. الأفضل الآن أن تفتح درساً جديداً حتى يتوازن الفهم مع التدريب.";
  }

  if (quizNeed.shouldQuiz) {
    return "أكملت جزءاً جيداً. الخطوة الأفضل الآن هي حل اختبار الدرس الحالي لتثبيت الفهم والحصول على XP.";
  }

  if ((state.streak || 0) === 0) {
    return "نفّذ نشاطاً صغيراً اليوم لبناء أول سلسلة تعلم. حفظ كلمة أو إجابة اختبار يكفي كبداية.";
  }

  if (activityStrength === "excellent") {
    return "أداؤك ممتاز هذا الأسبوع. حافظ على إيقاع خفيف: درس قصير أو مراجعة فقط.";
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
  const analytics = buildAnalyticsSummary(state);
  const activityStrength = getActivityStrength(analytics);
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

  if (activityStrength === "none" && nextLesson) {
    plan.push({
      title: "خطوة بداية سريعة",
      description: `افتح ${nextLesson.title} فقط. لا تحتاج أكثر من ${nextLesson.estimatedMinutes} دقائق.`,
      route: "lesson",
      lessonId: nextLesson.id,
      priority: "high"
    });
  } else if (nextLesson) {
    plan.push({
      title: "افتح الدرس التالي",
      description: `${nextLesson.title} — ${nextLesson.estimatedMinutes} دقائق تقريباً.`,
      route: "lesson",
      lessonId: nextLesson.id,
      priority: activityStrength === "excellent" ? "low" : "medium"
    });
  }

  if (quizNeed.shouldQuiz && activityStrength !== "none") {
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
  const analytics = buildAnalyticsSummary(state);
  const activityStrength = getActivityStrength(analytics);

  return [
    {
      label: "الدروس",
      value: completedLessons,
      hint: completedLessons === 0 ? "ابدأ بأول درس" : "تقدم جيد"
    },
    {
      label: "الاختبارات",
      value: completedQuizzes,
      hint: analytics.quizEvents > analytics.lessonEvents + 3 ? "وازنها بدروس جديدة" : "استمر"
    },
    {
      label: "الكلمات",
      value: savedWords,
      hint: dueWords > 0 ? `${dueWords} تحتاج مراجعة` : "مكتبة جيدة"
    },
    {
      label: "النشاط",
      value: analytics.totalActions,
      hint: getActivityAdvice(analytics)
    },
    {
      label: "المراجعات",
      value: reviews,
      hint: reviews === 0 ? "راجع كلمة محفوظة" : "تثبيت ممتاز"
    },
    {
      label: "آخر 7 أيام",
      value: analytics.lastSevenDays.reduce((total, day) => total + day.count, 0),
      hint: activityStrength === "excellent" ? "إيقاع ممتاز" : "قابل للتحسين"
    }
  ];
}

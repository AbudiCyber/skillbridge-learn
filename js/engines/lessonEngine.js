export function getLessonById(lessons, lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId) || null;
}

export function getLessonWords(words, lessonId) {
  return words.filter((word) => word.lessonId === lessonId);
}

export function getLessonsByUnit(lessons, unitId) {
  return lessons
    .filter((lesson) => lesson.unitId === unitId)
    .sort((a, b) => a.order - b.order);
}

export function isLessonCompleted(state, lessonId) {
  return state.completedLessons.includes(lessonId);
}

export function completeLesson(state, lessonId) {
  if (isLessonCompleted(state, lessonId)) {
    return state;
  }

  return {
    ...state,
    completedLessons: [...state.completedLessons, lessonId]
  };
}

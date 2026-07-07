export function getLessonById(lessons, lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId) || null;
}

export function isLessonCompleted(state, lessonId) {
  return state.completedLessons.includes(lessonId);
}

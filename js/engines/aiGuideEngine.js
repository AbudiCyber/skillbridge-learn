export function getGuideMessage(state) {
  if (!state.completedLessons.length) {
    return "ابدأ بأول درس قصير، وسأرشدك خطوة بخطوة.";
  }

  return "ممتاز! أكمل درساً واحداً اليوم لتحافظ على تقدمك.";
}

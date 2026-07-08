export function getVocabularySectionById(sections, sectionId) {
  return sections.find((section) => section.id === sectionId) || null;
}

export function getWordsBySection(words, sectionId) {
  return words
    .filter((word) => word.sectionId === sectionId)
    .sort((a, b) => a.word.localeCompare(b.word));
}

export function getSectionWordCount(words, sectionId) {
  return getWordsBySection(words, sectionId).length;
}

export function getVocabularySectionsByStatus(sections, status) {
  return sections
    .filter((section) => section.status === status)
    .sort((a, b) => a.order - b.order);
}

export function buildVocabularySectionSummary(section, words) {
  return {
    ...section,
    wordCount: getSectionWordCount(words, section.id)
  };
}

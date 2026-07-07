import { translations } from "./translations.js";

export const SUPPORTED_LANGUAGES = ["ar", "en"];
export const DEFAULT_LANGUAGE = "ar";

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function getDirection(language) {
  return normalizeLanguage(language) === "ar" ? "rtl" : "ltr";
}

export function createTranslator(language) {
  const safeLanguage = normalizeLanguage(language);
  const dictionary = translations[safeLanguage] || translations[DEFAULT_LANGUAGE];

  return function translate(key) {
    return dictionary[key] || translations[DEFAULT_LANGUAGE][key] || key;
  };
}

export function applyDocumentLanguage(language) {
  const safeLanguage = normalizeLanguage(language);
  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = getDirection(safeLanguage);
}

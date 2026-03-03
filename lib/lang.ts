export type Lang = "ja" | "en";
const KEY = "partner_lang";

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.split("-")[0] === "ja" ? "ja" : "en";
}

export function getSavedLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(KEY) as Lang) || detectLang();
}

export function saveLang(lang: Lang) {
  localStorage.setItem(KEY, lang);
}

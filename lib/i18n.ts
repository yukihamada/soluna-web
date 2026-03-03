export const translations = {
  en: {
    hero: {
      subtitle: "Powered by SOLUNA",
      tagline: "COMING SOON",
    },
    date: {
      title: "SEPTEMBER 4, 2026",
      location: "OAHU, HAWAII",
      venue: "SECRET LOCATION",
      tagline: "Where the jungle meets the ocean",
    },
    signup: {
      headline: "Be The First To Know",
      description: "Register for exclusive pre-sale access and lineup announcements",
      placeholder: "Enter your email",
      button: "JOIN THE LIST",
      success: "You're on the list!",
      privacy: "We respect your privacy. Unsubscribe anytime.",
    },
    atmosphere: {
      title: "THE EXPERIENCE",
    },
    footer: {
      copyright: "© 2026 ZAMNA HAWAII - Powered by SOLUNA. All rights reserved.",
    },
  },
  ja: {
    hero: {
      subtitle: "Powered by SOLUNA",
      tagline: "COMING SOON",
    },
    date: {
      title: "2026年9月4日",
      location: "オアフ島、ハワイ",
      venue: "SECRET LOCATION",
      tagline: "ジャングルと海が出会う場所",
    },
    signup: {
      headline: "誰よりも早く情報を手に入れる",
      description: "先行販売とラインナップ発表をいち早くお届け",
      placeholder: "メールアドレスを入力",
      button: "登録する",
      success: "登録完了！",
      privacy: "プライバシーを尊重します。いつでも解除可能。",
    },
    atmosphere: {
      title: "体験",
    },
    footer: {
      copyright: "© 2026 ZAMNA HAWAII - Powered by SOLUNA. All rights reserved.",
    },
  },
} as const;

export type Locale = keyof typeof translations;

export function getLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.split("-")[0];
  return lang === "ja" ? "ja" : "en";
}

export function useTranslations(locale: Locale) {
  return translations[locale];
}

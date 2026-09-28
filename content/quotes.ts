export type Quote = {
  ur: string; // Urdu (rtl)
  en: string; // English translation
  author?: string;
};

// TODO: verify translations and attributions; add more.
export const quotes: Quote[] = [
  {
    ur: "خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے، بتا تیری رضا کیا ہے",
    en: "Raise the self so high that, before each decree,\nGod asks His servant: tell me, what is your will?",
    author: "Allama Iqbal",
  },
  {
    ur: "TODO: اردو اقتباس یہاں",
    en: "TODO: an English line here, side by side.",
    author: "TODO",
  },
];

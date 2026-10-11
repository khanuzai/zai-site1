// Production URL (override with NEXT_PUBLIC_SITE_URL in the environment).
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://khanzai.ca"
).replace(/\/$/, "");

export const siteName = "abdullah khan";
export const siteDescription =
  "builds things that feel like something. cs at uwaterloo, bba at laurier.";

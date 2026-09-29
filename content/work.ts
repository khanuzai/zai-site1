export type WorkItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary?: string;
};

// Timeline, newest first.
export const work: WorkItem[] = [
  {
    company: "leapap",
    role: "Software Engineering Intern",
    period: "May–Aug 2026",
    location: "Aurora, ON",
    summary:
      "built a scraper framework for one family of billing integrations, cutting the time to add a new one from **3+ hours to under 10 minutes**. all 11 scrapers in that family now run on it. also shipped 32+ scrapers and fixed 110+ production failures in four months.",
  },
  {
    company: "pixelsboost",
    role: "Software Developer",
    period: "Sep–Dec 2025",
    location: "Milton, ON",
    summary:
      "shipped 5 client sites end to end, with stripe payments, google maps, and email built in. got their lighthouse scores from **68 to 87**.",
  },
  {
    company: "fast webs",
    role: "Software Engineering Intern",
    period: "May–Aug 2024",
    location: "missouri, usa (remote)",
    summary:
      "built 12 ui components across 3 react apps, including checkout flows, user dashboards, and admin panels. also built an event tracking system that helped the product team find 3 ux fixes, and cut bundle size by **120kb** with code splitting.",
  },
];

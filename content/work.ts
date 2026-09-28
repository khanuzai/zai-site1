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
    company: "LeapAP Inc.",
    role: "Software Engineering Intern",
    period: "May–Aug 2026",
    location: "Aurora, ON",
    summary: "TODO: what you built at LeapAP.",
  },
  {
    company: "PixelsBoost",
    role: "Software Engineering Intern",
    period: "Sep–Dec 2025",
    location: "Milton, ON",
    summary: "TODO: what you built at PixelsBoost.",
  },
  {
    company: "Fast Webs",
    role: "Software Engineering Intern",
    period: "May–Aug 2024",
    location: "Remote",
    summary: "TODO: what you built at Fast Webs.",
  },
];

export type Stat = {
  value: string; // the big number (any prefix/suffix kept, e.g. "$27k+", "1,500+")
  label: string; // one short line under it (lowercase)
};

// The hidden stats behind the "psst." easter egg on /contact.
export const stats: Stat[] = [
  { value: "98%", label: "grade 12 average" },
  { value: "90+", label: "every year since grade 3. never dropped." },
  { value: "1580", label: "sat" },
  {
    value: "$27k+",
    label: "raised for gaza through a nonprofit i co-founded",
  },
  { value: "$12k+", label: "made by two businesses i co-founded" },
  { value: "1,500+", label: "volunteer hours" },
];

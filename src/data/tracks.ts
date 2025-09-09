export type Module = {
  id: string;
  title: string;
  durationMins?: number;
};

export type Track = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};

export const tracks: Track[] = [
  {
    id: "onboarding",
    title: "Proovia Onboarding",
    description: "Start here. Company overview, values, and essential tools.",
    modules: [
      { id: "welcome", title: "Welcome to Proovia", durationMins: 6 },
      { id: "values", title: "Values and Customer Promise", durationMins: 8 },
      { id: "tools", title: "Tools: Dashboard, Tasks, Routes", durationMins: 12 },
    ],
  },
  {
    id: "courier-basics",
    title: "Courier Essentials",
    description: "Safety, etiquette, and delivery best practices.",
    modules: [
      { id: "safety", title: "Safety First", durationMins: 10 },
      { id: "etiquette", title: "Delivery Etiquette", durationMins: 9 },
      { id: "issues", title: "Handling Issues & Escalations", durationMins: 11 },
    ],
  },
  {
    id: "system-basics",
    title: "System Basics",
    description: "Understanding the status colors and system flows.",
    modules: [
      { id: "colors", title: "Order Colors Overview", durationMins: 7 },
      { id: "statuses", title: "Statuses & Transitions", durationMins: 10 },
    ],
  },
];


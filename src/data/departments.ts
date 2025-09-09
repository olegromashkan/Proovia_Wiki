export const departments = [
  "Operations",
  "Finance",
  "HR",
  "Logistics",
  "Dispatch",
  "IT Department",
  "Marketing",
] as const;

export type Department = (typeof departments)[number];


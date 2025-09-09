export type Article = {
  slug: string;
  title: string;
  description: string;
  department?: string;
};

export const articles: Article[] = [
  {
    slug: "order-colors",
    title: "Order Colors",
    description:
      "In our system, colors show the live status of tasks: collect, deliver, contact or reschedule.",
    department: "Operations",
  },
  {
    slug: "delivery-etiquette",
    title: "Delivery Etiquette",
    description:
      "Core principles for courteous and efficient customer interactions during deliveries.",
    department: "Customer Support",
  },
  {
    slug: "system-overview",
    title: "System Overview",
    description:
      "High-level introduction to the Proovia dashboard, tasks, routes and KPIs.",
    department: "IT Department",
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}


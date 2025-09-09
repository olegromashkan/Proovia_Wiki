import OrgChart from "@/components/OrgChart";

export const metadata = {
  title: "Company Structure | Proovia E\u200b-Learning",
};

export default function OrgPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Structure</h1>
        <p className="text-sm text-foreground/70">
          Add employees and draw connections between them.
        </p>
      </div>
      <OrgChart />
    </div>
  );
}

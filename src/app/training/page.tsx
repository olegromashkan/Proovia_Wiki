import TrainingTracks from "@/components/TrainingTracks";
import { tracks } from "@/data/tracks";

export const metadata = {
  title: "Training | Proovia E‑Learning",
};

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Training</h1>
        <p className="text-sm text-foreground/70">
          Structured learning paths with local progress tracking.
        </p>
      </div>
      <TrainingTracks tracks={tracks} />
    </div>
  );
}

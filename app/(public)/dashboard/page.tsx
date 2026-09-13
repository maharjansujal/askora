import { Button } from "@/src/components/ui/Button";
import { Plus } from "lucide-react";

export default function PublicDashboardPage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1>Good evening, Sujal</h1>
          <span className="text-secondary-foreground">
            Track your reputation, discover questions in your subjects and earn
            points by contributing reviewed solutions
          </span>
        </div>
        <Button icon={Plus}>Ask a question</Button>
      </div>
    </>
  );
}

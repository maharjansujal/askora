import { Button } from "@/src/components/ui/Button";
import { getMe } from "@/src/features/auth/actions/currentUser";
import { Plus } from "lucide-react";

const Greet = async () => {
  const { user } = await getMe();
  if (!user) return <h1>Greetings User</h1>;
  return <h1>Greetings {user.displayName}</h1>;
};

export default function PublicDashboardPage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <Greet />
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

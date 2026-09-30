import { Button } from "@/src/components/ui/Button";
import { User } from "@/src/db/schema";
import { CalendarDays, Clock } from "lucide-react";

export const ProfileHeader = ({
  isOwner,
  profile,
}: {
  isOwner: boolean;
  profile: User;
}) => (
  <section className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
    <div className="h-22 bg-linear-to-r from-primary/40 to-purple-300/25" />

    <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
      <div className="-mt-10 flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-card bg-linear-to-br from-primary to-purple-300 text-3xl font-extrabold text-primary-foreground">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="size-full rounded-full object-cover"
          />
        ) : (
          profile.displayName.charAt(0)
        )}
      </div>

      <div className="min-w-50 flex-1 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[22px] font-extrabold text-foreground">
            {profile.displayName}
          </h1>
          <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            {profile.rankId}
          </span>
        </div>
        <div className="mb-2 text-[13.5px] text-muted-foreground">
          @{profile.username}
        </div>
        <p className="mb-2.5 max-w-xl text-sm leading-relaxed text-foreground">
          {profile.bio}
        </p>
        <div className="flex flex-wrap gap-4 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> Joined{" "}
            {String(profile.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" /> Last seen{" "}
            {String(profile.lastSeenAt)}
          </span>
        </div>
      </div>

      {isOwner && <Button variant="outline">Edit profile</Button>}
    </div>
  </section>
);

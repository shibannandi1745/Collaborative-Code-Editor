import { Files, Search, GitBranch, Blocks, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "../UserAvatar";
import { Link } from "wouter";

export function ActivityBar() {
  const { user } = useAuth();

  const topItems = [
    { icon: Files, label: "Explorer", active: true },
    { icon: Search, label: "Search" },
    { icon: GitBranch, label: "Source Control" },
    { icon: Blocks, label: "Extensions" },
  ];

  return (
    <div className="w-12 shrink-0 bg-activity-bar flex flex-col items-center py-3 justify-between border-r border-border/50 z-20">
      <div className="flex flex-col items-center gap-4 w-full">
        <Link href="/" className="mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold hover:bg-primary/30 transition-colors">
            C<span className="opacity-50">c</span>
          </div>
        </Link>
        
        {topItems.map((item, i) => (
          <button
            key={i}
            className={`relative p-2 w-full flex justify-center text-muted-foreground hover:text-foreground transition-colors
              ${item.active ? "text-foreground" : ""}`}
            title={item.label}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-primary rounded-r-full" />
            )}
            <item.icon className="w-6 h-6 stroke-[1.5]" />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <ThemeToggle />
        <button className="p-2 w-full flex justify-center text-muted-foreground hover:text-foreground transition-colors" title="Settings">
          <Settings className="w-6 h-6 stroke-[1.5]" />
        </button>
        <div className="pb-2">
          {user ? (
             <UserAvatar user={user} className="w-8 h-8" />
          ) : (
             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
               <User className="w-4 h-4 text-muted-foreground" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

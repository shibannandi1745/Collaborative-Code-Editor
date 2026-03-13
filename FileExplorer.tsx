import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    username: string;
    avatar?: string | null;
    status?: 'online' | 'offline' | 'away' | string;
  };
  className?: string;
  showStatus?: boolean;
}

export function UserAvatar({ user, className, showStatus = true }: UserAvatarProps) {
  const statusColor = {
    online: 'bg-[hsl(var(--online))]',
    offline: 'bg-[hsl(var(--offline))]',
    away: 'bg-[hsl(var(--away))]',
  }[user.status || 'offline'];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("relative inline-block", className)}>
          <Avatar className="h-full w-full ring-2 ring-background">
            <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {showStatus && (
            <span className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
              statusColor
            )} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs font-medium">
        {user.username} {showStatus && `• ${user.status}`}
      </TooltipContent>
    </Tooltip>
  );
}

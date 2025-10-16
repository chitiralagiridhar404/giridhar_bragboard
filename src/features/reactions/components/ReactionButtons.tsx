import { Button } from '@/components/ui/button';
import { useReactions, ReactionType } from '../hooks/useReactions';
import { cn } from '@/lib/utils';

interface ReactionButtonsProps {
  shoutOutId: string;
  userId?: string;
  reactions?: {
    like: number;
    clap: number;
    star: number;
  };
  userReactions?: ReactionType[];
}

export const ReactionButtons = ({ shoutOutId, userId, reactions: initialReactions, userReactions: initialUserReactions }: ReactionButtonsProps) => {
  const { reactions, userReactions, isLoading, handleReaction } = useReactions(
    shoutOutId, 
    userId,
    initialReactions,
    initialUserReactions
  );

  const reactionConfig: Array<{
    type: ReactionType;
    emoji: string;
    label: string;
    colorClass: string;
    bgClass: string;
    hoverClass: string;
  }> = [
    { 
      type: 'like', 
      emoji: '❤️', 
      label: 'Love',
      colorClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-950',
      hoverClass: 'hover:bg-red-100 dark:hover:bg-red-900'
    },
    { 
      type: 'clap', 
      emoji: '👏', 
      label: 'Applause',
      colorClass: 'text-yellow-500',
      bgClass: 'bg-yellow-50 dark:bg-yellow-950',
      hoverClass: 'hover:bg-yellow-100 dark:hover:bg-yellow-900'
    },
    { 
      type: 'star', 
      emoji: '⭐', 
      label: 'Star',
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-950',
      hoverClass: 'hover:bg-amber-100 dark:hover:bg-amber-900'
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {reactionConfig.map(({ type, emoji, label, colorClass, bgClass, hoverClass }) => {
        const isActive = userReactions.includes(type);
        const count = reactions[type];

        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={isLoading}
            className={cn(
              "gap-2 min-w-[70px] border-2 transition-all duration-300 font-semibold",
              isActive 
                ? `${bgClass} ${colorClass} border-current scale-105 shadow-md` 
                : `${hoverClass} border-muted-foreground/20 hover:border-current hover:scale-105`,
            )}
            title={label}
          >
            <span className="text-lg leading-none animate-in zoom-in duration-200">
              {emoji}
            </span>
            {count > 0 && (
              <span className={cn(
                "text-sm font-bold",
                isActive ? colorClass : "text-foreground"
              )}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

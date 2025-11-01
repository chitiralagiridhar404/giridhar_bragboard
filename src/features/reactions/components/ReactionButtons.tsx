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
    gradient: string;
    shadowClass: string;
  }> = [
    { 
      type: 'like', 
      emoji: '❤️', 
      label: 'Love',
      gradient: 'from-red-500 to-pink-500',
      shadowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
    },
    { 
      type: 'clap', 
      emoji: '👏', 
      label: 'Applause',
      gradient: 'from-yellow-400 to-orange-500',
      shadowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]'
    },
    { 
      type: 'star', 
      emoji: '⭐', 
      label: 'Star',
      gradient: 'from-amber-400 to-yellow-300',
      shadowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]'
    },
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      {reactionConfig.map(({ type, emoji, label, gradient, shadowClass }) => {
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
              "gap-2 min-w-[80px] border-2 transition-all duration-300 font-bold rounded-full",
              isActive 
                ? `bg-gradient-to-r ${gradient} text-white border-transparent scale-110 ${shadowClass}` 
                : "bg-background/50 backdrop-blur-sm border-primary/30 hover:border-primary hover:scale-105 hover:shadow-md",
            )}
            title={label}
          >
            <span className={cn(
              "text-xl leading-none transition-transform duration-200",
              isActive && "animate-bounce"
            )}>
              {emoji}
            </span>
            {count > 0 && (
              <span className={cn(
                "text-base font-bold",
                isActive ? "text-white" : "text-foreground"
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

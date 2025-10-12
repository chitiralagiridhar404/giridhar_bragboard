import { Heart, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReactions, ReactionType } from '../hooks/useReactions';

interface ReactionButtonsProps {
  shoutOutId: string;
  userId?: string;
}

export const ReactionButtons = ({ shoutOutId, userId }: ReactionButtonsProps) => {
  const { reactions, userReactions, isLoading, handleReaction } = useReactions(shoutOutId, userId);

  const reactionConfig: Array<{
    type: ReactionType;
    icon: typeof Heart;
    label: string;
  }> = [
    { type: 'like', icon: Heart, label: 'Like' },
    { type: 'clap', icon: Sparkles, label: 'Clap' },
    { type: 'star', icon: Star, label: 'Star' },
  ];

  return (
    <div className="flex gap-2">
      {reactionConfig.map(({ type, icon: Icon, label }) => {
        const isActive = userReactions.includes(type);
        const count = reactions[type];

        return (
          <Button
            key={type}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={isLoading}
            className="gap-1"
          >
            <Icon className={`h-4 w-4 ${isActive ? 'fill-current' : ''}`} />
            <span>{count > 0 ? count : ''}</span>
          </Button>
        );
      })}
    </div>
  );
};

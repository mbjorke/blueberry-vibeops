import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  issueCount: number;
  onReviewClick: () => void;
}

export function AlertBanner({ issueCount, onReviewClick }: AlertBannerProps) {
  if (issueCount === 0) return null;

  return (
    <div className="alert-banner alert-banner-warning">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 font-medium">
        ⚠️ {issueCount} project{issueCount > 1 ? 's' : ''} need{issueCount === 1 ? 's' : ''} attention
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReviewClick}
        className="border-warning/30 hover:bg-warning/10 text-warning"
      >
        Review Now
      </Button>
    </div>
  );
}

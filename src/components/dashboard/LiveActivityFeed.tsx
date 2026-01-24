import { useEffect, useState } from 'react';
import { useGlobalRealtimeActivity } from '@/hooks/useGlobalRealtimeActivity';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Rocket, 
  Shield, 
  RefreshCw, 
  FileCheck,
  Radio,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ActivityEvent } from '@/data/activityEvents';
import { isSoundEnabled, setSoundEnabled, playCriticalSound } from '@/lib/soundNotifications';

const typeIcons: Record<string, React.ReactNode> = {
  deployment: <Rocket className="h-3.5 w-3.5" />,
  status_change: <RefreshCw className="h-3.5 w-3.5" />,
  security_event: <Shield className="h-3.5 w-3.5" />,
  compliance: <FileCheck className="h-3.5 w-3.5" />,
};

const severityStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  info: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    icon: <Clock className="h-3 w-3" />,
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  critical: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

interface LiveActivityFeedProps {
  maxHeight?: string;
}

export function LiveActivityFeed({ maxHeight = '400px' }: LiveActivityFeedProps) {
  const { events, loading, isConnected, newEventCount, clearNewEventCount } = useGlobalRealtimeActivity(30);
  const { projects } = useProjects();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Helper functions now use fetched projects from DB
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  const getProjectColor = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.logoColor || 'bg-muted';
  };

  const getProjectInitial = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.logoInitial || '?';
  };

  const toggleSound = () => {
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
    // Play a test sound when enabling
    if (newValue) {
      playCriticalSound();
    }
  };
  // Clear new event count when component is visible
  useEffect(() => {
    if (newEventCount > 0) {
      const timer = setTimeout(clearNewEventCount, 3000);
      return () => clearTimeout(timer);
    }
  }, [newEventCount, clearNewEventCount]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Live Activity
              {isConnected && (
                <Badge variant="outline" className="ml-2 text-xs gap-1 font-normal">
                  <Radio className="h-2.5 w-2.5 text-success animate-pulse" />
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time events across all projects
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {newEventCount > 0 && (
              <Badge className="bg-primary animate-pulse">
                +{newEventCount} new
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSound}
              title={soundOn ? 'Disable sound notifications' : 'Enable sound notifications'}
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4 text-success" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs">Events will appear here in real-time</p>
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-1">
              {events.map((event, index) => {
                const style = severityStyles[event.severity || 'info'];
                const isNew = index < newEventCount;

                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-start gap-3 p-2.5 rounded-lg transition-all',
                      isNew && 'bg-primary/5 animate-in fade-in slide-in-from-top-2',
                      'hover:bg-muted/50'
                    )}
                  >
                    {/* Project Avatar */}
                    <div 
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                        getProjectColor(event.projectId)
                      )}
                    >
                      {getProjectInitial(event.projectId)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('p-1 rounded', style.bg, style.text)}>
                          {typeIcons[event.type]}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {event.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {getProjectName(event.projectId)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Severity indicator */}
                    <div className={cn('flex-shrink-0', style.text)}>
                      {style.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

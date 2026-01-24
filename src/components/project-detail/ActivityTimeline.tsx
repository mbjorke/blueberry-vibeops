import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Rocket, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ActivityEvent, type ActivityType } from '@/data/activityEvents';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  loading?: boolean;
  isRealtime?: boolean;
}

const typeIcons: Record<ActivityType, React.ReactNode> = {
  deployment: <Rocket className="h-4 w-4" />,
  status_change: <RefreshCw className="h-4 w-4" />,
  security_event: <Shield className="h-4 w-4" />,
  compliance: <FileCheck className="h-4 w-4" />,
};

const typeLabels: Record<ActivityType, string> = {
  deployment: 'Deployment',
  status_change: 'Status Change',
  security_event: 'Security',
  compliance: 'Compliance',
};

const severityStyles = {
  info: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-muted',
    icon: <Clock className="h-4 w-4" />,
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  critical: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
    icon: <XCircle className="h-4 w-4" />,
  },
};

function ActivityIcon({ type, severity }: { type: ActivityType; severity?: string }) {
  const style = severityStyles[severity as keyof typeof severityStyles] || severityStyles.info;
  
  return (
    <div className={cn(
      'w-10 h-10 rounded-full flex items-center justify-center border-2',
      style.bg,
      style.border,
      style.text
    )}>
      {typeIcons[type]}
    </div>
  );
}

function StatusChangeIndicator({ previous, current }: { previous?: string; current?: string }) {
  if (!previous || !current) return null;

  const isImprovement = 
    (previous === 'critical' && (current === 'warning' || current === 'healthy')) ||
    (previous === 'warning' && current === 'healthy');

  return (
    <div className="flex items-center gap-2 mt-2">
      <Badge variant="outline" className="text-xs opacity-60">
        {previous}
      </Badge>
      {isImprovement ? (
        <TrendingUp className="h-3 w-3 text-success" />
      ) : (
        <TrendingDown className="h-3 w-3 text-danger" />
      )}
      <Badge variant="outline" className="text-xs">
        {current}
      </Badge>
    </div>
  );
}

export function ActivityTimeline({ events, loading = false, isRealtime = false }: ActivityTimelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>Loading activity...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>No activity recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
              {isRealtime && (
                <Badge variant="outline" className="ml-2 text-xs gap-1">
                  <Radio className="h-3 w-3 text-success animate-pulse" />
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent deployments, security events, and status changes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            
            {/* Events */}
            <div className="space-y-6">
              {events.map((event, index) => {
                const style = severityStyles[event.severity as keyof typeof severityStyles] || severityStyles.info;
                
                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div className="relative z-10">
                      <ActivityIcon type={event.type} severity={event.severity} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn('text-xs', style.text, style.border)}
                            >
                              {typeLabels[event.type]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                          
                          {/* Status change indicator */}
                          {event.type === 'status_change' && event.metadata && (
                            <StatusChangeIndicator 
                              previous={event.metadata.previousStatus} 
                              current={event.metadata.newStatus} 
                            />
                          )}
                          
                          {/* Deployment metadata */}
                          {event.type === 'deployment' && event.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.metadata.environment?.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                by {event.metadata.deployedBy}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {event.metadata.duration}
                              </span>
                              <code className="text-xs bg-muted px-1 rounded">
                                {event.metadata.commitHash}
                              </code>
                            </div>
                          )}
                          
                          {/* Security metadata */}
                          {event.type === 'security_event' && event.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.metadata.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  'text-xs',
                                  event.metadata.status === 'resolved' 
                                    ? 'text-success border-success/20' 
                                    : 'text-warning border-warning/20'
                                )}
                              >
                                {event.metadata.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {event.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

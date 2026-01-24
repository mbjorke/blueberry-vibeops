import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ActivityEvent } from '@/data/activityEvents';
import { useToast } from '@/hooks/use-toast';

interface DbActivityEvent {
  id: string;
  project_id: string;
  type: string;
  title: string;
  description: string;
  severity: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function mapDbEventToActivityEvent(dbEvent: DbActivityEvent): ActivityEvent {
  return {
    id: dbEvent.id,
    type: dbEvent.type as ActivityEvent['type'],
    title: dbEvent.title,
    description: dbEvent.description,
    timestamp: formatTimestamp(dbEvent.created_at),
    severity: (dbEvent.severity as ActivityEvent['severity']) || 'info',
    metadata: dbEvent.metadata || undefined,
  };
}

interface UseRealtimeActivityOptions {
  projectId: string;
  fallbackEvents?: ActivityEvent[];
}

export function useRealtimeActivity({ projectId, fallbackEvents = [] }: UseRealtimeActivityOptions) {
  const [events, setEvents] = useState<ActivityEvent[]>(fallbackEvents);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    // Fetch initial events from database
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activity events:', error);
        // Fall back to static events if database fetch fails
        if (isMounted) {
          setEvents(fallbackEvents);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        const dbEvents = (data as DbActivityEvent[]).map(mapDbEventToActivityEvent);
        // Merge with fallback events, prioritizing database events
        const mergedEvents = dbEvents.length > 0 ? dbEvents : fallbackEvents;
        setEvents(mergedEvents);
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`activity-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_events',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!isMounted) return;

          const newEvent = mapDbEventToActivityEvent(payload.new as DbActivityEvent);
          
          setEvents((prev) => [newEvent, ...prev]);
          setIsRealtime(true);

          // Show toast notification for new events
          toast({
            title: 'New Activity',
            description: newEvent.title,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId, toast]);

  return { events, loading, isRealtime };
}

// Helper function to create activity events (for use in other parts of the app)
export async function createActivityEvent(event: {
  projectId: string;
  type: ActivityEvent['type'];
  title: string;
  description: string;
  severity?: ActivityEvent['severity'];
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('activity_events')
    .insert({
      project_id: event.projectId,
      type: event.type,
      title: event.title,
      description: event.description,
      severity: event.severity || 'info',
      metadata: event.metadata || {},
    });

  if (error) {
    console.error('Error creating activity event:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

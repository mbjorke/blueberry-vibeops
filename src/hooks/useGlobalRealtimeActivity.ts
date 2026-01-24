import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ActivityEvent } from '@/data/activityEvents';
import { playSeveritySound, isSoundEnabled } from '@/lib/soundNotifications';

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

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function mapDbEventToActivityEvent(dbEvent: DbActivityEvent): ActivityEvent & { projectId: string } {
  return {
    id: dbEvent.id,
    type: dbEvent.type as ActivityEvent['type'],
    title: dbEvent.title,
    description: dbEvent.description,
    timestamp: formatTimestamp(dbEvent.created_at),
    severity: (dbEvent.severity as ActivityEvent['severity']) || 'info',
    metadata: dbEvent.metadata || undefined,
    projectId: dbEvent.project_id,
  };
}

export function useGlobalRealtimeActivity(limit: number = 20) {
  const [events, setEvents] = useState<(ActivityEvent & { projectId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [newEventCount, setNewEventCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial events from database
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching global activity events:', error);
        setLoading(false);
        return;
      }

      if (isMounted) {
        const mappedEvents = (data as DbActivityEvent[]).map(mapDbEventToActivityEvent);
        setEvents(mappedEvents);
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates for ALL activity events
    const channel = supabase
      .channel('global-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_events',
        },
        (payload) => {
          if (!isMounted) return;

          const newEvent = mapDbEventToActivityEvent(payload.new as DbActivityEvent);
          
          setEvents((prev) => {
            const updated = [newEvent, ...prev].slice(0, limit);
            return updated;
          });
          
          setNewEventCount((prev) => prev + 1);
          
          // Play sound for critical and warning events
          if (isSoundEnabled() && (newEvent.severity === 'critical' || newEvent.severity === 'warning')) {
            playSeveritySound(newEvent.severity);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const clearNewEventCount = () => setNewEventCount(0);

  return { events, loading, isConnected, newEventCount, clearNewEventCount };
}

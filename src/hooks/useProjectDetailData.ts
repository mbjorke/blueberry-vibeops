import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'open' | 'fixed' | 'ignored' | 'in_progress';
  category?: string;
  filePath?: string;
  lineNumber?: number;
  recommendation?: string;
  createdAt: string;
}

export interface Deployment {
  id: string;
  environment: 'dev' | 'staging' | 'prod';
  version: string;
  status: 'success' | 'failed' | 'in_progress' | 'rolled_back';
  commitHash?: string;
  commitMessage?: string;
  deployedByName?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface GDPRChecklistItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low';
}

interface UseProjectDetailDataResult {
  securityFindings: SecurityFinding[];
  deployments: Deployment[];
  gdprChecklist: GDPRChecklistItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleGDPRItem: (itemId: string, completed: boolean) => Promise<void>;
  updateFindingStatus: (findingId: string, status: SecurityFinding['status']) => Promise<void>;
}

export function useProjectDetailData(projectId: string): UseProjectDetailDataResult {
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [gdprChecklist, setGdprChecklist] = useState<GDPRChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [findingsRes, deploymentsRes, gdprRes] = await Promise.all([
        supabase
          .from('security_findings')
          .select('*')
          .eq('project_id', projectId)
          .order('severity', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('deployments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('gdpr_checklist_items')
          .select('*')
          .eq('project_id', projectId)
          .order('priority', { ascending: true })
          .order('category', { ascending: true }),
      ]);

      if (findingsRes.error) throw findingsRes.error;
      if (deploymentsRes.error) throw deploymentsRes.error;
      if (gdprRes.error) throw gdprRes.error;

      // Map security findings
      setSecurityFindings(
        (findingsRes.data || []).map((f) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          severity: f.severity as SecurityFinding['severity'],
          status: f.status as SecurityFinding['status'],
          category: f.category || undefined,
          filePath: f.file_path || undefined,
          lineNumber: f.line_number || undefined,
          recommendation: f.recommendation || undefined,
          createdAt: f.created_at,
        }))
      );

      // Map deployments
      setDeployments(
        (deploymentsRes.data || []).map((d) => ({
          id: d.id,
          environment: d.environment as Deployment['environment'],
          version: d.version,
          status: d.status as Deployment['status'],
          commitHash: d.commit_hash || undefined,
          commitMessage: d.commit_message || undefined,
          deployedByName: d.deployed_by_name || undefined,
          durationSeconds: d.duration_seconds || undefined,
          createdAt: d.created_at,
        }))
      );

      // Map GDPR checklist
      setGdprChecklist(
        (gdprRes.data || []).map((g) => ({
          id: g.id,
          category: g.category,
          title: g.title,
          description: g.description || undefined,
          isCompleted: g.is_completed,
          completedAt: g.completed_at || undefined,
          priority: (g.priority as GDPRChecklistItem['priority']) || 'medium',
        }))
      );
    } catch (err) {
      console.error('Error fetching project detail data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-detail-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'security_findings', filter: `project_id=eq.${projectId}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deployments', filter: `project_id=eq.${projectId}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gdpr_checklist_items', filter: `project_id=eq.${projectId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const toggleGDPRItem = async (itemId: string, completed: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('gdpr_checklist_items')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Optimistic update
      setGdprChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isCompleted: completed, completedAt: completed ? new Date().toISOString() : undefined }
            : item
        )
      );
    } catch (err) {
      console.error('Error updating GDPR item:', err);
      throw err;
    }
  };

  const updateFindingStatus = async (findingId: string, status: SecurityFinding['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('security_findings')
        .update({ status })
        .eq('id', findingId);

      if (updateError) throw updateError;

      // Optimistic update
      setSecurityFindings((prev) =>
        prev.map((finding) =>
          finding.id === findingId ? { ...finding, status } : finding
        )
      );
    } catch (err) {
      console.error('Error updating finding status:', err);
      throw err;
    }
  };

  return {
    securityFindings,
    deployments,
    gdprChecklist,
    loading,
    error,
    refetch: fetchData,
    toggleGDPRItem,
    updateFindingStatus,
  };
}

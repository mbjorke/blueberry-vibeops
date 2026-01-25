import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjectDetailData } from '../useProjectDetailData';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      limit: vi.fn(() => mockQuery),
    };
    return mockQuery;
  });

  const createMockChannel = () => {
    const channel = {
      on: vi.fn(() => channel), // Return channel for chaining
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };
    return channel;
  };

  const mockChannel = vi.fn(() => createMockChannel());
  const mockRemoveChannel = vi.fn();

  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
});

describe('useProjectDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useProjectDetailData('project-1'));

      expect(result.current.loading).toBe(true);
      expect(result.current.securityFindings).toEqual([]);
      expect(result.current.deployments).toEqual([]);
      expect(result.current.gdprChecklist).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetching data', () => {
    it('should fetch all project data successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      const mockFindings = [
        {
          id: 'finding-1',
          title: 'Security Issue',
          description: 'Test description',
          severity: 'high',
          status: 'open',
          category: 'vulnerability',
          file_path: 'src/file.ts',
          line_number: 42,
          recommendation: 'Fix this',
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      const mockDeployments = [
        {
          id: 'deploy-1',
          environment: 'prod',
          version: '1.0.0',
          status: 'success',
          commit_hash: 'abc123',
          commit_message: 'Initial release',
          deployed_by_name: 'Developer',
          duration_seconds: 120,
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      const mockGDPR = [
        {
          id: 'gdpr-1',
          category: 'Data Protection',
          title: 'GDPR Compliance',
          description: 'Ensure GDPR compliance',
          is_completed: false,
          completed_at: null,
          priority: 'high',
        },
      ];

      // Mock queries by table name (order-independent for parallel Promise.all)
      mockFrom.mockImplementation((table: string) => {
        if (table === 'security_findings') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({
                    data: mockFindings,
                    error: null,
                  })),
                })),
              })),
            })),
          };
        }
        if (table === 'deployments') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(async () => ({
                    data: mockDeployments,
                    error: null,
                  })),
                })),
              })),
            })),
          };
        }
        if (table === 'gdpr_checklist_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({
                    data: mockGDPR,
                    error: null,
                  })),
                })),
              })),
            })),
          };
        }
        // Default mock
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.securityFindings).toHaveLength(1);
      expect(result.current.securityFindings[0].title).toBe('Security Issue');
      expect(result.current.securityFindings[0].severity).toBe('high');

      expect(result.current.deployments).toHaveLength(1);
      expect(result.current.deployments[0].environment).toBe('prod');
      expect(result.current.deployments[0].status).toBe('success');

      expect(result.current.gdprChecklist).toHaveLength(1);
      expect(result.current.gdprChecklist[0].title).toBe('GDPR Compliance');
      expect(result.current.gdprChecklist[0].isCompleted).toBe(false);
    });

    it('should handle empty data', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.securityFindings).toEqual([]);
      expect(result.current.deployments).toEqual([]);
      expect(result.current.gdprChecklist).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock queries by table name - first query (security_findings) will error
      mockFrom.mockImplementation((table: string) => {
        if (table === 'security_findings') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({
                    data: null,
                    error: { message: 'Database error' },
                  })),
                })),
              })),
            })),
          };
        }
        // Other queries succeed
        if (table === 'deployments') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(async () => ({
                    data: [],
                    error: null,
                  })),
                })),
              })),
            })),
          };
        }
        if (table === 'gdpr_checklist_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({
                    data: [],
                    error: null,
                  })),
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.error).toBeTruthy();
      // Error message comes from the error object or a generic message
      expect(result.current.error).toMatch(/Database error|Failed to fetch/);
    });
  });

  describe('toggleGDPRItem', () => {
    it('should toggle GDPR item completion', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      let callCount = 0;
      // Mock queries and mutations by table name
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        
        // Initial fetch queries (first 3 calls)
        if (callCount <= 3) {
          if (table === 'gdpr_checklist_items') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    order: vi.fn(async () => ({
                      data: [
                        {
                          id: 'gdpr-1',
                          category: 'Data Protection',
                          title: 'GDPR Compliance',
                          is_completed: false,
                          completed_at: null,
                          priority: 'high',
                        },
                      ],
                      error: null,
                    })),
                  })),
                })),
              })),
            };
          }
          // Other tables return empty
          if (table === 'deployments') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(async () => ({ data: [], error: null })),
                  })),
                })),
              })),
            };
          }
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({ data: [], error: null })),
                })),
              })),
            })),
          };
        }
        
        // Mutation call (4th call)
        if (table === 'gdpr_checklist_items') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(async () => ({ error: null })),
            })),
          };
        }
        
        // Default
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await result.current.toggleGDPRItem('gdpr-1', true);

      await waitFor(() => {
        const item = result.current.gdprChecklist.find(i => i.id === 'gdpr-1');
        expect(item?.isCompleted).toBe(true);
      });
    });
  });

  describe('updateFindingStatus', () => {
    it('should update finding status', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      let callCount = 0;
      // Mock queries and mutations by table name
      mockFrom.mockImplementation((table: string) => {
        callCount++;
        
        // Initial fetch queries (first 3 calls)
        if (callCount <= 3) {
          if (table === 'security_findings') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    order: vi.fn(async () => ({
                      data: [
                        {
                          id: 'finding-1',
                          title: 'Security Issue',
                          description: 'Test',
                          severity: 'high',
                          status: 'open',
                          created_at: '2024-01-15T10:00:00Z',
                        },
                      ],
                      error: null,
                    })),
                  })),
                })),
              })),
            };
          }
          // Other tables return empty
          if (table === 'deployments') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(async () => ({ data: [], error: null })),
                  })),
                })),
              })),
            };
          }
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(async () => ({ data: [], error: null })),
                })),
              })),
            })),
          };
        }
        
        // Mutation call (4th call)
        if (table === 'security_findings') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(async () => ({ error: null })),
            })),
          };
        }
        
        // Default
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await result.current.updateFindingStatus('finding-1', 'fixed');

      await waitFor(() => {
        const finding = result.current.securityFindings.find(f => f.id === 'finding-1');
        expect(finding?.status).toBe('fixed');
      });
    });
  });

  describe('realtime subscription', () => {
    it('should set up realtime subscriptions', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(async () => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('project-detail-project-1');
      });

      const channelCall = (supabase.channel as any).mock.results[0].value;
      // Should have 3 .on() calls (for security_findings, deployments, gdpr_checklist_items)
      expect(channelCall.on).toHaveBeenCalledTimes(3);
    });
  });

  describe('refetch', () => {
    it('should refetch all data', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;
      let fetchCount = 0;

      mockFrom.mockImplementation(() => {
        fetchCount++;
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(async () => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjectDetailData('project-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      const initialCount = fetchCount;
      await result.current.refetch();

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(initialCount);
      });
    });
  });
});

import { useState, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { FilterBar, type FilterStatus, type SortOption } from '@/components/dashboard/FilterBar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectPreviewModal } from '@/components/dashboard/ProjectPreviewModal';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { BottomActionBar } from '@/components/dashboard/BottomActionBar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { BulkActionBar } from '@/components/dashboard/BulkActionBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { type Project } from '@/types/project';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const { projects, loading, error, refetch } = useProjects();

  const handleSelectionChange = (projectId: string, selected: boolean) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(projectId);
      } else {
        newSet.delete(projectId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedProjects(new Set());
  };

  const handleBulkDeleteComplete = () => {
    setSelectionMode(false);
    setSelectedProjects(new Set());
  };

  // Calculate counts
  const counts = useMemo(() => ({
    all: projects.length,
    healthy: projects.filter(p => p.status === 'healthy').length,
    warning: projects.filter(p => p.status === 'warning').length,
    critical: projects.filter(p => p.status === 'critical').length,
  }), [projects]);

  const issueCount = counts.warning + counts.critical;

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || 
             p.industry.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (activeFilter !== 'all') {
      result = result.filter(p => p.status === activeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'health':
        result.sort((a, b) => b.securityScore - a.securityScore);
        break;
      case 'recent':
      default:
        // Already sorted by recent from DB
        break;
    }

    return result;
  }, [projects, searchQuery, activeFilter, sortBy]);

  const handleReviewClick = () => {
    setActiveFilter('warning');
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const renderError = () => (
    <div className="bg-card rounded-lg border p-8 text-center space-y-4">
      <AlertCircle className="h-12 w-12 text-danger mx-auto" />
      <div>
        <p className="font-medium text-danger">Failed to load projects</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
      <Button variant="outline" onClick={refetch}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="bg-card rounded-lg border p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl">📦</span>
      </div>
      <div>
        <p className="font-medium text-lg">No projects yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Import repositories from GitHub to get started
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dashboard">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectCount={projects.length}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              totalProjects={projects.length}
              healthyCount={counts.healthy}
              warningCount={issueCount}
              scansThisWeek={47}
              revenue="€2,400/mo"
            />

            {/* Alert Banner - only show if there are issues */}
            {issueCount > 0 && (
              <AlertBanner 
                issueCount={issueCount} 
                onReviewClick={handleReviewClick}
              />
            )}

            {/* Filter Bar */}
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              counts={counts}
              selectionMode={selectionMode}
              onToggleSelectionMode={() => {
                if (selectionMode) {
                  handleCancelSelection();
                } else {
                  setSelectionMode(true);
                }
              }}
            />

            {/* Project List */}
            {loading ? (
              renderLoadingSkeleton()
            ) : error ? (
              renderError()
            ) : projects.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    selectionMode={selectionMode}
                    isSelected={selectedProjects.has(project.id)}
                    onSelectionChange={handleSelectionChange}
                    onPreview={setPreviewProject}
                  />
                ))}

                {filteredProjects.length === 0 && projects.length > 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No projects found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <BottomActionBar />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Trigger */}
      <MobileSidebar />

      {/* Bulk Action Bar */}
      {selectionMode && (
        <BulkActionBar
          selectedCount={selectedProjects.size}
          totalCount={filteredProjects.length}
          selectedIds={Array.from(selectedProjects)}
          onSelectAll={handleSelectAll}
          onCancel={handleCancelSelection}
          onComplete={handleBulkDeleteComplete}
        />
      )}

      {/* Project Preview Modal */}
      <ProjectPreviewModal
        project={previewProject}
        open={!!previewProject}
        onOpenChange={(open) => !open && setPreviewProject(null)}
      />
    </div>
  );
};

export default Index;

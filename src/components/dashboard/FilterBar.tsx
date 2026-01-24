import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type FilterStatus = 'all' | 'healthy' | 'warning' | 'critical';
export type SortOption = 'recent' | 'name' | 'health';

interface FilterBarProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;
}

export function FilterBar({ 
  activeFilter, 
  onFilterChange, 
  sortBy, 
  onSortChange,
  counts,
  selectionMode,
  onToggleSelectionMode
}: FilterBarProps) {
  const filters: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'healthy', label: 'Healthy', count: counts.healthy },
    { value: 'warning', label: 'Warnings', count: counts.warning },
    { value: 'critical', label: 'Critical', count: counts.critical },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "px-3 h-8 gap-1.5 transition-colors",
              activeFilter === filter.value 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {filter.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              activeFilter === filter.value
                ? 'bg-primary/10 text-primary'
                : 'bg-muted-foreground/20'
            )}>
              {filter.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Sort & Selection Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectionMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={onToggleSelectionMode}
          className="gap-1.5"
        >
          <CheckSquare className="h-4 w-4" />
          {selectionMode ? 'Cancel' : 'Select'}
        </Button>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent Activity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="health">Health Score</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

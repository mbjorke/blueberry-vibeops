import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  Users, 
  Cookie,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { type GDPRChecklistItem } from '@/hooks/useProjectDetailData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface GDPRChecklistProps {
  checklist: GDPRChecklistItem[];
  isCompliant: boolean;
  loading?: boolean;
  onToggleItem?: (itemId: string, completed: boolean) => Promise<void>;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType }> = {
  data_collection: { label: 'Data Collection', icon: Database },
  consent: { label: 'Consent', icon: Cookie },
  data_rights: { label: 'Data Rights', icon: Users },
  security: { label: 'Security', icon: Shield },
  documentation: { label: 'Documentation', icon: FileText },
  default: { label: 'Other', icon: FileText },
};

function CategoryBadge({ category }: { category: string }) {
  const config = categoryConfig[category] || categoryConfig.default;
  const Icon = config.icon;
  
  return (
    <Badge variant="secondary" className="gap-1 bg-muted">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    high: { label: 'High', className: 'bg-danger/10 text-danger border-danger/20' },
    medium: { label: 'Medium', className: 'bg-warning/10 text-warning border-warning/20' },
    low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  };
  const priorityConfig = config[priority as keyof typeof config] || config.medium;

  return (
    <Badge variant="outline" className={priorityConfig.className}>
      {priorityConfig.label}
    </Badge>
  );
}

function ChecklistItemComponent({ 
  item, 
  isExpanded, 
  onToggle,
  onCheck 
}: { 
  item: GDPRChecklistItem; 
  isExpanded: boolean;
  onToggle: () => void;
  onCheck?: (completed: boolean) => Promise<void>;
}) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheck = async (checked: boolean) => {
    if (!onCheck) return;
    setIsUpdating(true);
    try {
      await onCheck(checked);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update checklist item',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn(
      'border rounded-lg transition-colors',
      !item.isCompleted && item.priority === 'high' && 'border-danger/30 bg-danger/5',
      !item.isCompleted && item.priority === 'medium' && 'border-warning/30 bg-warning/5',
      item.isCompleted && 'border-border bg-card',
    )}>
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          checked={item.isCompleted}
          onCheckedChange={handleCheck}
          disabled={isUpdating || !onCheck}
          className="mt-1"
        />
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between text-left"
        >
          <div>
            <h4 className={cn('font-medium', item.isCompleted && 'line-through text-muted-foreground')}>
              {item.title}
            </h4>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <CategoryBadge category={item.category} />
            <PriorityBadge priority={item.priority} />
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t ml-7">
          <div className="pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={item.isCompleted ? 'text-success' : 'text-warning'}>
                {item.isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>
            {item.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span>{new Date(item.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GDPRChecklist({ checklist, isCompliant, loading, onToggleItem }: GDPRChecklistProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (checklist.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No GDPR checklist items</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add checklist items to track GDPR compliance
          </p>
        </CardContent>
      </Card>
    );
  }

  const compliantCount = checklist.filter(item => item.isCompleted).length;
  const totalItems = checklist.length;
  const compliancePercentage = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 0;

  const pendingItems = checklist.filter(item => !item.isCompleted);

  // Group by category
  const groupedChecklist = Object.entries(categoryConfig)
    .filter(([key]) => key !== 'default')
    .map(([key, config]) => ({
      category: key,
      label: config.label,
      icon: config.icon,
      items: checklist.filter(item => item.category === key),
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            GDPR Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Score */}
            <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50">
              <div className={cn(
                'text-5xl font-bold',
                isCompliant ? 'text-success' : 'text-warning'
              )}>
                {compliancePercentage}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Compliance Score
              </div>
              <Progress value={compliancePercentage} className="w-full mt-4 h-2" />
              <div className="flex items-center gap-2 mt-3">
                {isCompliant ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Fully Compliant
                  </Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Action Required
                  </Badge>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="space-y-3">
              <h4 className="font-medium mb-3">Compliance Summary</h4>
              <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Completed: <strong>{compliantCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm">Pending: <strong>{pendingItems.length}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Clock className="h-5 w-5" />
              Action Required ({pendingItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
                onCheck={onToggleItem ? (completed) => onToggleItem(item.id, completed) : undefined}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full Checklist by Category */}
      {groupedChecklist.map((group) => (
        <Card key={group.category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <group.icon className="h-5 w-5 text-muted-foreground" />
              {group.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.items.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
                onCheck={onToggleItem ? (completed) => onToggleItem(item.id, completed) : undefined}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

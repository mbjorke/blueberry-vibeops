import { Folder, Heart, Shield, Euro, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  totalProjects: number;
  healthyCount: number;
  warningCount: number;
  scansThisWeek: number;
  revenue: string;
}

export function SummaryCards({ 
  totalProjects, 
  healthyCount, 
  warningCount,
  scansThisWeek,
  revenue 
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Projects */}
      <div className="summary-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Projects</p>
            <p className="text-3xl font-bold mt-1">{totalProjects}</p>
            <div className="flex items-center gap-1 mt-2 text-success text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+2 this month</span>
            </div>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Folder className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="summary-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Health Status</p>
            <p className="text-3xl font-bold mt-1 text-success">{healthyCount} Healthy</p>
            <p className="text-sm text-muted-foreground mt-2">{warningCount} need attention</p>
          </div>
          <div className="p-2.5 bg-success/10 rounded-lg">
            <Heart className="h-5 w-5 text-success" />
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-0.5 h-6 mt-3">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className={`flex-1 rounded-sm ${i < healthyCount ? 'bg-success' : 'bg-warning'}`}
              style={{ height: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      </div>

      {/* Security Scans */}
      <div className="summary-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Security Scans</p>
            <p className="text-3xl font-bold mt-1">{scansThisWeek}</p>
            <p className="text-sm text-muted-foreground mt-2">This week</p>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            +12 since last week
          </span>
        </div>
      </div>

      {/* Revenue Impact */}
      <div className="summary-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Revenue Impact</p>
            <p className="text-3xl font-bold mt-1">{revenue}</p>
            <div className="flex items-center gap-1 mt-2 text-success text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>Monthly recurring</span>
            </div>
          </div>
          <div className="p-2.5 bg-success/10 rounded-lg">
            <Euro className="h-5 w-5 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}

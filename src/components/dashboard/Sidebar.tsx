import { Plus, FileBarChart, Settings, HelpCircle, Check, Shield, Clock, ExternalLink, BookOpen, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { defaultWeeklyStats } from '@/types/project';
import { LiveActivityFeed } from './LiveActivityFeed';
import { useNavigate } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  
  return (
    <aside className="w-80 flex-shrink-0 space-y-6">
      {/* This Week Stats */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
          This Week
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deployments</span>
            <span className="font-semibold flex items-center gap-1.5">
              {defaultWeeklyStats.deployments}
              <Check className="h-4 w-4 text-success" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Security Scans</span>
            <span className="font-semibold flex items-center gap-1.5">
              {defaultWeeklyStats.securityScans}
              <Check className="h-4 w-4 text-success" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Issues Blocked</span>
            <span className="font-semibold flex items-center gap-1.5">
              {defaultWeeklyStats.issuesBlocked}
              <Shield className="h-4 w-4 text-primary" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time Saved</span>
            <span className="font-semibold flex items-center gap-1.5">
              {defaultWeeklyStats.timeSaved}
              <Clock className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Button className="w-full justify-start gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Add New Project
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            size="sm"
            onClick={() => navigate('/clients')}
          >
            <Building2 className="h-4 w-4" />
            Manage Clients
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <FileBarChart className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            size="sm"
            onClick={() => navigate('/ops-guide')}
          >
            <BookOpen className="h-4 w-4" />
            Ops Guide
          </Button>
        </div>
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed maxHeight="300px" />

      {/* Support */}
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-medium mb-1">Need help?</h4>
            <div className="space-y-1">
              <Button variant="link" className="p-0 h-auto text-sm text-primary">
                Contact Support
              </Button>
              <br />
              <Button variant="link" className="p-0 h-auto text-sm text-primary flex items-center gap-1">
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

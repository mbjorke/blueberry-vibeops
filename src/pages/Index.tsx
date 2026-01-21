import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Dashboard from './Dashboard';
import { SidebarNav } from '@/components/ui/SidebarNav';
import BlueberryLogo from '@/components/ui/blueberry-logo';
import { AlertsDropdown } from '@/components/fintech/AlertsDropdown';
import { UserAvatar } from '@/components/fintech/UserAvatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-row">
      <SidebarNav isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Optimized for mobile */}
        <header className="bg-popover/90 backdrop-blur-md text-foreground px-3 sm:px-4 py-3 shadow-lg sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-full">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 p-0 hover:bg-accent/10"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              ) : (
                <BlueberryLogo size="sm" />
              )}
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold truncate">
                blueberry
              </h1>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle data-testid="theme-toggle" />
              <AlertsDropdown />
              <UserAvatar 
                name="Marcus Björke" 
                email="marcus@blueberry.surf"
                imageUrl="/marcus-bjorke.png"
                resumeUrl="https://mbjorke.cv"
              />
            </div>
          </div>
        </header>
        
        {/* Main Dashboard */}
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;

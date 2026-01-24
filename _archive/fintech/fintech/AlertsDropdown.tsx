import { useState } from 'react';
import { Bell, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

type AlertType = 'info' | 'warning' | 'success' | 'error';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Unusual Spending Pattern',
    message: 'Higher than usual spending detected in the Shopping category this month.',
    time: '10 min ago',
    read: false
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment Received',
    message: 'Your salary has been credited to your account.',
    time: '2 hours ago',
    read: true
  },
  {
    id: '3',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out the new spending insights dashboard!',
    time: '1 day ago',
    read: true
  },
  {
    id: '4',
    type: 'error',
    title: 'Payment Failed',
    message: 'Your recent payment to Netflix could not be processed.',
    time: '2 days ago',
    read: false
  }
];

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <X className="h-4 w-4 text-red-500" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

export const AlertsDropdown = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = alerts.filter(alert => !alert.read).length;
  
  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };
  
  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };
  
  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-12 w-12 rounded-full hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-12 w-12" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            disabled={unreadCount === 0}
            className="hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Mark all as read
          </Button>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id}>
                <DropdownMenuItem 
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${!alert.read ? 'bg-muted/50' : ''}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="m-0" />
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          )}
        </div>
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

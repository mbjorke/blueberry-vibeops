import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tooltip components provide contextual information on hover or focus. They support various content types and include proper accessibility features. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a simple tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click for more information</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Need help? Click here</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlertCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Important notification</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const FinancialTooltips: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <h3 className="text-lg font-semibold">Financial Information Tooltips</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <span>Transaction Fee</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Standard fee of €0.50 per transaction</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-medium">€0.50</span>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <span>Exchange Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Current EUR to USD rate: 1.08</p>
                <p className="text-xs text-muted-foreground mt-1">Updated every 15 minutes</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-medium">1.08</span>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <span>Processing Time</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Domestic transfers: 1-2 business days</p>
                <p className="text-xs text-muted-foreground mt-1">International: 3-5 business days</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="font-medium">1-2 days</span>
        </div>
      </div>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Account Status</Button>
        </TooltipTrigger>
        <TooltipContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-semibold">Account Verification</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Email verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Phone verified</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <span>ID verification pending</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Complete ID verification to unlock all features
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Security Score</Button>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-semibold">Security Rating: 85/100</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Good security practices detected
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const DifferentPositions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 items-center justify-items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip above</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip to the right</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip below</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip to the left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">Instant</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows immediately</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="outline">500ms Delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows after 500ms</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="outline">1s Delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows after 1 second</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support</li>
          <li>Focus management</li>
          <li>Screen reader announcements</li>
          <li>High contrast colors for visibility</li>
        </ul>
      </div>
      
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" aria-describedby="tooltip-demo">
              Accessibility Demo
            </Button>
          </TooltipTrigger>
          <TooltipContent id="tooltip-demo">
            <p>This tooltip demonstrates proper accessibility implementation</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="text-xs text-muted-foreground">
          Try navigating with your keyboard and using a screen reader
        </div>
      </div>
    </div>
  ),
};

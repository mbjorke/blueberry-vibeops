import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

const meta: Meta<typeof Progress> = {
  title: 'Primitives/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress components display the completion status of a task or process. They support different values and can be animated. Built with Radix UI primitives for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The current progress value (0-100)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 33,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{args.value}%</span>
        </div>
        <Progress value={args.value} />
      </div>
    </div>
  ),
};

export const FinancialProgress: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Monthly Budget Progress</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Housing</span>
              <span className="text-red-600 font-medium">€1,200 / €1,200</span>
            </div>
            <Progress value={100} className="h-2" />
            <span className="text-xs text-muted-foreground">100% - Budget reached</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Shopping</span>
              <span className="text-orange-600 font-medium">€90 / €300</span>
            </div>
            <Progress value={30} className="h-2" />
            <span className="text-xs text-muted-foreground">30% - Under budget</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Food</span>
              <span className="text-green-600 font-medium">€66 / €500</span>
            </div>
            <Progress value={13} className="h-2" />
            <span className="text-xs text-muted-foreground">13% - Well under budget</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        
        <div className="text-xs text-muted-foreground">
          This progress bar animates to 66% after a short delay to demonstrate the smooth transitions.
        </div>
      </div>
    );
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <h3 className="text-lg font-semibold">Progress Bar Sizes</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Small (h-1)</span>
            <span>75%</span>
          </div>
          <Progress value={75} className="h-1" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Default (h-2)</span>
            <span>50%</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Large (h-3)</span>
            <span>25%</span>
          </div>
          <Progress value={25} className="h-3" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Extra Large (h-4)</span>
            <span>90%</span>
          </div>
          <Progress value={90} className="h-4" />
        </div>
      </div>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <h3 className="text-lg font-semibold">Custom Styled Progress Bars</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Success Progress</span>
            <span>80%</span>
          </div>
          <Progress 
            value={80} 
            className="h-3 bg-green-100 [&>div]:bg-green-600" 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Warning Progress</span>
            <span>60%</span>
          </div>
          <Progress 
            value={60} 
            className="h-3 bg-yellow-100 [&>div]:bg-yellow-600" 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Danger Progress</span>
            <span>90%</span>
          </div>
          <Progress 
            value={90} 
            className="h-3 bg-red-100 [&>div]:bg-red-600" 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Info Progress</span>
            <span>45%</span>
          </div>
          <Progress 
            value={45} 
            className="h-3 bg-blue-100 [&>div]:bg-blue-600" 
          />
        </div>
      </div>
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
          <li>High contrast colors for visibility</li>
          <li>Semantic HTML structure</li>
          <li>Keyboard navigation support</li>
          <li>Screen reader announcements for progress changes</li>
        </ul>
      </div>
      
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Accessibility Demo</span>
            <span>75%</span>
          </div>
          <Progress 
            value={75} 
            className="h-3"
            aria-label="Task completion progress: 75 percent complete"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          This progress bar includes proper ARIA labels and is designed to be accessible to all users.
        </div>
      </div>
    </div>
  ),
};

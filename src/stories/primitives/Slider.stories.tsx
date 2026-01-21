import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

const meta: Meta<typeof Slider> = {
  title: 'Primitives/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Slider components provide range input functionality with a draggable handle. They support single and multiple values with proper accessibility features. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'object',
      description: 'The default value(s) for the slider',
    },
    max: {
      control: 'number',
      description: 'The maximum value of the slider',
    },
    min: {
      control: 'number',
      description: 'The minimum value of the slider',
    },
    step: {
      control: 'number',
      description: 'The step increment for the slider',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Value</span>
            <span>{value[0]}%</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Range</span>
            <span>{value[0]}% - {value[1]}%</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    );
  },
};

export const FinancialSlider: Story = {
  render: () => {
    const [budget, setBudget] = useState([3000]);
    const [savings, setSavings] = useState([500, 2000]);
    
    return (
      <div className="w-[400px] space-y-6">
        <h3 className="text-lg font-semibold">Financial Settings</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Budget</span>
              <span>€{budget[0].toLocaleString()}</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={1000}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€1,000</span>
              <span>€10,000</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Savings Target Range</span>
              <span>€{savings[0].toLocaleString()} - €{savings[1].toLocaleString()}</span>
            </div>
            <Slider
              value={savings}
              onValueChange={setSavings}
              min={100}
              max={5000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€100</span>
              <span>€5,000</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithSteps: Story = {
  render: () => {
    const [value, setValue] = useState([2]);
    
    const stepLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    
    return (
      <div className="w-[400px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Credit Rating</span>
            <span>{stepLabels[value[0] - 1]}</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepLabels.map((label, index) => (
              <span key={index} className="text-center flex-1">{label}</span>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const WithCustomStyling: Story = {
  render: () => {
    const [value, setValue] = useState([75]);
    
    return (
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Custom Styled</span>
            <span>{value[0]}%</span>
          </div>
          <Slider
            value={value}
            onValueChange={setValue}
            max={100}
            step={1}
            className="w-full [&>span]:bg-blue-600 [&>span]:border-blue-600"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          This slider uses custom colors to match the blue theme.
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <h3 className="text-lg font-semibold">Disabled States</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Disabled Single</span>
            <span>50%</span>
          </div>
          <Slider
            value={[50]}
            max={100}
            step={1}
            disabled
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Disabled Range</span>
            <span>25% - 75%</span>
          </div>
          <Slider
            value={[25, 75]}
            max={100}
            step={1}
            disabled
            className="w-full"
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
          <li>Keyboard navigation support (Arrow keys, Home/End)</li>
          <li>High contrast colors for visibility</li>
          <li>Semantic HTML structure</li>
          <li>Focus management and visible focus indicators</li>
        </ul>
      </div>
      
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Accessibility Demo</span>
            <span>60%</span>
          </div>
          <Slider
            value={[60]}
            max={100}
            step={1}
            className="w-full"
            aria-label="Accessibility demonstration slider"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          This slider demonstrates proper accessibility implementation. Try navigating with your keyboard using arrow keys.
        </div>
      </div>
    </div>
  ),
};

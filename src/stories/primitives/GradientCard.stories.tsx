import type { Meta, StoryObj } from '@storybook/react';
import { GradientCard } from '@/components/ui/gradient-card';

const meta = {
  title: 'Primitives/Gradient Card',
  component: GradientCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with gradient background and hover effects. Can be used as a base for other card components.',
      },
    },
  },
  tags: ['autodocs', 'base'],
  argTypes: {
    glow: {
      control: 'boolean',
      description: 'Adds a subtle glow effect around the card',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    gradientDirection: {
      control: 'select',
      options: ['to-t', 'to-tr', 'to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl'],
      description: 'Direction of the gradient',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'to-br' },
      },
    },
    from: {
      control: 'color',
      description: 'Starting color of the gradient',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'from-primary' },
      },
    },
    to: {
      control: 'color',
      description: 'Ending color of the gradient',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'to-primary/50' },
      },
    },
    selected: {
      control: 'boolean',
      description: 'Applies selected state styling',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    selectedFrom: {
      control: 'color',
      description: 'Starting color of the gradient when selected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'from-accent' },
      },
    },
    selectedTo: {
      control: 'color',
      description: 'Ending color of the gradient when selected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'to-accent/50' },
      },
    },
    children: {
      control: 'text',
      description: 'Card content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
} satisfies Meta<typeof GradientCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Gradient Card',
    className: 'p-6 rounded-2xl text-center',
  },
};

export const WithGlow: Story = {
  args: {
    ...Default.args,
    glow: true,
    children: 'Card with Glow Effect',
  },
};

export const SelectedState: Story = {
  args: {
    ...Default.args,
    selected: true,
    children: 'Selected Card State',
  },
};

export const CustomGradient: Story = {
  args: {
    ...Default.args,
    from: '#4f46e5',
    to: '#7c3aed',
    gradientDirection: 'to-r',
    children: 'Custom Gradient Colors',
  },
};

export const AsInteractiveElement: Story = {
  args: {
    ...Default.args,
    className: 'p-6 rounded-2xl text-center cursor-pointer hover:scale-105 transition-transform',
    children: 'Clickable Card',
    onClick: () => console.log('Card clicked!'),
  },
};

export const WithComplexContent: Story = {
  render: (args) => (
    <GradientCard {...args} className="p-6 w-80">
      <h3 className="text-lg font-semibold mb-2">Card Title</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This card demonstrates how to use GradientCard with more complex content structure.
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm">Details</span>
        <button 
          className="px-3 py-1 bg-background/50 rounded-md text-sm hover:bg-background/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Button clicked!');
          }}
        >
          Action
        </button>
      </div>
    </GradientCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using GradientCard with complex content structure including interactive elements.',
      },
    },
  },
};

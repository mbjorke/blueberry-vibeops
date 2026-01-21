import type { Meta, StoryObj } from '@storybook/react';
import { BlueberryLogo } from '@/components/ui/blueberry-logo';

// Size options for story controls
const sizeOptions = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

const meta = {
  title: 'Blueberry/Components/Logo',
  component: BlueberryLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the logo',
    },
    size: {
      control: { type: 'select' },
      options: Object.values(sizeOptions),
      description: 'Size variant of the logo',
    },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof BlueberryLogo>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'ring-2 ring-offset-2 ring-primary rounded-full',
  },
};

// Showcase different logo variants in a grid
export const AllSizes = () => (
  <div className="grid grid-cols-4 gap-8 items-center justify-items-center p-6">
    {Object.entries({
      'Small (24px)': 'sm',
      'Medium (32px)': 'md',
      'Large (48px)': 'lg',
      'Extra Large (64px)': 'xl',
    }).map(([label, size]) => (
      <div key={size} className="flex flex-col items-center gap-3">
        <BlueberryLogo size={size as 'sm' | 'md' | 'lg' | 'xl'} />
        <span className="text-sm text-foreground/70">{label}</span>
      </div>
    ))}
  </div>
);

AllSizes.parameters = {
  docs: {
    description: {
      story: 'All available logo sizes displayed in a grid for comparison.',
    },
  },
};

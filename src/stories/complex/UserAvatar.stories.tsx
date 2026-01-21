import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Simple UserAvatar component for Storybook
const StorybookUserAvatar = ({ name, size }: { name: string; size: number }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.4}px`,
      fontWeight: 'bold'
    }}>
      {initials}
    </div>
  );
};

const meta: Meta<typeof StorybookUserAvatar> = {
  title: "Blueberry/Components/User Avatar",
  component: StorybookUserAvatar,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: {
      control: "text",
      description: "User's full name",
    },
    size: {
      control: "number",
      description: "Avatar size in pixels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StorybookUserAvatar>;

export const Default: Story = {
  args: {
    name: "John Doe",
    size: 40,
  },
};

export const Large: Story = {
  args: {
    name: "Jane Smith",
    size: 80,
  },
};

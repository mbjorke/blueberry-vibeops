import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Simple Navigation component for Storybook (matches TestStory pattern)
const StorybookNavigation = ({ brand }: { brand: string }) => {
  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            🫐 {brand || 'Blueberry'}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/items" style={{ color: '#374151', textDecoration: 'none', padding: '8px 16px', borderRadius: '4px', transition: 'background-color 0.2s' }}>
              Browse
            </a>
            <a href="/sell" style={{ color: '#374151', textDecoration: 'none', padding: '8px 16px', borderRadius: '4px', transition: 'background-color 0.2s' }}>
              Sell
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const meta: Meta<typeof StorybookNavigation> = {
  title: "Blueberry/Components/Navigation",
  component: StorybookNavigation,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    brand: {
      control: "text",
      description: "Brand name to display in navigation",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StorybookNavigation>;

export const Default: Story = {
  args: {
    brand: "Blueberry",
  },
};

export const CustomBrand: Story = {
  args: {
    brand: "Loppis Market",
  },
};

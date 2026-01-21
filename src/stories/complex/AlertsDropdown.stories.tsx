import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Simple AlertsDropdown component for Storybook
const StorybookAlertsDropdown = ({ count }: { count: number }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      <button style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '8px 12px',
        cursor: 'pointer',
        position: 'relative'
      }}>
        🔔 Alerts
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {count}
          </span>
        )}
      </button>
    </div>
  );
};

const meta: Meta<typeof StorybookAlertsDropdown> = {
  title: "Blueberry/Components/Alerts Dropdown",
  component: StorybookAlertsDropdown,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    count: {
      control: "number",
      description: "Number of alerts to show",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StorybookAlertsDropdown>;

export const Default: Story = {
  args: {
    count: 0,
  },
};

export const WithAlerts: Story = {
  args: {
    count: 3,
  },
};

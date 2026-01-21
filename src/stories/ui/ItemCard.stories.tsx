import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Simple ItemCard component for Storybook (matches TestStory pattern exactly)
const StorybookItemCard = ({ title, price }: { title: string; price: string }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <img
        src="https://via.placeholder.com/300x200?text=Item+Image"
        alt="Item"
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
          borderRadius: '4px',
          marginBottom: '12px'
        }}
      />
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#111827'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#059669'
      }}>
        {price}
      </p>
    </div>
  );
};

const meta: Meta<typeof StorybookItemCard> = {
  title: "Blueberry/Components/Item Card",
  component: StorybookItemCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Item title",
    },
    price: {
      control: "text",
      description: "Item price",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StorybookItemCard>;

export const Default: Story = {
  args: {
    title: "Sample Item",
    price: "250 kr",
  },
};

export const Expensive: Story = {
  args: {
    title: "Expensive Item",
    price: "1,250 kr",
  },
};

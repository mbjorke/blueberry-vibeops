import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "../../components/ui/brand-logo";

const meta: Meta<typeof BrandLogo> = {
  title: "Components/BrandLogo",
  component: BrandLogo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Brand logo component with gradient styling and optional variant badge."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "text" },
      description: "Optional variant text to display in a badge"
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes"
    }
  }
};

export default meta;
type Story = StoryObj<typeof BrandLogo>;

export const Default: Story = {
  args: {}
};

export const WithVariant: Story = {
  args: {
    variant: "Design System"
  }
};

export const WithCustomClass: Story = {
  args: {
    className: "text-lg"
  }
};

export const WithVariantAndClass: Story = {
  args: {
    variant: "v1.0.0",
    className: "scale-110"
  }
};

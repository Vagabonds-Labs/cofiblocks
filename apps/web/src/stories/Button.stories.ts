import type { Meta, StoryObj } from '@storybook/react';

import { Button } from "@repo/ui/button"

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const CustomClass: Story = {
  args: {
    children: 'Custom Class Button',
    className: 'bg-red-500 hover:bg-red-600',
  },
};

export const WithOnClick: Story = {
  args: {
    children: 'Click Me',
    onClick: () => alert('Button clicked!'),
  },
};

export const SubmitType: Story = {
  args: {
    children: 'Submit',
    type: 'submit',
  },
};
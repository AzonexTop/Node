import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for grouping related content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title displayed at the top of the card',
    },
    children: {
      control: 'text',
      description: 'The content to display inside the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'This is the content of the card. It can contain any React elements.',
  },
};

// Card without title
export const WithoutTitle: Story = {
  args: {
    children: 'This card has no title, just content.',
  },
};

// Card with complex content
export const WithComplexContent: Story = {
  args: {
    title: 'User Profile',
    children: (
      <div>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john.doe@example.com</p>
        <p><strong>Role:</strong> Developer</p>
      </div>
    ),
  },
};

// Card with custom styling
export const CustomStyled: Story = {
  args: {
    title: 'Styled Card',
    className: 'border-2 border-blue-500',
    children: 'This card has custom styling applied.',
  },
};

// Card with long content
export const WithLongContent: Story = {
  args: {
    title: 'Documentation',
    children: (
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat 
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
          officia deserunt mollit anim id est laborum.
        </p>
      </div>
    ),
  },
};
import type { Meta, StoryObj } from '@storybook/react';
import { AvatarWithIcon } from '@/components/ui/avatar-with-icon';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { getCategoryColorClasses } from '@/components/fintech/constants';
import { ShoppingBag, CreditCard, Coffee, Utensils, Home, Car, HeartPulse, GraduationCap, Gift } from 'lucide-react';

const meta: Meta<typeof AvatarWithIcon> = {
  title: 'Components/UI/AvatarWithIcon',
  component: AvatarWithIcon,
  tags: ['autodocs'],
  argTypes: {
    imageUrl: { control: 'text' },
    name: { control: 'text' },
    colorClass: { control: 'text' },
    size: { control: 'number' },
    className: { control: 'text' },
    onClick: { action: 'clicked' },
  },
  args: {
    name: 'User Name',
    size: 48,
  },
};

export default meta;

type Story = StoryObj<typeof AvatarWithIcon>;

// Default story with icon
const IconTemplate: Story = {
  render: (args) => <AvatarWithIcon {...args} />,
  args: {
    icon: ShoppingBag,
    colorClass: 'bg-primary text-primary-foreground',
  },
};

// Story with image
const ImageTemplate: Story = {
  render: (args) => <AvatarWithIcon {...args} />,
  args: {
    imageUrl: 'https://github.com/shadcn.png',
    name: 'Profile',
  },
};

// Story with initials
const InitialsTemplate: Story = {
  render: (args) => <AvatarWithIcon {...args} />,
  args: {
    name: 'John Doe',
    colorClass: 'bg-accent text-accent-foreground',
  },
};

// Story with different sizes
const SizesTemplate: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AvatarWithIcon name="XS" size={24} colorClass="bg-muted" />
      <AvatarWithIcon name="SM" size={32} colorClass="bg-muted" />
      <AvatarWithIcon name="MD" size={48} colorClass="bg-muted" />
      <AvatarWithIcon name="LG" size={64} colorClass="bg-muted" />
      <AvatarWithIcon name="XL" size={96} colorClass="bg-muted" />
    </div>
  ),
};

// Story with different transaction categories
const CategoriesTemplate: Story = {
  render: () => {
    const categories = [
      { name: 'Shopping', icon: ShoppingBag, color: 'bg-blue-500' },
      { name: 'Bills', icon: CreditCard, color: 'bg-green-500' },
      { name: 'Food & Drink', icon: Utensils, color: 'bg-amber-500' },
      { name: 'Coffee', icon: Coffee, color: 'bg-amber-400' },
      { name: 'Housing', icon: Home, color: 'bg-purple-500' },
      { name: 'Transport', icon: Car, color: 'bg-sky-500' },
      { name: 'Healthcare', icon: HeartPulse, color: 'bg-rose-500' },
      { name: 'Education', icon: GraduationCap, color: 'bg-indigo-500' },
      { name: 'Gifts', icon: Gift, color: 'bg-pink-500' },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map(({ name, icon: Icon, color }) => {
          const colors = getCategoryColorClasses(name.toLowerCase(), false);
          return (
            <div key={name} className="flex flex-col items-center gap-2">
              <AvatarWithIcon 
                icon={Icon}
                colorClass={colors.bg}
                size={48}
                name={name}
              />
              <div className="text-center">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-foreground/70">{colors.bg}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
};

// Story showing merchant avatars with fallback to category icons
const MerchantAvatarsTemplate: Story = {
  render: () => {
    const merchants = [
      { 
        name: 'Starbucks', 
        category: 'food',
        image: 'https://logo.clearbit.com/starbucks.com',
      },
      { 
        name: 'Amazon', 
        category: 'shopping',
        image: 'https://logo.clearbit.com/amazon.com',
      },
      { 
        name: 'Uber', 
        category: 'transport',
        image: 'https://logo.clearbit.com/uber.com',
      },
      { 
        name: 'Local Restaurant', 
        category: 'food',
        image: '',
      },
      { 
        name: 'Unknown Merchant', 
        category: 'other',
        isUnmapped: true,
        image: '',
      },
    ];

    return (
      <div className="space-y-6">
        {merchants.map(({ name, category, image, isUnmapped }) => {
          const colors = getCategoryColorClasses(category, isUnmapped);
          const Icon = getCategoryIcon(name, category);
          
          return (
            <div key={name} className="flex items-center gap-4 p-4 border rounded-lg">
              <AvatarWithIcon
                imageUrl={image}
                name={name}
                icon={Icon}
                colorClass={colors.bg}
                size={48}
              />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-foreground/70">
                  {isUnmapped ? 'Unmapped' : category} • {colors.bg}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
};

// Story with label
const WithLabelTemplate: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <AvatarWithIcon 
          icon={ShoppingBag} 
          label="Shopping" 
          showLabel 
          size={32}
          colorClass="bg-blue-100"
          iconColorClass="text-blue-600"
          labelClassName="text-sm"
        />
        <AvatarWithIcon 
          icon={Coffee} 
          label="Food & Drinks" 
          showLabel 
          size={32}
          colorClass="bg-amber-100"
          iconColorClass="text-amber-600"
          labelClassName="text-sm"
        />
        <AvatarWithIcon 
          icon={Car} 
          label="Transport" 
          showLabel
          size={32}
          colorClass="bg-emerald-100"
          iconColorClass="text-emerald-600"
          labelClassName="text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <AvatarWithIcon 
          icon={Home} 
          label="Housing" 
          showLabel 
          size={32}
          colorClass="bg-purple-100"
          iconColorClass="text-purple-600"
          labelClassName="text-sm"
        />
        <AvatarWithIcon 
          icon={HeartPulse} 
          label="Health" 
          showLabel 
          size={32}
          colorClass="bg-rose-100"
          iconColorClass="text-rose-600"
          labelClassName="text-sm"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'AvatarWithIcon with labels showing different categories. The label appears next to the icon and can be styled using the `labelClassName` prop.'
      }
    }
  }
};

export const WithIcon = IconTemplate;
export const WithImage = ImageTemplate;
export const WithInitials = InitialsTemplate;
export const WithCategoryIcons = CategoriesTemplate;
export const WithMerchantAvatars = MerchantAvatarsTemplate;
export const WithLabel = WithLabelTemplate;
export const MerchantExamples = MerchantAvatarsTemplate;

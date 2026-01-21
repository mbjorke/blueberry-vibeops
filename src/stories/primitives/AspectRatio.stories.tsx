import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof AspectRatio> = {
  title: 'Primitives/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AspectRatio components maintain consistent proportions for content like images, videos, and charts. They ensure responsive behavior across different screen sizes.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo"
          className="rounded-md object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const DifferentRatios: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">16:9 (Widescreen)</h3>
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <div className="flex items-center justify-center text-muted-foreground">
            <span>16:9 Ratio</span>
          </div>
        </AspectRatio>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">4:3 (Standard)</h3>
        <AspectRatio ratio={4 / 3} className="bg-muted">
          <div className="flex items-center justify-center text-muted-foreground">
            <span>4:3 Ratio</span>
          </div>
        </AspectRatio>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">1:1 (Square)</h3>
        <AspectRatio ratio={1} className="bg-muted">
          <div className="flex items-center justify-center text-muted-foreground">
            <span>1:1 Ratio</span>
          </div>
        </AspectRatio>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">3:2 (Photo)</h3>
        <AspectRatio ratio={3 / 2} className="bg-muted">
          <div className="flex items-center justify-center text-muted-foreground">
            <span>3:2 Ratio</span>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};

export const FinancialCharts: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Financial Data Visualization</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Portfolio Performance</h4>
          <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg">
            <div className="flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <div className="w-32 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded"></div>
                <p className="text-xs text-muted-foreground">Chart Placeholder</p>
              </div>
            </div>
          </AspectRatio>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Spending Breakdown</h4>
          <AspectRatio ratio={1} className="bg-muted rounded-lg">
            <div className="flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-purple-500 rounded-full"></div>
                <p className="text-xs text-muted-foreground">Pie Chart</p>
              </div>
            </div>
          </AspectRatio>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Monthly Trends</h4>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
          <div className="flex items-center justify-center p-4">
            <div className="text-center space-y-2">
              <div className="w-48 h-16 bg-gradient-to-r from-blue-400 to-green-500 rounded"></div>
              <p className="text-xs text-muted-foreground">Line Chart</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};

export const ResponsiveCards: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Responsive Card Layouts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <AspectRatio ratio={16 / 9}>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">Card 1</span>
            </div>
          </AspectRatio>
          <CardContent className="p-4">
            <h4 className="font-semibold">Investment Account</h4>
            <p className="text-sm text-muted-foreground">Portfolio overview and performance</p>
          </CardContent>
        </Card>
        
        <Card>
          <AspectRatio ratio={4 / 3}>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-semibold">Card 2</span>
            </div>
          </AspectRatio>
          <CardContent className="p-4">
            <h4 className="font-semibold">Savings Goal</h4>
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <AspectRatio ratio={1}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-semibold">Card 3</span>
            </div>
          </AspectRatio>
          <CardContent className="p-4">
            <h4 className="font-semibold">Budget Tracker</h4>
            <p className="text-sm text-muted-foreground">Monthly spending analysis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Content Examples</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Video Placeholder</h4>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">▶</span>
                </div>
                <p className="text-sm">Video Content</p>
              </div>
            </div>
          </AspectRatio>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Image Gallery</h4>
          <div className="grid grid-cols-3 gap-2">
            <AspectRatio ratio={1} className="bg-muted rounded">
              <div className="bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white text-xs">
                Image 1
              </div>
            </AspectRatio>
            <AspectRatio ratio={1} className="bg-muted rounded">
              <div className="bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs">
                Image 2
              </div>
            </AspectRatio>
            <AspectRatio ratio={1} className="bg-muted rounded">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs">
                Image 3
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Maintains content proportions across screen sizes</li>
          <li>Prevents layout shift during content loading</li>
          <li>Supports responsive design patterns</li>
          <li>Works with screen readers and assistive technologies</li>
        </ul>
      </div>
      
      <div className="w-[300px] space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Demo Content</h4>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
            <div className="flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <Badge variant="secondary">Accessibility Demo</Badge>
                <p className="text-xs text-muted-foreground">
                  This aspect ratio container maintains consistent proportions
                </p>
              </div>
            </div>
          </AspectRatio>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold">Usage Notes:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Use for images, videos, charts, and other media</li>
            <li>Prevents content jumping during page load</li>
            <li>Maintains design consistency across devices</li>
            <li>Supports various aspect ratios for different content types</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

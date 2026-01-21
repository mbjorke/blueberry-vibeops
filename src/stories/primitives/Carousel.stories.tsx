import type { Meta, StoryObj } from '@storybook/react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CreditCard, PiggyBank, Shield, Bell, User } from 'lucide-react';

const meta: Meta<typeof Carousel> = {
  title: 'Primitives/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Carousel components provide a slideshow interface for cycling through content. They support touch gestures, keyboard navigation, and proper accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-xs">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const FinancialDashboard: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Portfolio</h3>
                      <p className="text-blue-100 text-sm">Total Value</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">€45,230.50</div>
                  <Badge variant="secondary" className="mt-2 bg-blue-400 text-blue-900">
                    +12.5% this month
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PiggyBank className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Savings</h3>
                      <p className="text-green-100 text-sm">Goal Progress</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">€8,450.00</div>
                  <Badge variant="secondary" className="mt-2 bg-green-400 text-green-900">
                    67% of €12,500 goal
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Credit Score</h3>
                      <p className="text-purple-100 text-sm">Current Rating</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">780</div>
                  <Badge variant="secondary" className="mt-2 bg-purple-400 text-purple-900">
                    Excellent
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Security</h3>
                      <p className="text-orange-100 text-sm">Account Status</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">Protected</div>
                  <Badge variant="secondary" className="mt-2 bg-orange-400 text-orange-900">
                    2FA Enabled
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const MultipleSlides: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-[4/3] items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-3xl font-semibold mb-2">{index + 1}</div>
                      <p className="text-sm text-muted-foreground">Slide {index + 1}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const WithIndicators: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Carousel className="w-full">
        <CarouselContent>
          {Array.from({ length: 3 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-4xl font-semibold mb-2">{index + 1}</div>
                      <p className="text-sm text-muted-foreground">Content {index + 1}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <button
            key={index}
            className="w-2 h-2 rounded-full bg-muted hover:bg-primary transition-colors"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const AutoPlay: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <CardContent className="flex aspect-video items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-4xl font-semibold mb-2">{index + 1}</div>
                      <p className="text-indigo-100">Auto-playing slide</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        This carousel auto-plays with loop enabled
      </p>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support (Arrow keys, Enter, Escape)</li>
          <li>Focus management and visible focus indicators</li>
          <li>Touch gesture support for mobile devices</li>
          <li>Semantic HTML structure</li>
        </ul>
      </div>
      
      <div className="w-full max-w-md">
        <Carousel className="w-full">
          <CarouselContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-3xl font-semibold mb-2">{index + 1}</div>
                        <p className="text-sm text-muted-foreground">
                          Accessibility Demo {index + 1}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Keyboard Shortcuts:</p>
        <ul className="list-disc list-inside mt-1">
          <li>←/→ - Navigate slides</li>
          <li>Enter - Activate slide</li>
          <li>Home/End - Go to first/last slide</li>
          <li>Space - Pause/play auto-advance</li>
        </ul>
      </div>
    </div>
  ),
};

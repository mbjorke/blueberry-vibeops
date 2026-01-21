import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';

const meta: Meta<typeof Calendar> = {
  title: 'Primitives/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Calendar components provide date selection functionality with various modes and styling options. They support single dates, date ranges, and multiple dates with proper accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {},
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    );
  },
};

export const DateRange: Story = {
  args: {},
  render: () => {
    const [date, setDate] = useState<{
      from: Date;
      to: Date | undefined;
    } | undefined>({
      from: new Date(2024, 5, 1),
      to: new Date(2024, 5, 15),
    });
    
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              if (range?.from) {
                setDate({
                  from: range.from,
                  to: range.to || undefined
                });
              }
            }}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    );
  },
};

export const MultipleDates: Story = {
  args: {},
  render: () => {
    const [dates, setDates] = useState<Date[] | undefined>([
      new Date(2024, 5, 1),
      new Date(2024, 5, 15),
      new Date(2024, 5, 30),
    ]);
    
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Select Multiple Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={setDates}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    );
  },
};

export const FinancialCalendar: Story = {
  args: {},
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    // Mock financial events
    const financialEvents = [
      { date: new Date(2024, 5, 1), type: 'bill', label: 'Rent Due' },
      { date: new Date(2024, 5, 15), type: 'income', label: 'Salary' },
      { date: new Date(2024, 5, 20), type: 'bill', label: 'Credit Card' },
      { date: new Date(2024, 5, 25), type: 'investment', label: 'Dividend' },
    ];
    
    const getEventForDate = (date: Date) => {
      return financialEvents.find(event => 
        event.date.toDateString() === date.toDateString()
      );
    };
    
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Financial Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              bill: (date) => getEventForDate(date)?.type === 'bill',
              income: (date) => getEventForDate(date)?.type === 'income',
              investment: (date) => getEventForDate(date)?.type === 'investment',
            }}
            modifiersStyles={{
              bill: { backgroundColor: 'hsl(var(--destructive))', color: 'white' },
              income: { backgroundColor: 'hsl(var(--success))', color: 'white' },
              investment: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
            }}
          />
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Bills & Payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Investment Returns</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
};

export const WithCustomStyling: Story = {
  args: {},
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Custom Styled Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-lg"
            classNames={{
              day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
              day_today: "bg-blue-100 text-blue-900",
              day_outside: "text-muted-foreground opacity-50",
              head_cell: "text-blue-600 font-semibold",
              nav_button: "hover:bg-blue-100",
            }}
          />
        </CardContent>
      </Card>
    );
  },
};

export const DisabledDates: Story = {
  args: {},
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    // Disable weekends and past dates
    const disabledDates = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return (
        date < today || // Past dates
        date.getDay() === 0 || // Sunday
        date.getDay() === 6 // Saturday
      );
    };
    
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Business Days Only</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDates}
            className="rounded-md border"
            classNames={{
              day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
            }}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Weekends and past dates are disabled
          </p>
        </CardContent>
      </Card>
    );
  },
};

export const Accessibility: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support (Arrow keys, Enter, Escape)</li>
          <li>Focus management and visible focus indicators</li>
          <li>Screen reader announcements for date selection</li>
          <li>Semantic HTML structure</li>
        </ul>
      </div>
      
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Accessibility Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            className="rounded-md border"
            aria-label="Select a date for accessibility demonstration"
          />
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Keyboard Shortcuts:</p>
        <ul className="list-disc list-inside mt-1">
          <li>↑/↓/←/→ - Navigate dates</li>
          <li>Enter - Select date</li>
          <li>Escape - Close calendar</li>
          <li>Page Up/Down - Change months</li>
          <li>Home/End - Go to start/end of month</li>
        </ul>
      </div>
    </div>
  ),
};

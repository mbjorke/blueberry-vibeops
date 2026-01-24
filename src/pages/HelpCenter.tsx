import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle,
  BookOpen,
  FileText,
  Lock,
  Bell,
  BarChart3,
  Upload,
  Users,
  Settings
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
}

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I view my project security reports?',
    answer: 'Navigate to your project from the portal dashboard, then click on the "Security" tab. You\'ll see a comprehensive security scan report showing any vulnerabilities, RLS policy issues, and recommended fixes.',
    category: 'Security',
  },
  {
    id: 'faq-2',
    question: 'What does the GDPR compliance checklist include?',
    answer: 'The GDPR checklist covers data protection requirements including: data encryption, user consent management, right to access, right to deletion, data portability, privacy policy compliance, and data breach notification procedures.',
    category: 'Compliance',
  },
  {
    id: 'faq-3',
    question: 'How do I change my notification preferences?',
    answer: 'Go to your Preferences page by clicking the settings icon in the header. You can toggle email notifications, security alerts, and deployment updates on or off based on your needs.',
    category: 'Account',
  },
  {
    id: 'faq-4',
    question: 'What do the project status colors mean?',
    answer: 'Green (Healthy) means all systems are running normally with no issues. Orange (Warning) indicates minor issues that need attention. Red (Critical) means there are urgent problems requiring immediate action.',
    category: 'Projects',
  },
  {
    id: 'faq-5',
    question: 'How often are security scans performed?',
    answer: 'Automated security scans run daily for all projects. You can also request manual scans through the project detail page. Scan results are updated in real-time as issues are detected or resolved.',
    category: 'Security',
  },
  {
    id: 'faq-6',
    question: 'Can I export my project data?',
    answer: 'Yes, you can export security reports, deployment history, and compliance checklists as PDF or CSV files from each project\'s detail page. Contact your administrator for full data exports.',
    category: 'Projects',
  },
  {
    id: 'faq-7',
    question: 'What happens when a deployment fails?',
    answer: 'Failed deployments are automatically rolled back to the last stable version. You\'ll receive a notification (if enabled) with details about what went wrong and suggested fixes.',
    category: 'Deployments',
  },
  {
    id: 'faq-8',
    question: 'How do I request access to additional projects?',
    answer: 'Contact your administrator to request access to additional projects. They can assign new projects to your account through the Admin Panel.',
    category: 'Account',
  },
  {
    id: 'faq-9',
    question: 'What security standards does VibeOps check for?',
    answer: 'VibeOps checks for OWASP Top 10 vulnerabilities, proper authentication implementation, Row Level Security (RLS) policies, API security, SSL/TLS configuration, and common misconfigurations.',
    category: 'Security',
  },
  {
    id: 'faq-10',
    question: 'How do I restart the onboarding tour?',
    answer: 'Go to Preferences and click the "Restart Tour" button at the bottom of the page. This will reset your onboarding progress and show the guided tour again.',
    category: 'Account',
  },
];

const docSections: DocSection[] = [
  {
    id: 'doc-security',
    title: 'Security Reports',
    description: 'Understanding your security scan results',
    icon: <Lock className="h-5 w-5" />,
    content: [
      'Security scans analyze your project for vulnerabilities and misconfigurations',
      'Each issue is categorized by severity: Critical, High, Medium, or Low',
      'Click on any issue to see detailed remediation steps',
      'Resolved issues are automatically tracked in your security history',
    ],
  },
  {
    id: 'doc-compliance',
    title: 'GDPR Compliance',
    description: 'Meeting data protection requirements',
    icon: <FileText className="h-5 w-5" />,
    content: [
      'The GDPR checklist tracks your compliance with EU data protection regulations',
      'Each item can be marked as complete, in progress, or not applicable',
      'Documentation links provide guidance for implementing each requirement',
      'Regular audits ensure ongoing compliance',
    ],
  },
  {
    id: 'doc-deployments',
    title: 'Deployment History',
    description: 'Tracking your release pipeline',
    icon: <Upload className="h-5 w-5" />,
    content: [
      'View all deployments across development, staging, and production environments',
      'Each deployment shows version, timestamp, and deployer information',
      'Failed deployments include error logs and rollback details',
      'Compare changes between any two deployments',
    ],
  },
  {
    id: 'doc-notifications',
    title: 'Notifications',
    description: 'Staying informed about your projects',
    icon: <Bell className="h-5 w-5" />,
    content: [
      'Email notifications keep you informed about important events',
      'Security alerts notify you of critical vulnerabilities',
      'Deployment updates inform you when new versions go live',
      'Customize your preferences to receive only relevant notifications',
    ],
  },
  {
    id: 'doc-analytics',
    title: 'Analytics & Metrics',
    description: 'Understanding your project health',
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      'Security scores aggregate all vulnerability findings into a single metric',
      'Trend charts show how your security posture changes over time',
      'Compare metrics across multiple projects in your portfolio',
      'Export analytics data for external reporting',
    ],
  },
  {
    id: 'doc-team',
    title: 'Team Management',
    description: 'Working with your organization',
    icon: <Users className="h-5 w-5" />,
    content: [
      'Administrators can invite new team members via email',
      'Project access is assigned on a per-user basis',
      'Role-based permissions control what actions users can perform',
      'Activity logs track all team member actions',
    ],
  },
];

const categories = ['All', ...new Set(faqItems.map(item => item.category))];

export default function HelpCenter() {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDocs = docSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout title="Help Center" subtitle="Find answers and learn how to use VibeOps">
      {/* Search Bar */}
      <div className="max-w-xl mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm">Try different keywords or browse all categories</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <span>{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-0 pt-2">
                          <Badge variant="secondary" className="mb-3">
                            {item.category}
                          </Badge>
                          <p className="text-muted-foreground">{item.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentation Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation
              </CardTitle>
              <CardDescription>
                Learn how to use VibeOps features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredDocs.map((section) => (
                <div
                  key={section.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      <ul className="mt-3 space-y-1">
                        {section.content.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {section.content.length > 2 && (
                          <li className="text-xs text-primary">
                            +{section.content.length - 2} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/preferences')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Preferences
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/repositories')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Repositories
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <HelpCircle className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h4 className="font-semibold mb-2">Need more help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find what you're looking for? Contact your administrator for assistance.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
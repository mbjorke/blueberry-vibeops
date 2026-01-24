import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Sparkles,
  Lock,
  FileCheck
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionLabel?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to VibeOps! 🎉",
    description: "We're excited to have you on board. This quick tour will help you get started with monitoring your projects' security and compliance status.",
    icon: <Sparkles className="h-12 w-12 text-primary" />,
  },
  {
    id: 2,
    title: "Your Project Dashboard",
    description: "View all your assigned projects at a glance. Each project card shows its health status, security score, and GDPR compliance status.",
    icon: <FolderOpen className="h-12 w-12 text-primary" />,
  },
  {
    id: 3,
    title: "Security Reports",
    description: "Dive deep into security findings for each project. See open issues, their severity, and track resolution progress.",
    icon: <Lock className="h-12 w-12 text-primary" />,
  },
  {
    id: 4,
    title: "Deployment History",
    description: "Track all deployments across DEV, STAGING, and PROD environments. Monitor success rates and identify any failed deployments.",
    icon: <BarChart3 className="h-12 w-12 text-primary" />,
  },
  {
    id: 5,
    title: "GDPR Compliance",
    description: "Review and track your GDPR compliance checklist. Ensure all requirements are met across data protection, consent, and user rights.",
    icon: <FileCheck className="h-12 w-12 text-primary" />,
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "You're ready to start monitoring your projects. Click below to explore your portal and see your assigned projects.",
    icon: <CheckCircle2 className="h-12 w-12 text-success" />,
    action: '/portal',
    actionLabel: "Go to Portal",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  initialStep?: number;
}

export function OnboardingTour({ onComplete, initialStep = 0 }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const { user } = useAuth();
  const navigate = useNavigate();

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  useEffect(() => {
    // Save current step to database
    if (user) {
      supabase
        .from('profiles')
        .update({ onboarding_step: currentStep })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Error saving onboarding step:', error);
        });
    }
  }, [currentStep, user]);

  const handleNext = async () => {
    if (isLastStep) {
      // Mark onboarding as complete
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true, onboarding_step: onboardingSteps.length })
          .eq('user_id', user.id);
      }
      onComplete();
      if (step.action) {
        navigate(step.action);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true, onboarding_step: onboardingSteps.length })
        .eq('user_id', user.id);
    }
    onComplete();
    navigate('/portal');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative animate-in fade-in zoom-in duration-300">
        {/* Skip button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <CardHeader className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-4">
            {step.icon}
          </div>
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {step.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-4 pt-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? (step.actionLabel || 'Finish') : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
import React from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Users, Puzzle, PieChart, Coins, Rocket } from "lucide-react";

interface ProgressTrackerProps {
  currentStep: 'idea' | 'audience' | 'businessModel' | 'competition' | 'revenue' | 'mvp';
  startupId: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep, startupId }) => {
  const steps = [
    { id: 'idea', name: 'Idea', icon: Lightbulb, href: `/startups/${startupId}/idea` },
    { id: 'audience', name: 'Audience', icon: Users, href: `/startups/${startupId}/audience` },
    { id: 'businessModel', name: 'Business Model', icon: Puzzle, href: `/startups/${startupId}/business-model` },
    { id: 'competition', name: 'Competition', icon: PieChart, href: `/startups/${startupId}/competition` },
    { id: 'revenue', name: 'Revenue', icon: Coins, href: `/startups/${startupId}/revenue` },
    { id: 'mvp', name: 'MVP', icon: Rocket, href: `/startups/${startupId}/mvp` },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="text-center">
                <a
                  href={step.href}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full",
                    isCompleted ? "bg-primary text-white" : isCurrent ? "border-2 border-primary bg-white text-primary" : "border-2 border-gray-300 bg-white"
                  )}
                >
                  <step.icon className={cn(
                    "h-5 w-5",
                    isCompleted ? "text-white" : isCurrent ? "text-primary" : "text-gray-400"
                  )} />
                  <span className={cn(
                    "absolute -bottom-6 text-xs font-medium",
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                  )}>
                    {step.name}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Step {
  key: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  steps, 
  currentStep, 
  className 
}) => {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className={cn("flex items-center justify-center space-x-4", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isCompleted 
                  ? "bg-green-500 border-green-500 text-white" 
                  : isCurrent 
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-400"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={cn(
                  "text-sm font-medium",
                  isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                )}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-16 h-0.5 mx-4",
                isCompleted ? "bg-green-500" : "bg-gray-300"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}; 
import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  step?: string;
  description?: string;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  step,
  description,
  className,
  showPercentage = true
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        {step && (
          <span className="text-sm font-medium text-gray-700">
            {step}
          </span>
        )}
        {showPercentage && (
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2">
          {description}
        </p>
      )}
    </div>
  );
}; 
import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600',
  secondary: 'bg-violet-600 hover:bg-violet-700 text-white border-violet-600',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  neutral: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600'
};

const buttonSizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
  lg: 'px-6 py-4 text-lg min-h-[52px] min-w-[52px]'
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled = false,
  loading = false,
  onClick,
  type = 'button'
}) => {
  return (
    <Button
      className={cn(
        'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        buttonVariants[variant],
        buttonSizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>처리 중...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}; 
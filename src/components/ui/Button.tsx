import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 shadow-sm hover:shadow-md",
    secondary: "bg-secondary text-gray-700 hover:bg-secondary-dark focus:ring-gray-500/50 border border-gray-300",
    outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary/50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500/50",
    gradient: "bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary focus:ring-primary/50 shadow-lg hover:shadow-xl"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };
  
  const iconClasses = icon ? "gap-2" : "";
  
  return (
    <button 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        iconClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
} 
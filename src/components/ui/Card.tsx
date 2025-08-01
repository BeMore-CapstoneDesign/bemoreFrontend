import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ 
  children, 
  variant = 'default', 
  hover = false,
  className, 
  ...props 
}: CardProps) {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white shadow-lg shadow-gray-200/50 border-0",
    outlined: "bg-white border-2 border-gray-200 shadow-none",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md"
  };
  
  const hoverClasses = hover ? "hover:shadow-xl hover:-translate-y-1 hover:border-primary/20" : "";
  
  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div 
      className={cn(
        "px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 
      className={cn(
        "text-lg font-semibold text-gray-900 flex items-center gap-2",
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div 
      className={cn(
        "px-6 py-4",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
} 
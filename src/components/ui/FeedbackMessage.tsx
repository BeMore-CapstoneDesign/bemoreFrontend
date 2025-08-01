import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

const feedbackStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
    action: 'text-green-600 hover:text-green-800'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
    action: 'text-red-600 hover:text-red-800'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    action: 'text-yellow-600 hover:text-yellow-800'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
    action: 'text-blue-600 hover:text-blue-800'
  }
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info
};

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  title,
  message,
  onClose,
  onAction,
  actionText,
  className
}) => {
  const styles = feedbackStyles[type];
  const Icon = icons[type];

  return (
    <div className={cn(
      'border rounded-lg p-4 relative',
      styles.container,
      className
    )}>
      <div className="flex items-start space-x-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', styles.icon)} />
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-medium', styles.title)}>
            {title}
          </h3>
          {message && (
            <p className={cn('mt-1 text-sm', styles.message)}>
              {message}
            </p>
          )}
          {onAction && actionText && (
            <button
              onClick={onAction}
              className={cn('mt-3 text-sm font-medium', styles.action)}
            >
              {actionText}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn('p-1 rounded-full hover:bg-black/5 transition-colors', styles.icon)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}; 
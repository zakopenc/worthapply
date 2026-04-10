'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './Toast.module.css';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={cn(styles.toast, styles[toast.type])} role="alert">
      <Icon size={20} strokeWidth={1.5} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.dismiss}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

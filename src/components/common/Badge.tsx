import React from 'react';
import { HealthStatus, IsoZone } from '../../types';

interface BadgeProps {
  status?: HealthStatus | 'info' | 'active' | 'acknowledged' | 'resolved';
  isoZone?: IsoZone;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  isoZone,
  text,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  let bgClass = 'bg-surface-container text-on-surface-variant';
  let dotClass = 'bg-outline';
  let pulse = false;
  let label = text || status?.toUpperCase() || '';

  if (isoZone) {
    label = isoZone;
    if (isoZone === 'Zone A') {
      bgClass = 'bg-tertiary-container/30 text-tertiary';
      dotClass = 'bg-tertiary';
    } else if (isoZone === 'Zone B') {
      bgClass = 'bg-primary-container/30 text-primary';
      dotClass = 'bg-primary';
    } else if (isoZone === 'Zone C') {
      bgClass = 'bg-secondary-container/20 text-secondary';
      dotClass = 'bg-secondary';
    } else if (isoZone === 'Zone D') {
      bgClass = 'bg-error-container/40 text-error';
      dotClass = 'bg-error';
      pulse = true;
    }
  } else if (status) {
    switch (status) {
      case 'healthy':
        bgClass = 'bg-tertiary-container/20 text-tertiary';
        dotClass = 'bg-tertiary';
        label = label || 'HEALTHY';
        break;
      case 'warning':
        bgClass = 'bg-secondary-container/20 text-secondary';
        dotClass = 'bg-secondary';
        label = label || 'WARNING';
        break;
      case 'critical':
        bgClass = 'bg-error-container/30 text-error';
        dotClass = 'bg-error';
        pulse = true;
        label = label || 'CRITICAL';
        break;
      case 'disconnected':
        bgClass = 'bg-surface-container-highest text-on-surface-variant';
        dotClass = 'bg-outline';
        label = label || 'DISCONNECTED';
        break;
      case 'calibrating':
        bgClass = 'bg-primary-container/20 text-primary';
        dotClass = 'bg-primary';
        pulse = true;
        label = label || 'CALIBRATING';
        break;
      case 'active':
        bgClass = 'bg-error-container/30 text-error';
        dotClass = 'bg-error';
        pulse = true;
        label = label || 'ACTIVE';
        break;
      case 'acknowledged':
        bgClass = 'bg-secondary-container/20 text-secondary';
        dotClass = 'bg-secondary';
        label = label || 'ACKNOWLEDGED';
        break;
      case 'resolved':
        bgClass = 'bg-tertiary-container/20 text-tertiary';
        dotClass = 'bg-tertiary';
        label = label || 'RESOLVED';
        break;
      case 'info':
        bgClass = 'bg-primary-container/20 text-primary';
        dotClass = 'bg-primary';
        label = label || 'INFO';
        break;
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-label-sm tracking-wide',
    md: 'px-2.5 py-1 text-label-sm font-label-sm tracking-wider',
    lg: 'px-3.5 py-1.5 text-label-md font-label-md tracking-wider',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded uppercase font-medium select-none ${sizeClasses[size]} ${bgClass} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      <span>{label}</span>
    </div>
  );
};


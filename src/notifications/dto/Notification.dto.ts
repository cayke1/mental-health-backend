export interface NotificationPayload {
  userId: string;
  message: string;
  icon?: string;
  url: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
  id: string;
}


export const DEFAULT_ICONS = {
  info: 'Info',
  success: 'CheckCircle',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
} as const;

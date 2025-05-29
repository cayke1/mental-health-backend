export interface NotificationPayload {
    userId: string;
    message: string;
    icon?: LucideIconName;
    type?: 'info' | 'success' | 'error' | 'warning';
    timestamp?: Date;
  }
  
  type LucideIconName = string;
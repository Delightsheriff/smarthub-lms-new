export interface NotificationPrefs {
  push?: boolean;
  whatsapp?: boolean;
  email?: boolean;
}

export interface PushConfig {
  vapidPublicKey?: string;
  enabled?: boolean;
}

export interface PushSubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

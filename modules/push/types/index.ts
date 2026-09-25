export interface NotificationPrefs {
  push?: boolean;
  whatsapp?: boolean;
  email?: boolean;
}

export interface PushConfig {
  enabled: boolean;
  publicKey?: string | null;
  vapidPublicKey?: string;
}

export interface PushSubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  surface?: "lms" | "admin";
}

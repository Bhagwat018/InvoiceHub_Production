import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  schedule?: NotificationSchedule;
}

export interface NotificationSchedule {
  date: Date;
  repeating?: 'daily' | 'weekly' | 'monthly';
}

class NotificationServiceClass {
  private isInitialized = false;
  private permissionGranted = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // In production: use @notifee/react-native
      // import notifee, { AndroidImportance } from '@notifee/react-native';
      // await notifee.requestPermission();
      // await notifee.createChannel({ id: 'default', name: 'Default', importance: AndroidImportance.HIGH });

      this.isInitialized = true;
      this.permissionGranted = true;
      console.log('[NotificationService] Initialized');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      // In production: await notifee.requestPermission();
      this.permissionGranted = true;
      return true;
    } catch {
      this.permissionGranted = false;
      return false;
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      // In production:
      // await notifee.displayNotification({
      //   title: payload.title,
      //   body: payload.body,
      //   data: payload.data,
      //   android: { channelId: 'default' },
      //   ios: { sound: 'default' },
      // });

      console.log('[Notification] Sent:', payload.title);
    } catch (error) {
      console.error('[Notification] Failed to send:', error);
    }
  }

  async scheduleNotification(payload: NotificationPayload, schedule: NotificationSchedule): Promise<string> {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return '';
    }

    try {
      const notificationId = `notif_${Date.now()}`;

      // In production:
      // await notifee.createTriggerNotification(
      //   { id: notificationId, title: payload.title, body: payload.body },
      //   { type: TriggerType.TIMESTAMP, timestamp: schedule.date.getTime() }
      // );

      this.saveScheduledNotification(notificationId, payload, schedule);
      return notificationId;
    } catch (error) {
      console.error('[Notification] Failed to schedule:', error);
      return '';
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // In production: await notifee.cancelNotification(notificationId);
      this.removeScheduledNotification(notificationId);
    } catch (error) {
      console.error('[Notification] Failed to cancel:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      // In production: await notifee.cancelAllNotifications();
      mmkv.delete('scheduled_notifications');
    } catch (error) {
      console.error('[Notification] Failed to cancel all:', error);
    }
  }

  async getScheduledNotifications(): Promise<NotificationPayload[]> {
    try {
      const data = mmkv.getString('scheduled_notifications');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveScheduledNotification(
    id: string,
    payload: NotificationPayload,
    schedule: NotificationSchedule,
  ): void {
    try {
      const existing = this.getScheduledNotificationsSync();
      existing.push({ ...payload, id, schedule } as any);
      mmkv.set('scheduled_notifications', JSON.stringify(existing));
    } catch {}
  }

  private removeScheduledNotification(id: string): void {
    try {
      const existing = this.getScheduledNotificationsSync();
      const filtered = existing.filter((n: any) => n.id !== id);
      mmkv.set('scheduled_notifications', JSON.stringify(filtered));
    } catch {}
  }

  private getScheduledNotificationsSync(): any[] {
    try {
      const data = mmkv.getString('scheduled_notifications');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async createNotificationChannel(
    id: string,
    name: string,
    importance: 'low' | 'default' | 'high' = 'default',
  ): Promise<void> {
    try {
      // In production: await notifee.createChannel({ id, name, importance: AndroidImportance[importance.toUpperCase()] });
    } catch {}
  }

  onNotificationOpened(callback: (data: Record<string, unknown>) => void): void {
    // In production: notifee.onNotificationOpened(callback);
  }
}

export const NotificationService = new NotificationServiceClass();

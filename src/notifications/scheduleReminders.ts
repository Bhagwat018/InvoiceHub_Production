import { NotificationService } from './NotificationService';
import { useSettingsStore } from '../storage/stores/settingsStore';
import { mmkvStorage } from '../storage/MmkvStorage';

export interface InvoiceReminder {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  dueDate: string;
  amount: number;
  reminderDaysBefore: number;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

class ScheduleRemindersClass {
  private readonly INVOICE_REMINDER_CHANNEL = 'invoice-reminders';
  private readonly PAYMENT_REMINDER_CHANNEL = 'payment-reminders';
  private readonly STOCK_ALERT_CHANNEL = 'stock-alerts';
  private readonly BACKUP_REMINDER_CHANNEL = 'backup-reminders';

  async initialize(): Promise<void> {
    await NotificationService.initialize();
    await NotificationService.createNotificationChannel(
      this.INVOICE_REMINDER_CHANNEL,
      'Invoice Reminders',
      'high',
    );
    await NotificationService.createNotificationChannel(
      this.PAYMENT_REMINDER_CHANNEL,
      'Payment Reminders',
      'high',
    );
    await NotificationService.createNotificationChannel(
      this.STOCK_ALERT_CHANNEL,
      'Stock Alerts',
      'default',
    );
    await NotificationService.createNotificationChannel(
      this.BACKUP_REMINDER_CHANNEL,
      'Backup Reminders',
      'low',
    );
  }

  async scheduleInvoiceDueReminder(reminder: InvoiceReminder): Promise<void> {
    const settings = useSettingsStore.getState();
    if (!settings.notifications.invoiceReminders) return;

    const dueDate = new Date(reminder.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - reminder.reminderDaysBefore);
    reminderDate.setHours(9, 0, 0, 0);

    if (reminderDate <= new Date()) {
      // Due date is imminent or past, send immediately
      await this.sendInvoiceDueNotification(reminder);
      return;
    }

    await NotificationService.scheduleNotification(
      {
        id: `invoice_reminder_${reminder.invoiceId}`,
        title: 'Invoice Due Soon',
        body: `Invoice ${reminder.invoiceNumber} for ${reminder.customerName} (₹${reminder.amount.toLocaleString('en-IN')}) is due on ${dueDate.toLocaleDateString('en-IN')}`,
        data: { invoiceId: reminder.invoiceId },
      },
      { date: reminderDate },
    );
  }

  async schedulePaymentReminder(reminder: InvoiceReminder): Promise<void> {
    const settings = useSettingsStore.getState();
    if (!settings.notifications.paymentReminders) return;

    const dueDate = new Date(reminder.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() + 1);
    reminderDate.setHours(10, 0, 0, 0);

    await NotificationService.scheduleNotification(
      {
        id: `payment_reminder_${reminder.invoiceId}`,
        title: 'Payment Overdue',
        body: `Payment for invoice ${reminder.invoiceNumber} from ${reminder.customerName} is overdue. Amount: ₹${reminder.amount.toLocaleString('en-IN')}`,
        data: { invoiceId: reminder.invoiceId },
      },
      { date: reminderDate },
    );
  }

  async sendInvoiceDueNotification(reminder: InvoiceReminder): Promise<void> {
    await NotificationService.sendLocalNotification({
      id: `invoice_due_${reminder.invoiceId}`,
      title: 'Invoice Due Today',
      body: `Invoice ${reminder.invoiceNumber} for ${reminder.customerName} is due today. Amount: ₹${reminder.amount.toLocaleString('en-IN')}`,
      data: { invoiceId: reminder.invoiceId },
    });
  }

  async scheduleStockAlert(alert: StockAlert): Promise<void> {
    const settings = useSettingsStore.getState();
    if (!settings.notifications.overdueAlerts) return;

    await NotificationService.sendLocalNotification({
      id: `stock_alert_${alert.productId}`,
      title: 'Low Stock Alert',
      body: `${alert.productName} is running low. Current stock: ${alert.currentStock} (threshold: ${alert.threshold})`,
      data: { productId: alert.productId },
    });
  }

  async scheduleBackupReminder(): Promise<void> {
    const settings = useSettingsStore.getState();
    if (!settings.notifications.backupReminders) return;

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7);
    reminderDate.setHours(11, 0, 0, 0);

    const lastBackup = mmkvStorage.getString('last_backup_date');
    if (lastBackup) {
      const lastDate = new Date(lastBackup);
      const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) return;
    }

    await NotificationService.scheduleNotification(
      {
        id: 'backup_reminder',
        title: 'Backup Reminder',
        body: 'It\'s been a while since your last backup. Consider backing up your data to keep it safe.',
      },
      { date: reminderDate, repeating: 'weekly' },
    );
  }

  async cancelInvoiceReminders(invoiceId: string): Promise<void> {
    await NotificationService.cancelNotification(`invoice_reminder_${invoiceId}`);
    await NotificationService.cancelNotification(`payment_reminder_${invoiceId}`);
  }

  async cancelAllReminders(): Promise<void> {
    await NotificationService.cancelAllNotifications();
  }

  async onNotificationReceived(invoiceId: string): Promise<void> {
    await this.cancelInvoiceReminders(invoiceId);
  }
}

export const scheduleReminders = new ScheduleRemindersClass();

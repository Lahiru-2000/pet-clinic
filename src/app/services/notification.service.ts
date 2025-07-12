import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppointmentNotification } from '../models/appointment-notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppointmentNotification[]>([]);
  private dismissedNotificationsKey = 'dismissedNotifications';

  constructor() {}

  // Get notifications as observable
  getNotifications(): Observable<AppointmentNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  // Set notifications
  setNotifications(notifications: AppointmentNotification[]) {
    const dismissedIds = this.getDismissedNotificationIds();
    const filteredNotifications = notifications.filter(notification => 
      !dismissedIds.includes(this.generateNotificationId(notification))
    );
    this.notificationsSubject.next(filteredNotifications);
  }

  // Add a single notification
  addNotification(notification: AppointmentNotification) {
    const currentNotifications = this.notificationsSubject.value;
    const notificationId = this.generateNotificationId(notification);
    
    // Check if notification is already dismissed
    const dismissedIds = this.getDismissedNotificationIds();
    if (dismissedIds.includes(notificationId)) {
      return;
    }

    // Check if notification already exists
    const exists = currentNotifications.some(n => 
      this.generateNotificationId(n) === notificationId
    );

    if (!exists) {
      this.notificationsSubject.next([...currentNotifications, notification]);
    }
  }

  // Dismiss a notification
  dismissNotification(index: number) {
    const currentNotifications = this.notificationsSubject.value;
    if (index >= 0 && index < currentNotifications.length) {
      const notification = currentNotifications[index];
      const notificationId = this.generateNotificationId(notification);
      
      // Add to dismissed list
      this.addToDismissedList(notificationId);
      
      // Remove from current notifications
      const updatedNotifications = currentNotifications.filter((_, i) => i !== index);
      this.notificationsSubject.next(updatedNotifications);
    }
  }

  // Get current notification count
  getNotificationCount(): number {
    return this.notificationsSubject.value.length;
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notificationsSubject.next([]);
  }

  // Generate a unique ID for a notification
  private generateNotificationId(notification: AppointmentNotification): string {
    return btoa(notification.message + notification.date + notification.type);
  }

  // Get dismissed notification IDs from localStorage
  private getDismissedNotificationIds(): string[] {
    if (typeof window !== 'undefined' && localStorage) {
      const dismissed = localStorage.getItem(this.dismissedNotificationsKey);
      return dismissed ? JSON.parse(dismissed) : [];
    }
    return [];
  }

  // Add notification ID to dismissed list
  private addToDismissedList(notificationId: string) {
    if (typeof window !== 'undefined' && localStorage) {
      const dismissed = this.getDismissedNotificationIds();
      if (!dismissed.includes(notificationId)) {
        dismissed.push(notificationId);
        localStorage.setItem(this.dismissedNotificationsKey, JSON.stringify(dismissed));
      }
    }
  }

  // Clear dismissed notifications (useful for testing)
  clearDismissedNotifications() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem(this.dismissedNotificationsKey);
    }
  }
} 
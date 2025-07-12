export interface AppointmentNotification {
  message: string;
  type: 'reminder' | 'alert' | 'info';
  date: string;
}

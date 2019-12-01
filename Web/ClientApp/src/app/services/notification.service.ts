import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, flatMap, startWith } from 'rxjs/operators';

import { AuthEndpointService } from './endpoint.services';
import { NotificationMockService } from './notification-mock.service';
import { NotificationModel } from '../models/notification.model';

@Injectable()
export class NotificationService {

  private lastNotificationDate: Date;
  private _recentNotifications: NotificationModel[];

  get currentUser() {
    return this.authEndpointService.currentUser;
  }

  get recentNotifications() {
    return this._recentNotifications;
  }

  set recentNotifications(notifications: NotificationModel[]) {
    this._recentNotifications = notifications;
  }



  constructor(private notificationMockService: NotificationMockService, private authEndpointService: AuthEndpointService) {

  }


  getNotification(notificationId?: number) {

    return this.notificationMockService.getNotificationEndpoint(notificationId).pipe(
      map(response => NotificationModel.Create(response)));
  }


  getNotifications(page: number, pageSize: number) {

    return this.notificationMockService.getNotificationsEndpoint(page, pageSize).pipe(
      map(response => {
        return this.getNotificationsFromResponse(response);
      }));
  }


  getUnreadNotifications(userId?: string) {

    return this.notificationMockService.getUnreadNotificationsEndpoint(userId).pipe(
      map(response => this.getNotificationsFromResponse(response)));
  }


  getNewNotifications() {
    return this.notificationMockService.getNewNotificationsEndpoint(this.lastNotificationDate).pipe(
      map(response => this.processNewNotificationsFromResponse(response)));
  }


  getNewNotificationsPeriodically() {
    return interval(10000).pipe(
      startWith(0),
      flatMap(() => {
        return this.notificationMockService.getNewNotificationsEndpoint(this.lastNotificationDate).pipe(
          map(response => this.processNewNotificationsFromResponse(response)));
      }));
  }




  pinUnpinNotification(notificationOrNotificationId: number | NotificationModel, isPinned?: boolean): Observable<any> {

    if (typeof notificationOrNotificationId === 'number' || notificationOrNotificationId instanceof Number) {
      return this.notificationMockService.getPinUnpinNotificationEndpoint(notificationOrNotificationId as number, isPinned);
    } else {
      return this.pinUnpinNotification(notificationOrNotificationId.id);
    }
  }


  readUnreadNotification(notificationIds: number[], isRead: boolean): Observable<any> {

    return this.notificationMockService.getReadUnreadNotificationEndpoint(notificationIds, isRead);
  }




  deleteNotification(notificationOrNotificationId: number | NotificationModel): Observable<NotificationModel> {

    if (typeof notificationOrNotificationId === 'number' || notificationOrNotificationId instanceof Number) { // Todo: Test me if its check is valid
      return this.notificationMockService.getDeleteNotificationEndpoint(notificationOrNotificationId as number).pipe(
        map(response => {
          this.recentNotifications = this.recentNotifications.filter(n => n.id != notificationOrNotificationId);
          return NotificationModel.Create(response);
        }));
    } else {
      return this.deleteNotification(notificationOrNotificationId.id);
    }
  }




  private processNewNotificationsFromResponse(response) {
    const notifications = this.getNotificationsFromResponse(response);

    for (const n of notifications) {
      if (n.date > this.lastNotificationDate) {
        this.lastNotificationDate = n.date;
      }
    }

    return notifications;
  }


  private getNotificationsFromResponse(response) {
    const notifications: NotificationModel[] = [];

    for (const i in response) {
      notifications[i] = NotificationModel.Create(response[i]);
    }

    notifications.sort((a, b) => b.date.valueOf() - a.date.valueOf());
    notifications.sort((a, b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1);

    this.recentNotifications = notifications;

    return notifications;
  }
}

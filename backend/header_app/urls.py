from django.urls import path
from .views import (
    MessageListView, SendMessageView, MarkMessageAsReadView,
    NotificationListView, MarkNotificationAsReadView, UserProfileView
)

urlpatterns = [
    # Messages
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/send/', SendMessageView.as_view(), name='send-message'),
    path('messages/mark-read/', MarkMessageAsReadView.as_view(), name='mark-message-read'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', MarkNotificationAsReadView.as_view(), name='mark-notification-read'),

    # User Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]

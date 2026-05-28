from .models import Notification


def create_notification(recipient, sender, notification_type, title, content, related_type=None, related_id=None):
    if recipient == sender:
        return None
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        content=content,
        related_type=related_type,
        related_id=related_id,
    )

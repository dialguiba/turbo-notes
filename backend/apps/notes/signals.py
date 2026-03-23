from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.notes.models import DEFAULT_CATEGORIES, Category


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        Category.objects.bulk_create(
            [
                Category(user=instance, name=name, color=color)
                for name, color in DEFAULT_CATEGORIES
            ]
        )

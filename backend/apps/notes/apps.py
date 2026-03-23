from django.apps import AppConfig


class NotesConfig(AppConfig):
    name = "apps.notes"

    def ready(self):
        import apps.notes.signals  # noqa: F401

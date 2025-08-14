from django.db import models
from django.contrib.auth.models import User

class ContextEntry(models.Model):
    SOURCE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('notes', 'Notes'),
        ('calendar', 'Calendar'),
        ('manual', 'Manual Entry'),
    ]
    
    content = models.TextField()
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    insights = models.JSONField(default=dict, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    urgency_indicators = models.JSONField(default=list, blank=True)
    related_tasks = models.ManyToManyField('tasks.Task', blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.source_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    working_hours_start = models.TimeField(default='09:00')
    working_hours_end = models.TimeField(default='17:00')
    preferred_task_duration = models.IntegerField(default=60)  # minutes
    notification_preferences = models.JSONField(default=dict)
    ai_suggestions_enabled = models.BooleanField(default=True)
    auto_categorization = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

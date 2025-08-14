from rest_framework import serializers
from .models import ContextEntry, UserPreference

class ContextEntrySerializer(serializers.ModelSerializer):
    processed_insights = serializers.SerializerMethodField()
    
    class Meta:
        model = ContextEntry
        fields = [
            'id', 'content', 'source_type', 'timestamp', 'processed',
            'insights', 'sentiment_score', 'keywords', 'urgency_indicators',
            'processed_insights'
        ]
    
    def get_processed_insights(self, obj):
        if obj.processed and obj.insights:
            return {
                'task_suggestions': obj.insights.get('task_suggestions', []),
                'priority_keywords': obj.keywords[:5],
                'urgency_level': 'high' if len(obj.urgency_indicators) > 2 else 'medium' if len(obj.urgency_indicators) > 0 else 'low'
            }
        return {}

class ContextEntryCreateSerializer(serializers.ModelSerializer):
    process_with_ai = serializers.BooleanField(default=True, write_only=True)
    
    class Meta:
        model = ContextEntry
        fields = ['content', 'source_type', 'process_with_ai']
    
    def create(self, validated_data):
        process_with_ai = validated_data.pop('process_with_ai', True)
        context_entry = ContextEntry.objects.create(**validated_data)
        
        if process_with_ai:
            from ai_module.services import ai_service
            
            # Process context with AI
            insights = ai_service.analyze_context([context_entry])
            
            context_entry.insights = insights
            context_entry.sentiment_score = insights.get('sentiment', 0)
            context_entry.keywords = insights.get('keywords', [])
            context_entry.urgency_indicators = insights.get('urgency_indicators', [])
            context_entry.processed = True
            context_entry.save()
        
        return context_entry

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        exclude = ['user']

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import ContextEntry, UserPreference
from .serializers import ContextEntrySerializer, ContextEntryCreateSerializer, UserPreferenceSerializer
from ai_module.services import ai_service

class ContextEntryViewSet(viewsets.ModelViewSet):
    queryset = ContextEntry.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContextEntryCreateSerializer
        return ContextEntrySerializer
    
    def get_queryset(self):
        queryset = ContextEntry.objects.all()
        
        # Filter by date range
        days = self.request.query_params.get('days', 7)
        start_date = timezone.now() - timedelta(days=int(days))
        queryset = queryset.filter(timestamp__gte=start_date)
        
        # Filter by source type
        source_type = self.request.query_params.get('source_type')
        if source_type:
            queryset = queryset.filter(source_type=source_type)
        
        # Filter by processed status
        processed = self.request.query_params.get('processed')
        if processed is not None:
            queryset = queryset.filter(processed=processed.lower() == 'true')
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Get daily context summary"""
        today = timezone.now().date()
        
        today_entries = ContextEntry.objects.filter(
            timestamp__date=today,
            processed=True
        )
        
        if not today_entries:
            return Response({
                'date': today,
                'summary': 'No context data available for today',
                'insights': {}
            })
        
        # Analyze today's context
        insights = ai_service.analyze_context(today_entries)
        
        return Response({
            'date': today,
            'entry_count': today_entries.count(),
            'insights': insights,
            'top_keywords': insights.get('keywords', [])[:10],
            'urgency_indicators': insights.get('urgency_indicators', []),
            'sentiment_score': insights.get('sentiment', 0),
            'task_suggestions': insights.get('task_suggestions', [])
        })
    
    @action(detail=False, methods=['post'])
    def bulk_process(self, request):
        """Process multiple context entries with AI"""
        unprocessed_entries = ContextEntry.objects.filter(processed=False)
        
        processed_count = 0
        for entry in unprocessed_entries:
            try:
                insights = ai_service.analyze_context([entry])
                entry.insights = insights
                entry.sentiment_score = insights.get('sentiment', 0)
                entry.keywords = insights.get('keywords', [])
                entry.urgency_indicators = insights.get('urgency_indicators', [])
                entry.processed = True
                entry.save()
                processed_count += 1
            except Exception as e:
                print(f"Error processing entry {entry.id}: {e}")
        
        return Response({
            'message': f'Processed {processed_count} context entries',
            'processed_count': processed_count
        })
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get context analytics"""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        entries = ContextEntry.objects.filter(
            timestamp__gte=start_date,
            processed=True
        )
        
        # Source type distribution
        source_distribution = {}
        for source_type, _ in ContextEntry.SOURCE_CHOICES:
            count = entries.filter(source_type=source_type).count()
            source_distribution[source_type] = count
        
        # Sentiment analysis
        sentiment_entries = entries.exclude(sentiment_score__isnull=True)
        avg_sentiment = 0
        if sentiment_entries:
            avg_sentiment = sum(e.sentiment_score for e in sentiment_entries) / len(sentiment_entries)
        
        # Most common keywords
        all_keywords = []
        for entry in entries:
            all_keywords.extend(entry.keywords)
        
        from collections import Counter
        keyword_counts = Counter(all_keywords)
        top_keywords = keyword_counts.most_common(20)
        
        # Urgency trends
        urgency_counts = Counter()
        for entry in entries:
            urgency_counts[len(entry.urgency_indicators)] += 1
        
        return Response({
            'period_days': days,
            'total_entries': entries.count(),
            'source_distribution': source_distribution,
            'average_sentiment': round(avg_sentiment, 3),
            'top_keywords': top_keywords,
            'urgency_distribution': dict(urgency_counts),
            'most_active_days': self._get_most_active_days(entries)
        })
    
    def _get_most_active_days(self, entries):
        """Get most active days by entry count"""
        from collections import defaultdict
        day_counts = defaultdict(int)
        
        for entry in entries:
            day = entry.timestamp.strftime('%A')
            day_counts[day] += 1
        
        return dict(sorted(day_counts.items(), key=lambda x: x[1], reverse=True))

class UserPreferenceViewSet(viewsets.ModelViewSet):
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer
    
    def get_queryset(self):
        # In a real app, filter by current user
        return UserPreference.objects.all()

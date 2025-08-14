from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import ai_service
from context.models import ContextEntry
from tasks.models import Task

class AITaskSuggestionsView(APIView):
    def post(self, request):
        """Get AI-powered task suggestions based on context"""
        context_data = request.data.get('context', '')
        user_preferences = request.data.get('preferences', {})
        
        try:
            # Create temporary context entry for analysis
            temp_context = type('obj', (object,), {'content': context_data})()
            insights = ai_service.analyze_context([temp_context])
            
            # Generate task suggestions
            task_suggestions = insights.get('task_suggestions', [])
            
            # Enhanced suggestions with AI
            enhanced_suggestions = []
            for suggestion in task_suggestions[:5]:  # Limit to top 5
                enhanced_suggestion = {
                    'title': suggestion,
                    'suggested_category': ai_service.suggest_categories(suggestion, '')[0] if ai_service.suggest_categories(suggestion, '') else 'general',
                    'estimated_priority': 'medium',
                    'suggested_deadline': ai_service.suggest_deadline(suggestion, '', insights).isoformat(),
                    'complexity_score': ai_service._assess_task_complexity(suggestion, '')
                }
                enhanced_suggestions.append(enhanced_suggestion)
            
            return Response({
                'suggestions': enhanced_suggestions,
                'context_insights': {
                    'keywords': insights.get('keywords', [])[:10],
                    'sentiment': insights.get('sentiment', 0),
                    'urgency_indicators': insights.get('urgency_indicators', [])
                }
            })
        
        except Exception as e:
            return Response(
                {'error': f'Failed to generate suggestions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AITaskAnalysisView(APIView):
    def post(self, request):
        """Analyze existing tasks and provide AI insights"""
        task_ids = request.data.get('task_ids', [])
        
        try:
            tasks = Task.objects.filter(id__in=task_ids)
            
            # Get recent context for analysis
            recent_context = ContextEntry.objects.filter(processed=True).order_by('-timestamp')[:10]
            context_data = None
            if recent_context:
                context_data = ai_service.analyze_context(recent_context)
            
            # Analyze tasks
            analysis_results = []
            priority_scores = ai_service.prioritize_tasks(tasks, context_data)
            
            for task in tasks:
                analysis = {
                    'task_id': task.id,
                    'title': task.title,
                    'current_priority': task.priority,
                    'ai_priority_score': priority_scores.get(task.id, 0.5),
                    'suggested_categories': ai_service.suggest_categories(task.title, task.description),
                    'complexity_assessment': ai_service._assess_task_complexity(task.title, task.description),
                    'deadline_suggestion': ai_service.suggest_deadline(task.title, task.description, context_data).isoformat() if not task.deadline else None,
                    'enhancement_available': len(task.ai_enhanced_description or '') == 0
                }
                analysis_results.append(analysis)
            
            return Response({
                'task_analysis': analysis_results,
                'recommendations': {
                    'high_priority_tasks': [a for a in analysis_results if a['ai_priority_score'] > 0.7],
                    'tasks_needing_deadlines': [a for a in analysis_results if a['deadline_suggestion']],
                    'complex_tasks': [a for a in analysis_results if a['complexity_assessment'] > 0.7]
                }
            })
        
        except Exception as e:
            return Response(
                {'error': f'Failed to analyze tasks: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AIContextAnalysisView(APIView):
    def post(self, request):
        """Analyze context entries and extract insights"""
        days = request.data.get('days', 7)
        source_types = request.data.get('source_types', [])
        
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            # Get context entries
            start_date = timezone.now() - timedelta(days=days)
            entries = ContextEntry.objects.filter(timestamp__gte=start_date)
            
            if source_types:
                entries = entries.filter(source_type__in=source_types)
            
            # Analyze context
            insights = ai_service.analyze_context(entries)
            
            # Generate comprehensive analysis
            analysis = {
                'period_summary': {
                    'days_analyzed': days,
                    'total_entries': entries.count(),
                    'average_sentiment': insights.get('sentiment', 0),
                    'dominant_themes': insights.get('keywords', [])[:5]
                },
                'task_opportunities': {
                    'suggested_tasks': insights.get('task_suggestions', []),
                    'urgent_items': insights.get('urgency_indicators', []),
                    'scheduling_hints': insights.get('time_indicators', [])
                },
                'productivity_insights': {
                    'stress_indicators': len([k for k in insights.get('keywords', []) if k in ['urgent', 'deadline', 'stress', 'busy']]),
                    'collaboration_mentions': len([k for k in insights.get('keywords', []) if k in ['meeting', 'team', 'discuss', 'call']]),
                    'learning_opportunities': len([k for k in insights.get('keywords', []) if k in ['learn', 'study', 'research', 'skill']])
                },
                'recommendations': []
            }
            
            # Generate recommendations based on analysis
            if analysis['productivity_insights']['stress_indicators'] > 3:
                analysis['recommendations'].append({
                    'type': 'wellness',
                    'message': 'High stress indicators detected. Consider scheduling breaks or wellness activities.',
                    'priority': 'high'
                })
            
            if len(insights.get('task_suggestions', [])) > 5:
                analysis['recommendations'].append({
                    'type': 'productivity',
                    'message': 'Multiple task opportunities identified. Consider creating a prioritized action plan.',
                    'priority': 'medium'
                })
            
            return Response(analysis)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to analyze context: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

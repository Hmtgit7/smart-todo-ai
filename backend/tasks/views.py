from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from .models import Task, Category, TaskDependency
from .serializers import TaskSerializer, TaskCreateSerializer, CategorySerializer, TaskDependencySerializer
from context.models import ContextEntry
from ai_module.services import ai_service

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        queryset = Category.objects.annotate(task_count=Count('task'))
        return queryset.order_by('-usage_frequency', 'name')
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular categories"""
        popular_categories = Category.objects.order_by('-usage_frequency')[:10]
        serializer = self.get_serializer(popular_categories, many=True)
        return Response(serializer.data)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.select_related('category').prefetch_related('dependencies')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        # Filter by category
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Sort by priority score by default
        return queryset.order_by('-priority_score', '-created_at')
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='completed').count()
        pending_tasks = Task.objects.filter(status='pending').count()
        overdue_tasks = Task.objects.filter(
            deadline__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).count()
        
        # Tasks by priority
        priority_stats = {}
        for priority, _ in Task.PRIORITY_CHOICES:
            priority_stats[priority] = Task.objects.filter(priority=priority).count()
        
        # Tasks by category
        category_stats = []
        categories = Category.objects.annotate(task_count=Count('task'))
        for category in categories:
            category_stats.append({
                'name': category.name,
                'count': category.task_count,
                'color': category.color
            })
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'overdue_tasks': overdue_tasks,
            'completion_rate': round((completed_tasks / total_tasks) * 100, 1) if total_tasks > 0 else 0,
            'priority_distribution': priority_stats,
            'category_distribution': category_stats
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming tasks (next 7 days)"""
        upcoming_tasks = Task.objects.filter(
            deadline__gte=timezone.now(),
            deadline__lte=timezone.now() + timezone.timedelta(days=7),
            status__in=['pending', 'in_progress']
        ).order_by('deadline')
        
        serializer = self.get_serializer(upcoming_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks"""
        overdue_tasks = Task.objects.filter(
            deadline__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).order_by('deadline')
        
        serializer = self.get_serializer(overdue_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_prioritize(self, request):
        """Bulk prioritize tasks using AI"""
        task_ids = request.data.get('task_ids', [])
        context_entries = ContextEntry.objects.filter(processed=True).order_by('-timestamp')[:10]
        
        # Get context data
        context_data = None
        if context_entries:
            context_data = ai_service.analyze_context(context_entries)
        
        # Get tasks and prioritize
        tasks = Task.objects.filter(id__in=task_ids)
        priority_scores = ai_service.prioritize_tasks(tasks, context_data)
        
        # Update priority scores
        updated_tasks = []
        for task in tasks:
            if task.id in priority_scores:
                task.priority_score = priority_scores[task.id]
                task.save()
                updated_tasks.append(task)
        
        serializer = self.get_serializer(updated_tasks, many=True)
        return Response({
            'message': f'Updated priority scores for {len(updated_tasks)} tasks',
            'tasks': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def enhance_description(self, request, pk=None):
        """Enhance task description with AI"""
        task = self.get_object()
        
        # Get recent context
        context_entries = ContextEntry.objects.filter(processed=True).order_by('-timestamp')[:5]
        context_data = None
        if context_entries:
            context_data = ai_service.analyze_context(context_entries)
        
        # Enhance description
        enhanced_description = ai_service.enhance_task_description(
            task.title, task.description, context_data
        )
        
        task.ai_enhanced_description = enhanced_description
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)

class TaskDependencyViewSet(viewsets.ModelViewSet):
    queryset = TaskDependency.objects.all()
    serializer_class = TaskDependencySerializer
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return TaskDependency.objects.filter(task_id=task_id)
        return TaskDependency.objects.all()

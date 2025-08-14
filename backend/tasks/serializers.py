from rest_framework import serializers
from .models import Task, Category, TaskDependency
from context.models import ContextEntry

class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'usage_frequency', 'task_count', 'created_at']
    
    def get_task_count(self, obj):
        return obj.task_set.count()

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    ai_suggestions = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 'category_color',
            'priority', 'priority_score', 'status', 'deadline', 'estimated_duration',
            'tags', 'ai_enhanced_description', 'context_insights', 'is_overdue',
            'ai_suggestions', 'created_at', 'updated_at', 'completed_at'
        ]
    
    def get_ai_suggestions(self, obj):
        # Return AI-generated suggestions for this task
        return {
            'suggested_categories': obj.context_insights.get('suggested_categories', []),
            'complexity_score': obj.context_insights.get('complexity_score', 0.5),
            'recommended_duration': obj.context_insights.get('recommended_duration', 60)
        }

class TaskCreateSerializer(serializers.ModelSerializer):
    enhance_with_ai = serializers.BooleanField(default=True, write_only=True)
    context_data = serializers.JSONField(required=False, write_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'priority', 'deadline',
            'estimated_duration', 'tags', 'enhance_with_ai', 'context_data'
        ]
    
    def create(self, validated_data):
        enhance_with_ai = validated_data.pop('enhance_with_ai', True)
        context_data = validated_data.pop('context_data', None)
        
        task = Task.objects.create(**validated_data)
        
        if enhance_with_ai:
            from ai_module.services import ai_service
            
            # Enhance description with AI
            enhanced_description = ai_service.enhance_task_description(
                task.title, task.description, context_data
            )
            task.ai_enhanced_description = enhanced_description
            
            # Suggest categories
            suggested_categories = ai_service.suggest_categories(task.title, task.description)
            
            # Calculate priority score
            priority_scores = ai_service.prioritize_tasks([task], context_data)
            task.priority_score = priority_scores.get(task.id, 0.5)
            
            # Suggest deadline if not provided
            if not task.deadline:
                suggested_deadline = ai_service.suggest_deadline(
                    task.title, task.description, context_data
                )
                task.deadline = suggested_deadline
            
            # Store AI insights
            task.context_insights = {
                'suggested_categories': suggested_categories,
                'ai_enhanced': True,
                'context_used': bool(context_data)
            }
            
            task.save()
        
        return task

class TaskDependencySerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    depends_on_title = serializers.CharField(source='depends_on.title', read_only=True)
    
    class Meta:
        model = TaskDependency
        fields = ['id', 'task', 'task_title', 'depends_on', 'depends_on_title', 'created_at']

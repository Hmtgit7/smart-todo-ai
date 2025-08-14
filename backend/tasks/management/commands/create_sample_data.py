from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from tasks.models import Category, Task
from context.models import ContextEntry

class Command(BaseCommand):
    help = 'Create sample data for the Smart Todo application'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create categories
        categories = {
            'Work': '#3B82F6',
            'Personal': '#10B981',
            'Learning': '#F59E0B',
            'Health': '#EF4444',
            'Finance': '#8B5CF6',
            'Home': '#06B6D4'
        }
        
        created_categories = {}
        for name, color in categories.items():
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'color': color}
            )
            created_categories[name] = category
            if created:
                self.stdout.write(f'Created category: {name}')
        
        # Create sample tasks
        sample_tasks = [
            {
                'title': 'Review project proposal',
                'description': 'Go through the new project proposal and provide feedback',
                'category': 'Work',
                'priority': 'high',
                'status': 'completed',
                'deadline': timezone.now() - timedelta(hours=2)
            },
            {
                'title': 'Plan team meeting',
                'description': 'Schedule and prepare agenda for the weekly team meeting',
                'category': 'Work',
                'priority': 'medium',
                'status': 'in_progress',
                'deadline': timezone.now() + timedelta(days=1)
            },
            {
                'title': 'Update documentation',
                'description': 'Update the API documentation with latest changes',
                'category': 'Work',
                'priority': 'high',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(days=2)
            },
            {
                'title': 'Design system components',
                'description': 'Create reusable UI components for the design system',
                'category': 'Work',
                'priority': 'urgent',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(hours=6)
            },
            {
                'title': 'Gym workout',
                'description': 'Complete the scheduled workout routine',
                'category': 'Health',
                'priority': 'medium',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(hours=4)
            },
            {
                'title': 'Learn React hooks',
                'description': 'Study advanced React hooks and patterns',
                'category': 'Learning',
                'priority': 'low',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(days=7)
            },
            {
                'title': 'Pay utility bills',
                'description': 'Pay electricity and water bills before due date',
                'category': 'Finance',
                'priority': 'high',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(days=3)
            },
            {
                'title': 'Clean apartment',
                'description': 'Deep clean the apartment including kitchen and bathroom',
                'category': 'Home',
                'priority': 'medium',
                'status': 'pending',
                'deadline': timezone.now() + timedelta(days=2)
            }
        ]
        
        for task_data in sample_tasks:
            category = created_categories[task_data['category']]
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                defaults={
                    'description': task_data['description'],
                    'category': category,
                    'priority': task_data['priority'],
                    'status': task_data['status'],
                    'deadline': task_data['deadline'],
                    'priority_score': 0.5
                }
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')
        
        # Create sample context entries
        sample_context = [
            {
                'content': 'Had a productive meeting with the development team about the new features we need to implement.',
                'source_type': 'meeting_notes'
            },
            {
                'content': 'Received feedback from the client about the latest prototype. They want more emphasis on user experience.',
                'source_type': 'client_feedback'
            },
            {
                'content': 'Need to prepare for the quarterly review presentation next week. Should focus on our achievements and future goals.',
                'source_type': 'reminder'
            },
            {
                'content': 'The new API integration is working well, but we need to optimize the response times for better performance.',
                'source_type': 'technical_notes'
            },
            {
                'content': 'Team is feeling overwhelmed with the current workload. Should consider redistributing tasks or extending deadlines.',
                'source_type': 'team_observation'
            }
        ]
        
        for context_data in sample_context:
            entry, created = ContextEntry.objects.get_or_create(
                content=context_data['content'],
                defaults={
                    'source_type': context_data['source_type'],
                    'processed': False
                }
            )
            if created:
                self.stdout.write(f'Created context entry: {entry.content[:50]}...')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )


#!/usr/bin/env python
"""
Sample Data Generator for Smart Todo AI
This script creates comprehensive sample data for testing the application.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_todo.settings')
django.setup()

from django.contrib.auth.models import User
from tasks.models import Task, Category
from context.models import ContextEntry, UserPreference
from ai_module.services import ai_service

def create_sample_categories():
    """Create sample categories"""
    categories_data = [
        {'name': 'Work', 'color': '#3B82F6', 'usage_frequency': 25},
        {'name': 'Personal', 'color': '#10B981', 'usage_frequency': 15},
        {'name': 'Health', 'color': '#EF4444', 'usage_frequency': 10},
        {'name': 'Learning', 'color': '#8B5CF6', 'usage_frequency': 12},
        {'name': 'Finance', 'color': '#F59E0B', 'usage_frequency': 8},
        {'name': 'Home', 'color': '#06B6D4', 'usage_frequency': 6},
        {'name': 'Travel', 'color': '#84CC16', 'usage_frequency': 4},
        {'name': 'Shopping', 'color': '#EC4899', 'usage_frequency': 5},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")
        categories.append(category)
    
    return categories

def create_sample_context_entries():
    """Create sample context entries"""
    context_data = [
        {
            'content': 'Meeting with client tomorrow at 2 PM to discuss project requirements and timeline. Need to prepare presentation slides and review contract details.',
            'source_type': 'whatsapp'
        },
        {
            'content': 'Need to review quarterly reports and prepare presentation for board meeting next week. Financial data needs to be updated and charts created.',
            'source_type': 'email'
        },
        {
            'content': 'Team is asking for status updates on the new feature development. Need to coordinate with frontend and backend developers.',
            'source_type': 'notes'
        },
        {
            'content': 'Doctor appointment scheduled for Friday at 3 PM. Annual checkup and need to discuss new medication.',
            'source_type': 'calendar'
        },
        {
            'content': 'Need to complete project documentation by end of week. API documentation, user guides, and deployment instructions.',
            'source_type': 'manual'
        },
        {
            'content': 'Budget review meeting with finance team on Monday. Need to prepare expense reports and justify additional funding.',
            'source_type': 'email'
        },
        {
            'content': 'Gym session planned for Tuesday and Thursday. Focus on strength training and cardio.',
            'source_type': 'notes'
        },
        {
            'content': 'Online course on machine learning starts next week. Need to complete prerequisites and set up development environment.',
            'source_type': 'manual'
        },
        {
            'content': 'Grocery shopping needed for the week. Create list and check pantry for missing items.',
            'source_type': 'whatsapp'
        },
        {
            'content': 'Car maintenance appointment on Wednesday. Oil change and tire rotation needed.',
            'source_type': 'calendar'
        },
        {
            'content': 'Client feedback received on latest prototype. Several UI improvements requested and bug fixes needed.',
            'source_type': 'email'
        },
        {
            'content': 'Team building event planned for next month. Need to coordinate venue, activities, and budget.',
            'source_type': 'notes'
        },
        {
            'content': 'Tax filing deadline approaching. Need to gather all receipts and documents.',
            'source_type': 'manual'
        },
        {
            'content': 'Dentist appointment reminder for next week. Regular cleaning and checkup.',
            'source_type': 'calendar'
        },
        {
            'content': 'Code review session with senior developer. Need to prepare questions and address feedback.',
            'source_type': 'whatsapp'
        }
    ]
    
    entries = []
    for entry_data in context_data:
        entry, created = ContextEntry.objects.get_or_create(
            content=entry_data['content'],
            source_type=entry_data['source_type'],
            defaults={'processed': True}
        )
        if created:
            print(f"Created context entry: {entry.source_type} - {entry.content[:50]}...")
        entries.append(entry)
    
    return entries

def create_sample_tasks(categories):
    """Create sample tasks with AI enhancement"""
    tasks_data = [
        {
            'title': 'Prepare Client Presentation',
            'description': 'Create comprehensive presentation for client meeting',
            'category': categories[0],  # Work
            'priority': 'high',
            'deadline': timezone.now() + timedelta(days=2),
            'estimated_duration': 120,
            'tags': ['presentation', 'client', 'meeting']
        },
        {
            'title': 'Complete Project Documentation',
            'description': 'Write API documentation and user guides',
            'category': categories[0],  # Work
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=5),
            'estimated_duration': 180,
            'tags': ['documentation', 'api', 'technical']
        },
        {
            'title': 'Review Quarterly Reports',
            'description': 'Analyze financial data and prepare board presentation',
            'category': categories[0],  # Work
            'priority': 'urgent',
            'deadline': timezone.now() + timedelta(days=1),
            'estimated_duration': 240,
            'tags': ['finance', 'reports', 'analysis']
        },
        {
            'title': 'Doctor Appointment',
            'description': 'Annual health checkup and medication review',
            'category': categories[2],  # Health
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=3),
            'estimated_duration': 60,
            'tags': ['health', 'appointment', 'medical']
        },
        {
            'title': 'Gym Workout',
            'description': 'Strength training session focusing on upper body',
            'category': categories[2],  # Health
            'priority': 'low',
            'deadline': timezone.now() + timedelta(days=1),
            'estimated_duration': 90,
            'tags': ['fitness', 'workout', 'strength']
        },
        {
            'title': 'Learn Machine Learning',
            'description': 'Complete online course on ML fundamentals',
            'category': categories[3],  # Learning
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=14),
            'estimated_duration': 300,
            'tags': ['learning', 'ml', 'course']
        },
        {
            'title': 'Grocery Shopping',
            'description': 'Buy weekly groceries and household items',
            'category': categories[5],  # Home
            'priority': 'low',
            'deadline': timezone.now() + timedelta(days=1),
            'estimated_duration': 45,
            'tags': ['shopping', 'groceries', 'household']
        },
        {
            'title': 'Car Maintenance',
            'description': 'Oil change and tire rotation at service center',
            'category': categories[1],  # Personal
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=2),
            'estimated_duration': 120,
            'tags': ['car', 'maintenance', 'service']
        },
        {
            'title': 'Tax Filing',
            'description': 'Prepare and file annual tax returns',
            'category': categories[4],  # Finance
            'priority': 'high',
            'deadline': timezone.now() + timedelta(days=7),
            'estimated_duration': 180,
            'tags': ['tax', 'finance', 'filing']
        },
        {
            'title': 'Team Building Event',
            'description': 'Plan and coordinate team building activities',
            'category': categories[0],  # Work
            'priority': 'low',
            'deadline': timezone.now() + timedelta(days=30),
            'estimated_duration': 240,
            'tags': ['team', 'event', 'planning']
        },
        {
            'title': 'Code Review',
            'description': 'Review pull requests and provide feedback',
            'category': categories[0],  # Work
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=1),
            'estimated_duration': 60,
            'tags': ['code', 'review', 'development']
        },
        {
            'title': 'Dentist Appointment',
            'description': 'Regular dental cleaning and checkup',
            'category': categories[2],  # Health
            'priority': 'medium',
            'deadline': timezone.now() + timedelta(days=5),
            'estimated_duration': 45,
            'tags': ['dental', 'health', 'appointment']
        }
    ]
    
    tasks = []
    for task_data in tasks_data:
        # Create task
        task = Task.objects.create(**task_data)
        
        # Enhance with AI
        try:
            # Get recent context for enhancement
            recent_context = ContextEntry.objects.filter(processed=True).order_by('-timestamp')[:5]
            context_data = None
            if recent_context:
                context_data = ai_service.analyze_context(recent_context)
            
            # Enhance description
            enhanced_description = ai_service.enhance_task_description(
                task.title, task.description, context_data
            )
            task.ai_enhanced_description = enhanced_description
            
            # Calculate priority score
            priority_scores = ai_service.prioritize_tasks([task], context_data)
            task.priority_score = priority_scores.get(task.id, 0.5)
            
            # Store AI insights
            task.context_insights = {
                'ai_enhanced': True,
                'context_used': bool(context_data),
                'enhancement_timestamp': timezone.now().isoformat()
            }
            
            task.save()
            print(f"Created and enhanced task: {task.title}")
            
        except Exception as e:
            print(f"Error enhancing task {task.title}: {e}")
            task.save()
        
        tasks.append(task)
    
    return tasks

def create_user_preferences():
    """Create user preferences"""
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        user.set_password('admin123')
        user.save()
        print("Created admin user")
    
    preference, created = UserPreference.objects.get_or_create(
        user=user,
        defaults={
            'working_hours_start': '09:00',
            'working_hours_end': '17:00',
            'preferred_task_duration': 60,
            'notification_preferences': {
                'email_notifications': True,
                'push_notifications': True,
                'reminder_frequency': 'daily'
            },
            'ai_suggestions_enabled': True,
            'auto_categorization': True
        }
    )
    
    if created:
        print("Created user preferences")
    
    return user

def main():
    """Main function to create all sample data"""
    print("🚀 Creating sample data for Smart Todo AI...")
    
    # Create categories
    print("\n📂 Creating categories...")
    categories = create_sample_categories()
    
    # Create context entries
    print("\n📝 Creating context entries...")
    context_entries = create_sample_context_entries()
    
    # Create user preferences
    print("\n👤 Creating user preferences...")
    user = create_user_preferences()
    
    # Create tasks with AI enhancement
    print("\n✅ Creating tasks with AI enhancement...")
    tasks = create_sample_tasks(categories)
    
    # Process context entries with AI
    print("\n🤖 Processing context entries with AI...")
    for entry in context_entries:
        if not entry.processed:
            try:
                insights = ai_service.analyze_context([entry])
                entry.insights = insights
                entry.sentiment_score = insights.get('sentiment', 0)
                entry.keywords = insights.get('keywords', [])
                entry.urgency_indicators = insights.get('urgency_indicators', [])
                entry.processed = True
                entry.save()
                print(f"Processed context entry: {entry.source_type}")
            except Exception as e:
                print(f"Error processing context entry: {e}")
    
    print(f"\n🎉 Sample data creation completed!")
    print(f"📊 Created {len(categories)} categories")
    print(f"📝 Created {len(context_entries)} context entries")
    print(f"✅ Created {len(tasks)} tasks")
    print(f"👤 User: admin/admin123")
    print(f"\n🌐 Access the application at http://localhost:3000")

if __name__ == '__main__':
    main()

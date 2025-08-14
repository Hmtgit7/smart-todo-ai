import openai
import anthropic
import requests
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
import re

# Try to import optional dependencies
try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class AITaskManager:
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.lm_studio_url = getattr(settings, 'LM_STUDIO_BASE_URL', None)
        
        if getattr(settings, 'OPENAI_API_KEY', None):
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        if getattr(settings, 'ANTHROPIC_API_KEY', None):
            self.anthropic_client = anthropic.Client(api_key=settings.ANTHROPIC_API_KEY)
    
    def analyze_context(self, context_entries):
        """Analyze daily context for task insights"""
        combined_text = " ".join([entry.content for entry in context_entries])
        
        insights = {
            'sentiment': self._analyze_sentiment(combined_text),
            'keywords': self._extract_keywords(combined_text),
            'urgency_indicators': self._detect_urgency(combined_text),
            'task_suggestions': self._suggest_tasks_from_context(combined_text),
            'time_indicators': self._extract_time_indicators(combined_text)
        }
        
        return insights
    
    def prioritize_tasks(self, tasks, context_data=None):
        """Calculate priority scores for tasks based on AI analysis"""
        priority_scores = {}
        
        for task in tasks:
            score = self._calculate_priority_score(task, context_data)
            priority_scores[task.id] = min(1.0, max(0.0, score))
        
        return priority_scores
    
    def suggest_deadline(self, task_title, task_description, context_data=None):
        """Suggest realistic deadlines based on task complexity and context"""
        complexity_score = self._assess_task_complexity(task_title, task_description)
        urgency_from_context = self._extract_urgency_from_context(context_data)
        
        base_days = {
            'simple': 1,
            'moderate': 3,
            'complex': 7,
            'very_complex': 14
        }
        
        if complexity_score > 0.8:
            complexity_level = 'very_complex'
        elif complexity_score > 0.6:
            complexity_level = 'complex'
        elif complexity_score > 0.4:
            complexity_level = 'moderate'
        else:
            complexity_level = 'simple'
        
        suggested_days = base_days[complexity_level]
        
        # Adjust based on urgency from context
        if urgency_from_context > 0.7:
            suggested_days = max(1, suggested_days // 2)
        elif urgency_from_context < 0.3:
            suggested_days = min(30, suggested_days * 2)
        
        suggested_deadline = timezone.now() + timedelta(days=suggested_days)
        return suggested_deadline
    
    def enhance_task_description(self, title, description, context_data=None):
        """Enhance task description with AI-powered insights"""
        try:
            if self.openai_client:
                return self._enhance_with_openai(title, description, context_data)
            elif self.anthropic_client:
                return self._enhance_with_anthropic(title, description, context_data)
            else:
                return self._enhance_with_lm_studio(title, description, context_data)
        except Exception as e:
            print(f"Error enhancing task description: {e}")
            return description
    
    def suggest_categories(self, title, description):
        """Suggest appropriate categories for tasks"""
        text = f"{title} {description}".lower()
        
        category_keywords = {
            'work': ['meeting', 'project', 'deadline', 'client', 'presentation', 'report'],
            'personal': ['doctor', 'appointment', 'family', 'friend', 'personal'],
            'learning': ['study', 'course', 'tutorial', 'learn', 'practice', 'skill'],
            'health': ['exercise', 'gym', 'workout', 'health', 'medical', 'therapy'],
            'finance': ['budget', 'payment', 'invoice', 'tax', 'banking', 'investment'],
            'home': ['clean', 'repair', 'maintenance', 'groceries', 'cooking', 'household']
        }
        
        suggestions = []
        for category, keywords in category_keywords.items():
            if any(keyword in text for keyword in keywords):
                suggestions.append(category)
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment of the context"""
        if TEXTBLOB_AVAILABLE:
            try:
                blob = TextBlob(text)
                return blob.sentiment.polarity
            except:
                pass
        
        # Fallback sentiment analysis using simple keyword matching
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'success']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'failure', 'problem']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count == 0 and negative_count == 0:
            return 0.0
        elif negative_count == 0:
            return 0.5
        elif positive_count == 0:
            return -0.5
        else:
            return (positive_count - negative_count) / (positive_count + negative_count)
    
    def _extract_keywords(self, text):
        """Extract important keywords from context"""
        # Simple keyword extraction using basic NLP
        words = re.findall(r'\b[A-Za-z]{3,}\b', text.lower())
        
        # Filter out common words
        stopwords = set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use'])
        
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        
        # Count frequency and return top keywords
        from collections import Counter
        word_counts = Counter(keywords)
        return [word for word, count in word_counts.most_common(10)]
    
    def _detect_urgency(self, text):
        """Detect urgency indicators in context"""
        urgency_phrases = [
            'urgent', 'asap', 'immediately', 'deadline', 'due today',
            'emergency', 'critical', 'important', 'priority', 'rush'
        ]
        
        found_indicators = []
        text_lower = text.lower()
        
        for phrase in urgency_phrases:
            if phrase in text_lower:
                found_indicators.append(phrase)
        
        return found_indicators
    
    def _suggest_tasks_from_context(self, text):
        """Extract potential tasks from context"""
        # Pattern matching for task-like phrases
        task_patterns = [
            r'need to (.+?)(?:\.|$)',
            r'have to (.+?)(?:\.|$)',
            r'should (.+?)(?:\.|$)',
            r'must (.+?)(?:\.|$)',
            r'remember to (.+?)(?:\.|$)'
        ]
        
        suggested_tasks = []
        for pattern in task_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            suggested_tasks.extend(matches[:3])  # Limit suggestions
        
        return suggested_tasks
    
    def _extract_time_indicators(self, text):
        """Extract time-related information from context"""
        time_patterns = [
            r'(\d{1,2}:\d{2})',  # Time format
            r'(today|tomorrow|next week|this week)',
            r'(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
            r'(\d{1,2}\/\d{1,2}\/\d{2,4})'  # Date format
        ]
        
        time_indicators = []
        for pattern in time_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            time_indicators.extend(matches)
        
        return time_indicators
    
    def _calculate_priority_score(self, task, context_data):
        """Calculate priority score based on multiple factors"""
        score = 0.5  # Base score
        
        # Factor 1: Deadline proximity
        if task.deadline:
            days_until_deadline = (task.deadline - timezone.now()).days
            if days_until_deadline <= 1:
                score += 0.3
            elif days_until_deadline <= 3:
                score += 0.2
            elif days_until_deadline <= 7:
                score += 0.1
        
        # Factor 2: Keywords in task vs context
        if context_data:
            task_text = f"{task.title} {task.description}".lower()
            context_keywords = context_data.get('keywords', [])
            
            keyword_matches = sum(1 for keyword in context_keywords if keyword in task_text)
            score += min(0.2, keyword_matches * 0.05)
        
        # Factor 3: Manual priority setting
        priority_weights = {'low': -0.1, 'medium': 0, 'high': 0.2, 'urgent': 0.4}
        score += priority_weights.get(task.priority, 0)
        
        # Factor 4: Task age (older tasks get slight priority boost)
        days_old = (timezone.now() - task.created_at).days
        score += min(0.1, days_old * 0.01)
        
        return score
    
    def _assess_task_complexity(self, title, description):
        """Assess task complexity based on content analysis"""
        text = f"{title} {description}".lower()
        
        complexity_indicators = {
            'simple': ['call', 'email', 'buy', 'send', 'check', 'remind'],
            'moderate': ['plan', 'organize', 'prepare', 'create', 'design', 'write'],
            'complex': ['analyze', 'develop', 'implement', 'research', 'strategic', 'comprehensive'],
            'very_complex': ['architecture', 'framework', 'system', 'integration', 'optimization']
        }
        
        scores = {'simple': 0.2, 'moderate': 0.4, 'complex': 0.7, 'very_complex': 0.9}
        
        for level, indicators in complexity_indicators.items():
            if any(indicator in text for indicator in indicators):
                return scores[level]
        
        # Default complexity based on text length
        if len(text) > 200:
            return 0.7
        elif len(text) > 100:
            return 0.5
        else:
            return 0.3
    
    def _extract_urgency_from_context(self, context_data):
        """Extract urgency level from context data"""
        if not context_data:
            return 0.5
        
        urgency_indicators = context_data.get('urgency_indicators', [])
        sentiment = context_data.get('sentiment', 0)
        
        urgency_score = len(urgency_indicators) * 0.2
        
        # Negative sentiment might indicate urgency
        if sentiment < -0.3:
            urgency_score += 0.3
        
        return min(1.0, urgency_score)
    
    def _enhance_with_openai(self, title, description, context_data):
        """Enhance task description using OpenAI"""
        context_info = ""
        if context_data:
            context_info = f"Context: {context_data.get('keywords', [])}"
        
        prompt = f"""
        Enhance this task description to be more actionable and detailed:
        
        Title: {title}
        Description: {description}
        {context_info}
        
        Provide a more detailed, actionable description that includes:
        - Clear steps or approach
        - Relevant context considerations
        - Potential challenges or dependencies
        
        Keep it concise but comprehensive.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a productivity assistant that helps enhance task descriptions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return description
    
    def _enhance_with_anthropic(self, title, description, context_data):
        """Enhance task description using Anthropic Claude"""
        context_info = ""
        if context_data:
            context_info = f"Context: {context_data.get('keywords', [])}"
        
        prompt = f"""
        Enhance this task description to be more actionable and detailed:
        
        Title: {title}
        Description: {description}
        {context_info}
        
        Provide a more detailed, actionable description.
        """
        
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=200,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            print(f"Anthropic API error: {e}")
            return description
    
    def _enhance_with_lm_studio(self, title, description, context_data):
        """Enhance task description using LM Studio local model"""
        if not self.lm_studio_url:
            return description
            
        context_info = ""
        if context_data:
            context_info = f"Context: {context_data.get('keywords', [])}"
        
        prompt = f"""
        Enhance this task description to be more actionable:
        
        Title: {title}
        Description: {description}
        {context_info}
        
        Provide a better description:
        """
        
        try:
            response = requests.post(
                f"{self.lm_studio_url}/v1/chat/completions",
                json={
                    "model": "local-model",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 200,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            else:
                return description
        except Exception as e:
            print(f"LM Studio error: {e}")
            return description

# Initialize AI service
ai_service = AITaskManager()

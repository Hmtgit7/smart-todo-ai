export interface Task {
    id: number;
    title: string;
    description: string;
    category?: Category;
    category_name?: string;
    category_color?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_score: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    deadline?: string;
    estimated_duration?: number;
    tags: string[];
    ai_enhanced_description?: string;
    context_insights: Record<string, any>;
    is_overdue: boolean;
    ai_suggestions: {
      suggested_categories: string[];
      complexity_score: number;
      recommended_duration: number;
    };
    created_at: string;
    updated_at: string;
    completed_at?: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    color: string;
    usage_frequency: number;
    task_count: number;
    created_at: string;
  }
  
  export interface ContextEntry {
    id: number;
    content: string;
    source_type: 'whatsapp' | 'email' | 'notes' | 'calendar' | 'manual';
    timestamp: string;
    processed: boolean;
    insights: Record<string, any>;
    sentiment_score?: number;
    keywords: string[];
    urgency_indicators: string[];
    processed_insights: {
      task_suggestions: string[];
      priority_keywords: string[];
      urgency_level: 'low' | 'medium' | 'high';
    };
  }
  
  export interface DashboardStats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    priority_distribution: Record<string, number>;
    category_distribution: Array<{
      name: string;
      count: number;
      color: string;
    }>;
  }
  
  export interface AITaskSuggestion {
    title: string;
    suggested_category: string;
    estimated_priority: string;
    suggested_deadline: string;
    complexity_score: number;
  }
  
  export interface CreateTaskData {
    title: string;
    description: string;
    category?: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    estimated_duration?: number;
    tags: string[];
    enhance_with_ai?: boolean;
    context_data?: Record<string, any>;
  }
  
  export interface TaskFilters {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }
  
  export interface UserPreference {
    id: number;
    working_hours_start: string;
    working_hours_end: string;
    preferred_task_duration: number;
    notification_preferences: Record<string, any>;
    ai_suggestions_enabled: boolean;
    auto_categorization: boolean;
  }
  
  export interface AIAnalysis {
    task_analysis: Array<{
      task_id: number;
      title: string;
      current_priority: string;
      ai_priority_score: number;
      suggested_categories: string[];
      complexity_assessment: number;
      deadline_suggestion?: string;
      enhancement_available: boolean;
    }>;
    recommendations: {
      high_priority_tasks: any[];
      tasks_needing_deadlines: any[];
      complex_tasks: any[];
    };
  }
  
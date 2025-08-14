from django.urls import path
from .views import AITaskSuggestionsView, AITaskAnalysisView, AIContextAnalysisView

urlpatterns = [
    path('task-suggestions/', AITaskSuggestionsView.as_view(), name='ai-task-suggestions'),
    path('task-analysis/', AITaskAnalysisView.as_view(), name='ai-task-analysis'),
    path('context-analysis/', AIContextAnalysisView.as_view(), name='ai-context-analysis'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContextEntryViewSet, UserPreferenceViewSet

router = DefaultRouter()
router.register(r'entries', ContextEntryViewSet)
router.register(r'preferences', UserPreferenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

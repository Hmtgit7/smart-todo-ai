"""
Database Configuration for Smart Todo AI
This module provides database configuration for both development and production environments.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

def get_database_config():
    """
    Get database configuration based on environment variables.
    Defaults to SQLite for development, can be configured for PostgreSQL.
    """
    db_engine = os.getenv('DB_ENGINE', 'sqlite3')
    
    if db_engine == 'postgresql':
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'smart_todo_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    else:
        # Default to SQLite for development
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }

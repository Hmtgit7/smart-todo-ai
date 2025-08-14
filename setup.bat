@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Smart Todo AI Application...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

echo [INFO] System requirements check completed

REM Setup backend
echo [INFO] Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating .env file...
    (
        echo SECRET_KEY=django-insecure-^
        echo DEBUG=True^
        echo # Database settings (SQLite for development, PostgreSQL for production)^
        echo DB_ENGINE=sqlite3^
        echo # For PostgreSQL, uncomment and configure:^
        echo # DB_ENGINE=postgresql^
        echo # DB_NAME=smart_todo_db^
        echo # DB_USER=postgres^
        echo # DB_PASSWORD=password^
        echo # DB_HOST=localhost^
        echo # DB_PORT=5432^
        echo OPENAI_API_KEY=your-openai-api-key-here^
        echo ANTHROPIC_API_KEY=your-anthropic-api-key-here^
        echo LM_STUDIO_BASE_URL=http://localhost:1234
    ) > .env
    echo [WARNING] Please update the .env file with your actual API keys
)

REM Run migrations
echo [INFO] Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser
echo [INFO] Creating superuser...
echo from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None | python manage.py shell

echo [SUCCESS] Backend setup completed
cd ..

REM Setup frontend
echo [INFO] Setting up frontend...
cd frontend

REM Install dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo [INFO] Creating .env.local file...
    echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 > .env.local
)

echo [SUCCESS] Frontend setup completed
cd ..

REM Create sample data
echo [INFO] Creating sample data...
cd backend
call venv\Scripts\activate.bat

python manage.py shell -c "
from tasks.models import Category
from context.models import ContextEntry

# Create sample categories
categories = [
    {'name': 'Work', 'color': '#3B82F6'},
    {'name': 'Personal', 'color': '#10B981'},
    {'name': 'Health', 'color': '#EF4444'},
    {'name': 'Learning', 'color': '#8B5CF6'},
    {'name': 'Finance', 'color': '#F59E0B'},
]

for cat_data in categories:
    Category.objects.get_or_create(name=cat_data['name'], defaults=cat_data)

# Create sample context entries
context_entries = [
    {
        'content': 'Meeting with client tomorrow at 2 PM to discuss project requirements and timeline',
        'source_type': 'whatsapp'
    },
    {
        'content': 'Need to review quarterly reports and prepare presentation for board meeting next week',
        'source_type': 'email'
    },
    {
        'content': 'Team is asking for status updates on the new feature development',
        'source_type': 'notes'
    },
    {
        'content': 'Doctor appointment scheduled for Friday at 3 PM',
        'source_type': 'calendar'
    },
    {
        'content': 'Need to complete project documentation by end of week',
        'source_type': 'manual'
    }
]

for entry_data in context_entries:
    ContextEntry.objects.get_or_create(
        content=entry_data['content'],
        source_type=entry_data['source_type'],
        defaults={'processed': True}
    )

print('Sample data created successfully!')
"

echo [SUCCESS] Sample data created
cd ..

REM Create startup script
echo [INFO] Creating startup script...
(
    echo @echo off
    echo echo 🚀 Starting Smart Todo AI Application...
    echo.
    echo echo Starting Django backend...
    echo cd backend
    echo call venv\Scripts\activate.bat
    echo start "Backend" python manage.py runserver 0.0.0.0:8000
    echo.
    echo echo Starting Next.js frontend...
    echo cd ..\frontend
    echo start "Frontend" npm run dev
    echo.
    echo echo ✅ Application started successfully!
    echo echo 🌐 Frontend: http://localhost:3000
    echo echo 🔧 Backend API: http://localhost:8000
    echo echo 📊 Admin Panel: http://localhost:8000/admin
    echo echo.
    echo pause
) > start.bat

echo [SUCCESS] Startup script created: start.bat

echo.
echo [SUCCESS] 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update API keys in backend\.env file
echo 2. Start the application: start.bat
echo 3. Access the application at http://localhost:3000
echo 4. Login with admin/admin123
echo.
echo For more information, see README.md
pause

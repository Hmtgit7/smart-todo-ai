#!/bin/bash

# Smart Todo AI - Setup Script
# This script will set up the complete development environment

set -e

echo "🚀 Setting up Smart Todo AI Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. Please install PostgreSQL"
        print_warning "You can download it from: https://www.postgresql.org/download/"
    fi
    
    # Check Redis
    if ! command -v redis-server &> /dev/null; then
        print_warning "Redis is not installed. Please install Redis for Celery"
        print_warning "You can download it from: https://redis.io/download"
    fi
    
    print_success "System requirements check completed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
SECRET_KEY=django-insecure-$(openssl rand -hex 32)
DEBUG=True
# Database settings (SQLite for development, PostgreSQL for production)
DB_ENGINE=sqlite3
# For PostgreSQL, uncomment and configure:
# DB_ENGINE=postgresql
# DB_NAME=smart_todo_db
# DB_USER=postgres
# DB_PASSWORD=password
# DB_HOST=localhost
# DB_PORT=5432
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
LM_STUDIO_BASE_URL=http://localhost:1234
EOF
        print_warning "Please update the .env file with your actual API keys"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    python manage.py makemigrations
    python manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Creating superuser..."
    echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell
    
    print_success "Backend setup completed"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
EOF
    fi
    
    print_success "Frontend setup completed"
    cd ..
}

# Create sample data
create_sample_data() {
    print_status "Creating sample data..."
    
    cd backend
    source venv/bin/activate
    
    # Create sample categories
    python manage.py shell << EOF
from tasks.models import Category
from context.models import ContextEntry
from django.utils import timezone
from datetime import timedelta

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

print("Sample data created successfully!")
EOF
    
    print_success "Sample data created"
    cd ..
}

# Create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

# Smart Todo AI - Startup Script

echo "🚀 Starting Smart Todo AI Application..."

# Start Redis (if available)
if command -v redis-server &> /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

# Start backend
echo "Starting Django backend..."
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting Next.js frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Application started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Admin Panel: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "Stopping services..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
echo "Services stopped"
EOF
    
    chmod +x start.sh
    print_success "Startup script created: ./start.sh"
}

# Main setup function
main() {
    print_status "Starting Smart Todo AI setup..."
    
    check_requirements
    setup_backend
    setup_frontend
    create_sample_data
    create_startup_script
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update API keys in backend/.env file"
    echo "2. Start the application: ./start.sh"
    echo "3. Access the application at http://localhost:3000"
    echo "4. Login with admin/admin123"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@"

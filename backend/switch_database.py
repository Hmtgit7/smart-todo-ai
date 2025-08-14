#!/usr/bin/env python
"""
Database Switcher for Smart Todo AI
This script helps switch between SQLite and PostgreSQL databases.
"""

import os
import sys
from pathlib import Path

def switch_to_sqlite():
    """Switch to SQLite database (for development)"""
    env_file = Path('.env')
    
    if env_file.exists():
        # Read current .env file
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Update database settings
        new_lines = []
        for line in lines:
            if line.startswith('DB_ENGINE='):
                new_lines.append('DB_ENGINE=sqlite3\n')
            elif line.startswith('# DB_ENGINE='):
                new_lines.append('DB_ENGINE=sqlite3\n')
            else:
                new_lines.append(line)
        
        # Write updated .env file
        with open(env_file, 'w') as f:
            f.writelines(new_lines)
        
        print("✅ Switched to SQLite database")
        print("📝 Updated .env file")
    else:
        print("❌ .env file not found. Creating one...")
        create_env_file('sqlite3')

def switch_to_postgresql():
    """Switch to PostgreSQL database (for production)"""
    env_file = Path('.env')
    
    if env_file.exists():
        # Read current .env file
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Update database settings
        new_lines = []
        for line in lines:
            if line.startswith('DB_ENGINE='):
                new_lines.append('DB_ENGINE=postgresql\n')
            elif line.startswith('# DB_ENGINE='):
                new_lines.append('DB_ENGINE=postgresql\n')
            else:
                new_lines.append(line)
        
        # Write updated .env file
        with open(env_file, 'w') as f:
            f.writelines(new_lines)
        
        print("✅ Switched to PostgreSQL database")
        print("📝 Updated .env file")
        print("⚠️  Make sure PostgreSQL is running and configured!")
    else:
        print("❌ .env file not found. Creating one...")
        create_env_file('postgresql')

def create_env_file(db_engine):
    """Create a new .env file with the specified database engine"""
    env_content = f"""SECRET_KEY=django-insecure-{os.urandom(32).hex()}
DEBUG=True
# Database settings
DB_ENGINE={db_engine}
"""
    
    if db_engine == 'postgresql':
        env_content += """# PostgreSQL settings
DB_NAME=smart_todo_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
"""
    
    env_content += """# AI API Keys
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
LM_STUDIO_BASE_URL=http://localhost:1234
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print(f"✅ Created .env file with {db_engine} configuration")

def show_current_config():
    """Show current database configuration"""
    env_file = Path('.env')
    
    if env_file.exists():
        with open(env_file, 'r') as f:
            content = f.read()
        
        if 'DB_ENGINE=sqlite3' in content:
            print("📊 Current database: SQLite (Development)")
        elif 'DB_ENGINE=postgresql' in content:
            print("📊 Current database: PostgreSQL (Production)")
        else:
            print("📊 Current database: Not configured")
    else:
        print("📊 No .env file found")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("🔧 Database Switcher for Smart Todo AI")
        print("Usage:")
        print("  python switch_database.py sqlite     # Switch to SQLite")
        print("  python switch_database.py postgresql # Switch to PostgreSQL")
        print("  python switch_database.py status     # Show current config")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'sqlite':
        switch_to_sqlite()
    elif command == 'postgresql':
        switch_to_postgresql()
    elif command == 'status':
        show_current_config()
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: sqlite, postgresql, status")

if __name__ == '__main__':
    main()

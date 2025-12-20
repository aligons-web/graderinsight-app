#!/bin/bash

echo "🚀 Installing Subscription System..."

# Create directories
mkdir -p public desktop-app

# Download and setup
cat > package.json << 'EOF'
{
  "name": "subscription-system",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "sqlite3": "^5.1.6",
    "body-parser": "^1.20.2",
    "cookie-parser": "^1.4.6",
    "archiver": "^6.0.1"
  }
}
EOF

echo "✓ Created package.json"
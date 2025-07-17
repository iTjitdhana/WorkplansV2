#!/bin/bash

echo "🚀 Starting ESP Tracker Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install MySQL
echo "📦 Installing MySQL..."
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database and user
echo "🗄️ Setting up database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS esp_tracker;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'esp_user'@'localhost' IDENTIFIED BY 'your_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON esp_tracker.* TO 'esp_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3007
sudo ufw --force enable

echo "✅ Deployment script completed!"
echo "📝 Next steps:"
echo "1. Configure .env files with your database credentials"
echo "2. Import database schema from esp_tracker.sql"
echo "3. Build and start the applications" 
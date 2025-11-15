#!/bin/bash

# Tournament Manager Deployment Script
echo "🚀 Deploying Tournament Manager..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup database schema
echo "Setting up database schema..."
node setup-db.js

# Start the server
echo "Starting tournament manager..."
npm start
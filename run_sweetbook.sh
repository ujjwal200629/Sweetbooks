#!/bin/bash

echo "==================================================="
echo "🍬 Welcome to Sweetbook - Business Operating System"
echo "==================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed."
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    echo "Make sure Docker Desktop is RUNNING before launching this file."
    echo ""
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "[ERROR] Docker daemon is not running!"
    echo "Please open the 'Docker Desktop' application on your computer and wait for it to start."
    echo "Then, run this script again."
    echo ""
    exit 1
fi

echo "[INFO] Docker is running correctly."
echo "[INFO] Starting Sweetbook Ecosystem (Database, Backend, Frontend)..."
echo "This might take a few minutes if this is your first time running it."
echo ""

# Build and start containers in detached mode
docker-compose up -d --build

echo ""
echo "==================================================="
echo "🎉 Sweetbook is successfully running in the background!"
echo "==================================================="
echo ""
echo "⏳ Please wait ~30 seconds for the database to initialize and seed demo data."
echo ""
echo "🌐 Access the application at: http://localhost"
echo ""
echo "🔑 Demo Account Login:"
echo "   Email:    demo@sweetbook.com"
echo "   Password: demo123"
echo ""
echo "[NOTE] To stop the application, you can run 'docker-compose down' in this folder,"
echo "or use the Docker Desktop dashboard to stop the containers."
echo "==================================================="

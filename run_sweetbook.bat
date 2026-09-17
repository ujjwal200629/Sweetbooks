@echo off
echo ===================================================
echo 🍬 Welcome to Sweetbook - Business Operating System
echo ===================================================
echo.

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not added to your PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo Make sure Docker Desktop is RUNNING before launching this file.
    echo.
    pause
    exit /b
)

:: Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running!
    echo Please open the "Docker Desktop" application on your computer and wait for it to start.
    echo Then, run this script again.
    echo.
    pause
    exit /b
)

echo [INFO] Docker is running correctly.
echo [INFO] Starting Sweetbook Ecosystem (Database, Backend, Frontend)...
echo This might take a few minutes if this is your first time running it.
echo.

:: Build and start containers in detached mode
docker-compose up -d --build

echo.
echo ===================================================
echo 🎉 Sweetbook is successfully running in the background!
echo ===================================================
echo.
echo ⏳ Please wait ~30 seconds for the database to initialize and seed demo data.
echo.
echo 🌐 Access the application at: http://localhost
echo.
echo 🔑 Demo Account Login:
echo    Email:    demo@sweetbook.com
echo    Password: demo123
echo.
echo [NOTE] To stop the application, you can run "docker-compose down" in this folder,
echo or use the Docker Desktop dashboard to stop the containers.
echo ===================================================
pause

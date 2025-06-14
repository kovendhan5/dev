@echo off
echo 🚀 Starting Frontend Server...
echo.
echo Choose your preferred server:
echo [1] Python HTTP Server (Port 8000)
echo [2] Node.js Server (Port 3000)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo 🐍 Starting Python HTTP Server on port 8000...
    echo 🌐 Open your browser and visit: http://localhost:8000
    echo 📝 Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo.
    echo 🟢 Starting Node.js Server on port 3000...
    echo 🌐 Open your browser and visit: http://localhost:3000
    echo 📝 Press Ctrl+C to stop the server
    echo.
    node server.js
) else (
    echo ❌ Invalid choice. Please run the script again and choose 1 or 2.
    pause
)

pause

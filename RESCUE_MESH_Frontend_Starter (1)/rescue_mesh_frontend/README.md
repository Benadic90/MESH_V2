# RESCUE_MESH frontend starter

This is a beginner-friendly React frontend based on your dashboard screenshot.

## What works in this demo
- Sidebar navigation between Live Incident, Map View, Resources, Response Teams, Reports, and Settings.
- Interactive OpenStreetMap with incident markers and marker popups (internet connection required).
- Search/filter the incident table.
- Add a new incident through a form.
- Select an incident, send a response, and mark incidents resolved.
- Export the current incident list as a CSV report.
- Responsive layout for desktop and mobile screens.

## What is demo-only
The data is stored in React state, so it resets when you refresh the page. Team/resource add buttons and settings are starter interactions, not database-backed. A real multi-user emergency system needs a backend, authentication, a database, secure APIs, and tested location/dispatch workflows.

## Run it
1. Install Node.js LTS from https://nodejs.org if you don't already have it.
2. Extract this ZIP folder.
3. Open the `rescue_mesh_frontend` folder in VS Code.
4. Open **Terminal → New Terminal** in VS Code.
5. Run these commands one at a time:

   ```bash
   npm install
   npm run dev
   ```

6. Open the local address Vite prints, commonly `http://localhost:5173`.

## If you have never coded before
You do not need to understand every line. First run the project and click through each page. Then we can customize the colours, names, map, and incident fields. Keep the terminal open while the app is running.

## Important
This is a frontend prototype with sample data, not a production emergency-dispatch service. Map tiles require internet access. Do not use the demo to coordinate real emergencies.

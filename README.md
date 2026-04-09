# Masebba

Masebba is a modern, responsive web application built with React, TypeScript, and Vite, with Firebase powering real-time data management. It includes a public-facing website, an admin dashboard, and a custom deployment setup for GitHub Pages and a custom domain.

The project is designed to be clean, fast, and easy to manage, making it suitable for both public visitors and administrators who need to update site content, branding, and social links from one place.

## Live Demo

- Production site: [https://masebba.is-a.dev](https://masebba.is-a.dev)

## Screenshots

### Public Homepage

![Public Homepage](./screenshots/homepage.png)

### Admin Dashboard

![Admin Dashboard](./screenshots/admin-dashboard.png)

### Site Settings

![Site Settings](./screenshots/site-settings.png)

## Key Features

- Public website with a responsive layout
- Admin dashboard for site management
- Social links management
- Site settings management, including logo and branding
- Firebase Firestore integration
- Real-time updates for dynamic content
- GitHub Actions deployment workflow
- GitHub Pages hosting
- Custom domain support
- SPA route handling for direct access to pages such as `/admin`

## Tech Stack

- React
- TypeScript
- Vite
- Firebase Firestore
- GitHub Actions
- GitHub Pages

## Project Structure

```bash
src/
  components/
  pages/
  lib/
  types/
public/
.github/
  workflows/

Getting Started
Prerequisites
Node.js 18 or later
npm
Installation
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
Run Locally
npm run dev

The app will start on the local Vite development server.

Build for Production
npm run build

This generates the production-ready files in the dist folder.

Preview Production Build
npm run preview
Environment Variables

Create a .env file in the root of the project and add your Firebase credentials:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Deployment

This project is deployed through GitHub Actions to GitHub Pages.

Important Deployment Note

GitHub Pages must publish the built output from dist, not the source files. The workflow builds the app and deploys the generated static files automatically.

Deployment Flow
Push changes to the main branch
GitHub Actions runs the build
The dist folder is published to GitHub Pages
The site becomes available on the GitHub Pages URL or custom domain
Routing on GitHub Pages

This application uses client-side routing. To support direct access to routes like /admin, the project includes fallback handling so routes continue to work after refresh or when opened directly.

Firebase Usage

Firebase is used for:

Reading and updating site data
Managing social links
Managing site settings
Supporting real-time content updates
Scripts
npm run dev      # Start development server
npm run build    # Build production files
npm run preview  # Preview production build
For Recruiters and Reviewers

Masebba demonstrates:

A clean React and TypeScript codebase
Reusable UI and layout structure
Real-time backend integration with Firebase
Production deployment with GitHub Actions and GitHub Pages
Support for custom domain hosting and SPA routing
License

This project is licensed under the MIT License.
```

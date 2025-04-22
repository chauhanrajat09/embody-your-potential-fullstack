# EmpowerFit - Fitness Tracking Application

A full-stack fitness tracking application with user authentication, workout tracking, and progress visualization.

## Features

- User authentication (login/register)
- Dashboard with fitness overview
- Workout tracking and management
- Exercise library
- Progress tracking and visualization
- Weight logging

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- TailwindCSS
- Shadcn UI components
- React Router
- Recharts for data visualization

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT authentication
- RESTful API architecture

## Running the Application

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/empowerfit.git
cd empowerfit
```

2. Install frontend dependencies:
```
npm install
```

3. Install backend dependencies:
```
cd server
npm install
```

4. Configure backend environment:
   - Create a `.env` file in the `server` directory
   - Add the following variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=development
     ```
   - Replace placeholders with your actual values

### Running in Development Mode

1. Start the backend server (from the server directory):
```
npm run dev
```

2. Start the frontend (from the project root directory):
```
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
empowerfit/
├── public/                 # Static files
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/           # React contexts (auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── pages/              # Page components
│   └── App.tsx             # Main application component
├── server/                 # Backend source code
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
└── package.json            # Project configuration
```

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8ad99cb3-e96d-4096-aa17-82c613ae6c41

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8ad99cb3-e96d-4096-aa17-82c613ae6c41) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8ad99cb3-e96d-4096-aa17-82c613ae6c41) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

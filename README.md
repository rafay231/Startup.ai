# StartupLaunchpad

A comprehensive startup planning platform that transforms entrepreneurial ideas into actionable business strategies through intelligent workflows and professional resource generation.

## Features

- AI-driven startup concept development
- Professional export and presentation tools
- Personalized startup planning and guidance
- PowerPoint pitch deck generation
- Integrated startup resource management

## Local Development

To run the application locally:

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and add your environment variables:
   ```
   cp .env.example .env
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Deployment to Vercel

This application is optimized for deployment on Vercel. Follow these steps to deploy:

1. Create a Vercel account at [vercel.com](https://vercel.com)

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login to Vercel:
   ```
   vercel login
   ```

4. Deploy from your local directory:
   ```
   vercel
   ```

5. Configure the following environment variables in your Vercel project:
   - `NODE_ENV`: set to `production`
   - `OPENAI_API_KEY`: your OpenAI API key
   - `SESSION_SECRET`: a secure random string

6. For production deployment:
   ```
   vercel --prod
   ```

## API Endpoints

### Auth Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/logout` - Logout a user
- `GET /api/user` - Get current user info

### AI Endpoints
- `POST /api/ai/analyze-idea` - Generate startup recommendations
- `POST /api/ai/business-model` - Generate business model suggestions
- `POST /api/ai/pitch-deck` - Generate pitch deck outline

### Startup Endpoints
- `GET /api/startups` - Get all startups for current user
- `POST /api/startups` - Create a new startup
- `GET /api/startups/:id` - Get a startup by ID
- `PATCH /api/startups/:id` - Update a startup
- `DELETE /api/startups/:id` - Delete a startup

### Startup Components
- `GET /api/startups/:id/idea` - Get startup idea
- `POST /api/startups/:id/idea` - Create/update startup idea
- `GET /api/startups/:id/audience` - Get target audience
- `POST /api/startups/:id/audience` - Create/update target audience
- `GET /api/startups/:id/business-model` - Get business model
- `POST /api/startups/:id/business-model` - Create/update business model
- `GET /api/startups/:id/competition` - Get competition analysis
- `POST /api/startups/:id/competition` - Create/update competition analysis
- `GET /api/startups/:id/revenue` - Get revenue model
- `POST /api/startups/:id/revenue` - Create/update revenue model
- `GET /api/startups/:id/mvp` - Get MVP plan
- `POST /api/startups/:id/mvp` - Create/update MVP plan
- `GET /api/startups/:id/tasks` - Get tasks
- `POST /api/startups/:id/tasks` - Create a new task
- `PATCH /api/startups/:id/tasks/:taskId` - Update a task
- `DELETE /api/startups/:id/tasks/:taskId` - Delete a task

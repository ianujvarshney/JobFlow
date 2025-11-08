# Job Flow

Job Flow is a scalable job import system that pulls data from external APIs, queues jobs using Redis, imports them into MongoDB using worker processes, and provides a screen to view Import History Tracking.

## Core Features

- **Job Source Integration**: Fetch jobs from multiple sources (e.g., Jobicy, HigherEdJobs) via XML feeds.
- **Queue-Based Processing**: Use BullMQ and Redis to manage a robust background job queue, ensuring reliable and scalable job processing.
- **Import History Tracking**: Log detailed statistics for each import run, including total jobs fetched, imported, new, updated, and failed.
- **Optional Enhancements**:
    - Real-time updates with Socket.IO.
    - Configurable batch processing and concurrency.
    - Automatic retry logic with exponential backoff for failed jobs.

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Queue**: BullMQ with Redis

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Redis

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/job-flow.git
   cd job-flow
   ```

2. **Install backend dependencies**:

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**:

   ```bash
   cd ../client
   npm install
   ```

### Configuration

1. **Backend**: Create a `.env` file in the `server` directory and add the following environment variables:

   ```
   MONGO_URI=your-mongodb-connection-string
   REDIS_HOST=your-redis-host
   REDIS_PORT=your-redis-port
   ```

### Running the Application

1. **Start the backend server**:

   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**:

   ```bash
   cd client
   npm run dev
   ```

## Usage

- The application will be available at `http://localhost:3000`.
- The backend server will be running at `http://localhost:5000`.
- To view the import history, navigate to `http://localhost:3000/import-history`.

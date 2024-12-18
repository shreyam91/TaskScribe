# Todoist Web App Clone

This project is a clone of the popular Todoist web application, built using modern web technologies. The app allows users to create, manage, and track their daily tasks and schedules. It includes features such as task creation, task completion, task deletion, and organizing tasks into different categories based on projects and priorities.

## Features

- **User Authentication**: Secure login and registration using Auth.js
- **Task Management**: Create, update, and delete tasks
- **Task Categorization**: Organize tasks by projects and priorities
- **Real-Time Updates**: Data is synchronized across the app in real time using the backend powered by Convex
- **Responsive UI**: Mobile-friendly design using Next.js and React

## Tech Stack

- **Frontend**: 
  - **Next.js**: Framework for building the user interface with server-side rendering and static site generation
  - **React**: Core library for building user interface components
  - **CSS**: For styling (you can use SCSS, Tailwind CSS, or traditional CSS)
  
- **Backend**:
  - **Express.js**: Node.js framework to handle API requests and server-side logic
  - **Convex**: Backend platform for managing data, handling business logic, and providing real-time updates

- **Authentication**: 
  - **Auth.js**: For secure authentication and user sessions
  
- **Database**:
  - **Convex**: Used for task storage, user management, and synchronization across devices

## Getting Started

Follow the steps below to get this project running on your local machine.

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:

   ```bash
  [ git clone https://github.com/yourusername/todoist-clone.git
   cd todoist-clone](https://github.com/shreyam91/TaskScribe.git)
   ```

2. **Install dependencies**:

   For the frontend:
   ```bash
   cd client
   npm install
   ```

   For the backend:
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**:

   - Create a `.env` file in both the `client` (Next.js frontend) and `server` (Express backend) directories.
   - Add the necessary API keys, database configurations, and Auth.js credentials. Example:

   ```env
   REACT_APP_AUTH_KEY=your_auth_key
   AUTH_SECRET=your_secret_key
   CONVEX_API_KEY=your_convex_api_key
   ```

4. **Run the development server**:

   - To run the frontend (Next.js app):

     ```bash
     cd client
     npm run dev
     ```

   - To run the backend (Express server):

     ```bash
     cd server
     npm start
     ```

5. **Access the app**:

   Once both the frontend and backend servers are running, you can access the application at:

   ```
   http://localhost:3000
   ```

## Usage

1. **User Registration/Login**:
   - Upon accessing the app, users can register for a new account or log in to an existing one.
   - Authentication is handled securely using Auth.js.

2. **Create and Manage Tasks**:
   - Users can create tasks by providing a description, due date, and priority level.
   - Tasks can be marked as completed, updated, or deleted.
   - Tasks are stored and synchronized with the backend.

3. **Organize Tasks**:
   - Users can group tasks into different projects for better organization.
   - Tasks can also be filtered based on priority or due date.


## Contributing

Contributions are welcome! If you'd like to contribute to this project, follow these steps:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push your changes to your fork
5. Create a pull request explaining your changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Todoist** for the inspiration behind this app
- **Next.js** for the framework used to build the frontend
- **Auth.js** for handling authentication securely
- **Convex** for backend-as-a-service to handle data management and real-time updates

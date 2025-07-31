# Michat - Real-time Chat Application

<div align="center">
  <img src="Frontend/public/MichatLogo.png" alt="Michat Logo" width="200"/>
  <br/>
  <p><strong>A modern real-time chat application built with React, Node.js, and Socket.IO</strong></p>
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Socket.IO Events](#-socketio-events)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & User Management

- **User Registration & Login**: Secure authentication with JWT tokens
- **Profile Management**: Update profile information and avatar
- **Password Security**: Bcrypt hashing for secure password storage
- **Session Management**: Cookie-based authentication

### 💬 Real-time Messaging

- **Instant Messaging**: Real-time message delivery using Socket.IO
- **Multi-tab Support**: Users can open multiple tabs and receive messages on all tabs
- **Message Types**: Support for text messages and image sharing
- **Online Status**: Real-time online/offline user status
- **Message History**: Persistent message storage in MongoDB

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Themes**: Multiple theme options with DaisyUI
- **Loading States**: Skeleton loading components for better UX
- **Toast Notifications**: User-friendly notifications with react-hot-toast
- **Modern Icons**: Lucide React icons for consistent design

### 🛠️ Technical Features

- **State Management**: Zustand for efficient state management
- **Image Upload**: Cloudinary integration for profile pictures
- **Real-time Updates**: Socket.IO for instant communication
- **RESTful API**: Clean and well-structured API endpoints
- **Error Handling**: Comprehensive error handling and validation

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Component library for TailwindCSS
- **React Router DOM** - Client-side routing
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Cloud image storage
- **Cookie Parser** - Cookie parsing middleware
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
Michat/
├── Frontend/                 # React frontend application
│   ├── public/              # Static assets
│   │   ├── MichatLogo.png   # Application logo
│   │   └── avatar.png       # Default avatar
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   ├── AuthImagePattern.jsx
│   │   │   └── skeletons/   # Loading skeleton components
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── stores/          # Zustand state stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useThemeStore.js
│   │   ├── libs/            # Utility libraries
│   │   │   ├── axios.js
│   │   │   └── utils.js
│   │   ├── constants/       # Application constants
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # Application entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── tailwind.config.js   # TailwindCSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   └── vite.config.js       # Vite configuration
├── Backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   └── message.controller.js
│   │   ├── models/          # MongoDB models
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   └── message.route.js
│   │   ├── middlewares/     # Express middlewares
│   │   │   └── auth.middleware.js
│   │   ├── libs/            # Utility libraries
│   │   │   ├── db.js        # Database connection
│   │   │   ├── socket.js    # Socket.IO configuration
│   │   │   ├── cloudinary.js # Cloudinary configuration
│   │   │   └── utils.js     # Utility functions
│   │   ├── seeds/           # Database seeders
│   │   │   └── user.seed.js
│   │   └── index.js         # Server entry point
│   └── package.json
└── README.md
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Michat
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

### 4. Environment Setup

Create a `.env` file in the Backend directory:

```bash
cd ../Backend
touch .env
```

Add the following environment variables to your `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

## 🔧 Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `PORT`                  | Backend server port                  | Yes      |
| `MONGODB_URI`           | MongoDB connection string            | Yes      |
| `JWT_SECRET`            | Secret key for JWT tokens            | Yes      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                   | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                | Yes      |
| `NODE_ENV`              | Environment (development/production) | No       |

## 🎯 Usage

### Development Mode

1. **Start Backend Server**

   ```bash
   cd Backend
   npm run dev
   ```

   The backend will start on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### Production Mode

1. **Build Frontend**

   ```bash
   cd Frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd Backend
   npm start
   ```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| `POST` | `/signup`         | Register a new user         |
| `POST` | `/login`          | User login                  |
| `POST` | `/logout`         | User logout                 |
| `GET`  | `/check`          | Check authentication status |
| `PUT`  | `/update-profile` | Update user profile         |

### Message Routes (`/api/messages`)

| Method | Endpoint    | Description                     |
| ------ | ----------- | ------------------------------- |
| `GET`  | `/users`    | Get users for sidebar           |
| `GET`  | `/:id`      | Get messages with specific user |
| `POST` | `/send/:id` | Send message to user            |

## 🔄 Socket.IO Events

### Client to Server Events

| Event        | Description                  |
| ------------ | ---------------------------- |
| `connection` | User connects to socket      |
| `disconnect` | User disconnects from socket |

### Server to Client Events

| Event            | Description                 |
| ---------------- | --------------------------- |
| `getOnlineUsers` | Broadcast online users list |
| `newMessage`     | New message received        |
| `messageSent`    | Message sent confirmation   |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Socket.IO](https://socket.io/) - Real-time bidirectional communication
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Component library for TailwindCSS
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Cloudinary](https://cloudinary.com/) - Cloud image management

---

<div align="center">
  <p>Made with ❤️ by [Your Name]</p>
  <p>If you find this project helpful, please give it a ⭐</p>
</div>

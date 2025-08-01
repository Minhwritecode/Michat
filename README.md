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

### 👥 Advanced Group Chats

- **Group Management**: Create, edit, and manage groups with different privacy levels
- **Member Management**: Add/remove members, assign roles (Owner/Admin/Member)
- **Chat Permissions**: Admin can control who can chat in the group (like Zalo)
- **Private Messages**: Send direct messages to specific members within groups
- **Invite System**: Generate and share invite codes for group access
- **Privacy Levels**: Public, Private, and Read-only group types
- **Polls & Surveys**: Create interactive polls with multiple options and real-time results
- **Location Sharing**: Share current location with live tracking capabilities
- **End-to-End Encryption**: Secure message encryption for privacy protection

### 🤖 AI/Bot Integration

- **Chatbot Support**: Integrate chatbots for FAQs, information, or simple tasks
- **Smart Suggestions**: Provide quick replies, emoji, or GIF suggestions based on conversation context
- **Auto-Translate**: Automatically translate messages to the recipient's language

### 📊 Polls & Surveys

- **Interactive Polls**: Create polls with multiple options and real-time voting
- **Anonymous Voting**: Option for anonymous poll responses
- **Poll Results**: Real-time display of poll results with percentages
- **Poll Expiration**: Set expiration dates for polls
- **Multiple Choice**: Support for single or multiple choice questions

### 📍 Location Sharing

- **Current Location**: Share your current location with precise coordinates
- **Live Location**: Real-time location tracking with periodic updates
- **Location History**: View shared location history
- **Nearby Places**: Find and share nearby places of interest
- **Reverse Geocoding**: Convert coordinates to readable addresses

### 🔒 End-to-End Encryption (E2EE)

- **Message Encryption**: AES-256-GCM encryption for message content
- **Key Exchange**: RSA asymmetric encryption for secure key exchange
- **Session Keys**: Unique session keys for each conversation
- **Integrity Verification**: Message integrity checks to prevent tampering
- **Fingerprint Verification**: Verify encryption keys to prevent man-in-the-middle attacks

### 🖥️ Screen Sharing

- **Video Call Integration**: Screen sharing during video calls
- **Multiple Streams**: Share screen while maintaining video/audio
- **Quality Control**: Adjustable screen sharing quality
- **Collaboration**: Perfect for presentations and remote collaboration

### 🔗 Third-Party Integrations

- **Google Drive**: Share files directly from Google Drive
- **Trello**: Create and manage Trello tasks from chat
- **Dropbox**: Share files from Dropbox storage
- **Calendar Integration**: Connect with calendar services
- **Task Management**: Integrate with project management tools

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

- **React 18** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Component library for TailwindCSS
- **React Router DOM** - Client-side routing
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **React Icons** - Icon library for third-party integrations
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
- **Axios** - HTTP client for third-party APIs
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
│   │   │   ├── groups/      # Group chat components
│   │   │   │   ├── GroupCard.jsx
│   │   │   │   ├── GroupList.jsx
│   │   │   │   ├── GroupChat.jsx
│   │   │   │   ├── CreateGroupModal.jsx
│   │   │   │   ├── JoinGroupModal.jsx
│   │   │   │   └── GroupMembersModal.jsx
│   │   │   ├── polls/       # Poll components
│   │   │   │   ├── CreatePollModal.jsx
│   │   │   │   └── PollCard.jsx
│   │   │   ├── location/    # Location sharing components
│   │   │   │   └── LocationShare.jsx
│   │   │   ├── bot/         # AI/Bot components
│   │   │   │   ├── BotModal.jsx
│   │   │   │   └── SmartSuggestions.jsx
│   │   │   ├── integrations/ # Third-party integrations
│   │   │   │   ├── GoogleDrivePicker.jsx
│   │   │   │   ├── TrelloTaskModal.jsx
│   │   │   │   ├── DropboxChooser.jsx
│   │   │   │   └── IntegrationsMenu.jsx
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
│   │   │   ├── useGroupStore.js
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
│   │   │   ├── message.controller.js
│   │   │   ├── group.controller.js
│   │   │   ├── poll.controller.js
│   │   │   ├── location.controller.js
│   │   │   ├── bot.controller.js
│   │   │   ├── translate.controller.js
│   │   │   └── trello.controller.js
│   │   ├── models/          # MongoDB models
│   │   │   ├── user.model.js
│   │   │   ├── message.model.js
│   │   │   ├── group.model.js
│   │   │   ├── poll.model.js
│   │   │   ├── location.model.js
│   │   │   └── e2ee.model.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   ├── group.route.js
│   │   │   ├── poll.route.js
│   │   │   ├── location.route.js
│   │   │   ├── bot.route.js
│   │   │   ├── translate.route.js
│   │   │   └── trello.route.js
│   │   ├── middlewares/     # Express middlewares
│   │   │   └── auth.middleware.js
│   │   ├── libs/            # Utility libraries
│   │   │   ├── db.js        # Database connection
│   │   │   ├── socket.js    # Socket.IO configuration
│   │   │   ├── cloudinary.js # Cloudinary configuration
│   │   │   ├── encryption.js # E2EE encryption utilities
│   │   │   └── utils.js     # Utility functions
│   │   ├── seeds/           # Database seeders
│   │   │   └── user.seed.js
│   │   └── index.js         # Server entry point
│   ├── env.example          # Environment variables example
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

Copy the example environment file and configure it:

```bash
cd ../Backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/michat

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google API Configuration
GOOGLE_API_KEY=AIzaSyDhZEf5a3dyl_jGj1VzpltW8dKCtMnHZr4
GOOGLE_CLIENT_ID=180701485288-5qsb0tdlk7p81jkcjn7u27eqnldeuhf3.apps.googleusercontent.com

# Trello API Configuration
TRELLO_API_KEY=deee5b70e3eeaa8efc1d25aad105f5b1
TRELLO_TOKEN=your_trello_token_here

# Dropbox API Configuration
DROPBOX_APP_KEY=rpbboqvx38917ce
DROPBOX_APP_SECRET=your_dropbox_app_secret_here

# AI/Translation APIs (Optional)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
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
| `GOOGLE_API_KEY`        | Google API key for Drive integration | No       |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID               | No       |
| `TRELLO_API_KEY`        | Trello API key                       | No       |
| `TRELLO_TOKEN`          | Trello API token                     | No       |
| `DROPBOX_APP_KEY`       | Dropbox app key                      | No       |
| `DROPBOX_APP_SECRET`    | Dropbox app secret                   | No       |
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

### Third-Party Integrations

#### Google Drive Integration
1. Click the integrations menu (three dots) in the message input
2. Select "Google Drive"
3. Choose files from your Google Drive
4. Files will be shared as links in the chat

#### Trello Integration
1. Click the integrations menu in the message input
2. Select "Trello"
3. Fill in task details (title, description, due date, labels)
4. Create the task directly from chat

#### Dropbox Integration
1. Click the integrations menu in the message input
2. Select "Dropbox"
3. Choose files from your Dropbox
4. Files will be shared as links in the chat

### Group Chat Features

#### Creating Groups
1. Navigate to Groups page
2. Click "Create New Group"
3. Fill in group name, description, and privacy settings
4. Upload group avatar (optional)
5. Click "Create Group"

#### Managing Members
1. Open a group chat
2. Click the Users icon to open member management
3. Use the three-dot menu for each member to:
   - Promote to Admin
   - Demote to Member
   - Toggle chat permission (like Zalo)
   - Send private message
   - Remove from group

#### Chat Permissions
- **Admin Control**: Admins can toggle chat permission for individual members
- **Visual Indicators**: Members with chat disabled show "Bị cấm chat" badge
- **Input Disabled**: Chat input is disabled for members without permission
- **Permission Check**: System validates chat permission before sending messages

#### Privacy Levels
- **Public**: Anyone can find and join
- **Private**: Only members can see and join via invite
- **Read-only**: Members can only view messages

#### Invite System
1. Generate invite code in group settings
2. Share code with others
3. Others can join using "Join Group" feature

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

### Group Routes (`/api/groups`)

| Method | Endpoint                                    | Description                           |
| ------ | ------------------------------------------- | ------------------------------------- |
| `POST` | `/create`                                   | Create a new group                    |
| `GET`  | `/my-groups`                                | Get user's groups                     |
| `GET`  | `/:groupId`                                 | Get group details                     |
| `PUT`  | `/:groupId`                                 | Update group information              |
| `DELETE` | `/:groupId`                                | Delete group                          |
| `GET`  | `/:groupId/members`                         | Get group members                     |
| `POST` | `/:groupId/members`                         | Add members to group                  |
| `DELETE` | `/:groupId/members/:memberId`              | Remove member from group              |
| `PUT`  | `/:groupId/members/:memberId/role`         | Update member role                    |
| `PUT`  | `/:groupId/members/:memberId/chat`         | Toggle member chat permission         |
| `POST` | `/join`                                     | Join group by invite code             |
| `POST` | `/:groupId/leave`                           | Leave group                           |
| `POST` | `/:groupId/invite-code`                     | Generate new invite code              |

### Poll Routes (`/api/polls`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/create`                   | Create a new poll              |
| `GET`  | `/:pollId`                  | Get poll details               |
| `POST` | `/:pollId/vote`             | Vote on a poll                 |
| `PUT`  | `/:pollId/close`            | Close a poll                   |
| `DELETE` | `/:pollId`                 | Delete a poll                  |

### Location Routes (`/api/location`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/share`                    | Share current location         |
| `GET`  | `/history`                  | Get location history           |
| `GET`  | `/nearby`                   | Find nearby places             |
| `POST` | `/live/start`               | Start live location sharing    |
| `POST` | `/live/stop`                | Stop live location sharing     |

### Bot Routes (`/api/bot`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/ask`                      | Ask AI chatbot                 |
| `POST` | `/suggest`                  | Get smart suggestions          |

### Translate Routes (`/api/translate`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/translate`                | Translate message              |

### Trello Routes (`/api/trello`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/create-task`              | Create Trello task             |
| `GET`  | `/boards`                   | Get user's Trello boards       |
| `GET`  | `/boards/:boardId/lists`    | Get lists in a board           |

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
- [Google Drive API](https://developers.google.com/drive) - File storage integration
- [Trello API](https://developer.atlassian.com/cloud/trello/) - Task management integration
- [Dropbox API](https://www.dropbox.com/developers) - File storage integration

---

<div align="center">
  <p>Made with ❤️ by [Đinh Trần Tiến Minh]</p>
  <p>If you find this project helpful, please give it a ⭐</p>
</div>

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
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & User Management

- **User Registration & Login**: Secure authentication with JWT tokens
- **Profile Management**: Update profile information and avatar
- **Password Security**: Bcrypt hashing for secure password storage
- **Session Management**: Cookie-based authentication
- **Nickname System**: Personal and group member nicknames with editing capability
- **User Labels**: Categorize users as family, friends, or strangers
- **User Blocking**: Block/unblock users to prevent unwanted interactions
- **Conversation Management**: Delete conversations with confirmation
- **Notification Control**: Mute/unmute notifications for specific users
- **User Information Sidebar**: View detailed user info, shared media, and conversation stats
- **Quick Actions**: Call, video call, and message actions directly from user profile

### 💬 Real-time Messaging

- **Instant Messaging**: Real-time message delivery using Socket.IO
- **Multi-tab Support**: Users can open multiple tabs and receive messages on all tabs
- **Message Types**: Support for text, images, videos, audio, documents, and GIFs
- **Online Status**: Real-time online/offline user status
- **Message History**: Persistent message storage in MongoDB
- **Draft Messages**: Auto-save and restore unsent messages when switching conversations
- **Message Reactions**: React to messages with emojis (like, love, laugh, etc.)
- **Message Forwarding**: Forward messages to other users or groups
- **Message Search**: Search through conversation history
- **Message Translation**: Translate messages to different languages
- **Message Pinning**: Pin important messages
- **Message Editing**: Edit sent messages (own messages only)
- **Message Deletion**: Delete messages with confirmation
- **Read Receipts**: See when messages are read by recipients with avatar display
- **Typing Indicators**: Real-time typing status
- **Pinned Chats**: Pin user or group conversations to the top regardless of last message time
- **Draft Messages**: Auto-save and restore unsent messages when switching conversations
- **Message Reactions**: React to messages with emojis (like, love, laugh, etc.)
- **Message Forwarding**: Forward messages to other users or groups
- **Message Search**: Search through conversation history
- **Message Translation**: Translate messages to different languages
- **Message Pinning**: Pin important messages
- **Message Editing**: Edit sent messages (own messages only)
- **Message Deletion**: Delete messages with confirmation
- **Read Receipts**: See when messages are read by recipients with avatar display
- **Typing Indicators**: Real-time typing status

### 🎨 Advanced Message Features

- **Emotional Themes**: Select emotional themes for messages (happy, love, sad, angry, etc.)
- **Smart Suggestions**: AI-powered message suggestions, emoji, GIF, and sticker recommendations
- **Emoji/GIF/Sticker Picker**: Interactive picker with search and categories
- **Voice Messages**: Record and send voice messages
- **File Attachments**: Upload and share various file types
- **Link Previews**: Automatic link previews for shared URLs
- **Reply System**: Reply to specific messages with preview
- **Message Context Menu**: Right-click for message actions

### 👥 Advanced Group Chats

- **Group Management**: Create, edit, and manage groups with different privacy levels
- **Member Management**: Add/remove members, assign roles (Owner/Admin/Member)
- **Chat Permissions**: Admin can control who can chat in the group (like Zalo)
- **Private Messages**: Send direct messages to specific members within groups
- **Invite System**: Generate and share invite codes for group access
- **Privacy Levels**: Public, Private, and Read-only group types
- **Group Nicknames**: Set and edit nicknames for group members
- **Member Status**: Track member activity and permissions
- **Advanced Typing Indicators**: In group list and in group header, show up to 2–3 members currently typing

### 📊 Polls & Surveys

- **Interactive Polls**: Create polls with multiple options and real-time voting
- **Anonymous Voting**: Option for anonymous poll responses
- **Poll Results**: Real-time display of poll results with percentages
- **Poll Expiration**: Set expiration dates for polls
- **Multiple Choice**: Support for single or multiple choice questions
- **Poll Management**: Create, edit, and delete polls
- **In-Chat Poll Cards**: Newly created group polls appear directly inside the group message timeline

### 📍 Location Sharing

- **Current Location**: Share your current location with precise coordinates
- **Live Location**: Real-time location tracking with periodic updates
- **Location History**: View shared location history
- **Nearby Places**: Find and share nearby places of interest
- **Reverse Geocoding**: Convert coordinates to readable addresses
- **Location Privacy**: Control location sharing permissions

### 🎉 Daily Birthday Announcements

- **Cron-triggered Broadcast**: An internal endpoint can be invoked daily to detect birthdays (matching day/month) and broadcast a `notification:new` to everyone

### 📖 Story System

- **Story Creation**: Create stories with text and media content
- **Story Viewing**: View stories from all users in horizontal carousel
- **Story Reactions**: React to stories with emojis
- **Story Replies**: Reply to stories with text
- **Story Management**: View and delete your own stories
- **Story Expiration**: Stories automatically expire after 24 hours
- **Story History**: Browse your story history in Settings page

### 🤖 AI/Bot Integration

- **Chatbot Support**: Integrate chatbots for FAQs, information, or simple tasks
- **Smart Suggestions**: Provide quick replies, emoji, or GIF suggestions based on conversation context
- **Auto-Translate**: Automatically translate messages to the recipient's language
- **AI Assistant**: AI-powered chat assistant for help and information
- **AI Assistant**: AI-powered chat assistant for help and information

### 🎥 Video Calling

- **Voice Calls**: Make voice calls to other users
- **Video Calls**: Make video calls with camera and microphone
- **Screen Sharing**: Share screen during video calls
- **Call Controls**: Mute/unmute, enable/disable video, end call
- **Call Notifications**: Incoming call notifications with accept/reject options
- **WebRTC Integration**: Peer-to-peer communication for better quality

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
- **Smooth Animations**: CSS animations and transitions for better UX
- **Glassmorphism**: Modern glass-like UI effects
- **Gradient Backgrounds**: Beautiful gradient backgrounds and effects

### 🛠️ Technical Features

- **State Management**: Zustand for efficient state management
- **Image Upload**: Cloudinary integration for profile pictures and media
- **Real-time Updates**: Socket.IO for instant communication
- **RESTful API**: Clean and well-structured API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Draft Persistence**: LocalStorage for draft message persistence
- **Message Encryption**: Optional end-to-end encryption
- **File Validation**: File type and size validation for uploads

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
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library for third-party integrations

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
- **Cron-friendly Endpoints** - Internal routes to support scheduled tasks (e.g., birthday broadcast)

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
│   │   │   ├── chat/        # Chat components
│   │   │   │   ├── ChatContainer.jsx
│   │   │   │   └── ChatHeader.jsx
│   │   │   ├── messages/    # Message components
│   │   │   │   ├── Message.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   ├── MessageSearch.jsx
│   │   │   │   ├── MessageForward.jsx
│   │   │   │   ├── EmotionSelector.jsx
│   │   │   │   └── EmojiGifStickerSuggest.jsx
│   │   │   ├── groups/      # Group chat components
│   │   │   │   ├── GroupCard.jsx
│   │   │   │   ├── GroupList.jsx
│   │   │   │   ├── GroupChat.jsx
│   │   │   │   ├── CreateGroupModal.jsx
│   │   │   │   ├── JoinGroupModal.jsx
│   │   │   │   └── GroupMembersModal.jsx
│   │   │   ├── stories/     # Story components
│   │   │   │   ├── StoryFeed.jsx
│   │   │   │   ├── StoryHistory.jsx
│   │   │   │   ├── CreateStoryModal.jsx
│   │   │   │   ├── Story.jsx
│   │   │   │   └── StoryList.jsx
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
│   │   │   ├── video/       # Video call components
│   │   │   │   ├── VideoCall.jsx
│   │   │   │   └── ScreenShareButton.jsx
│   │   │   ├── emoji/       # Emoji components
│   │   │   │   ├── EmojiPicker.jsx
│   │   │   │   └── GifPicker.jsx
│   │   │   ├── skeletons/   # Loading skeleton components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── UserInfoSidebar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   ├── CallModal.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── LinkPreview.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── GroupsPage.jsx
│   │   ├── stores/          # Zustand state stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   ├── useGroupStore.js
│   │   │   ├── useThemeStore.js
│   │   │   └── useDraftStore.js
│   │   ├── libs/            # Utility libraries
│   │   │   ├── axios.js
│   │   │   ├── utils.js
│   │   │   └── webrtc.js
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
│   │   │   ├── story.controller.js
│   │   │   └── trello.controller.js
│   │   ├── models/          # MongoDB models
│   │   │   ├── user.model.js
│   │   │   ├── message.model.js
│   │   │   ├── group.model.js
│   │   │   ├── poll.model.js
│   │   │   ├── location.model.js
│   │   │   ├── story.model.js
│   │   │   └── e2ee.model.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   ├── group.route.js
│   │   │   ├── poll.route.js
│   │   │   ├── location.route.js
│   │   │   ├── story.route.js
│   │   │   └── trello.route.js
│   │   ├── middlewares/     # Express middlewares
│   │   │   └── auth.middleware.js
│   │   ├── libs/            # Utility libraries
│   │   │   ├── db.js        # Database connection
│   │   │   ├── socket.js    # Socket.IO configuration
│   │   │   ├── cloudinary.js # Cloudinary configuration
│   │   │   ├── encryption.js # E2EE encryption utilities
│   │   │   ├── linkPreview.js # Link preview utilities
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
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/michat

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google API Configuration
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CLIENT_ID=your_google_client_id

# Trello API Configuration
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token_here

# Dropbox API Configuration
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret_here

# AI/Translation APIs (Optional)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
```

## 🔧 Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `PORT`                  | Backend server port                  | Yes      |
| `NODE_ENV`             | Environment (development/production) | No       |
| `FRONTEND_URL`         | Frontend URL for CORS               | Yes      |
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

## 🎯 Usage

### Development Mode

1. **Start Backend Server**

   ```bash
   cd Backend
   npm run dev
   ```

   The backend will start on `http://localhost:5001`

2. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### Key Features Usage

#### Draft Messages
- Start typing a message → automatically saved as draft
- Switch to another user → draft preview shown in sidebar
- Return to user → draft automatically restored
- Send message → draft automatically cleared

#### Message Interactions
- **Right-click message** → Context menu with options
- **Reply** → Click reply preview to scroll to original message
- **React** → Click heart icon to add reactions
- **Forward** → Select multiple users/groups to forward
- **Edit** → Edit your own messages
- **Delete** → Delete your own messages with confirmation

#### Smart Features
- **Type `:` or `@` or `#`** → Emoji/GIF/Sticker suggestions
- **Emotional themes** → Select emotion for message styling
- **Voice messages** → Record and send voice notes
- **File uploads** → Drag & drop or click to upload

#### Group Management
- **Create groups** → Set privacy levels and permissions
- **Member management** → Add/remove, change roles, toggle chat permissions
- **Invite system** → Generate and share invite codes
- **Private messages** → Send direct messages within groups
 - **Pinned Groups** → Click pin icon on a group card to keep it on top of your group list
 - **Group Typing Indicators** → See up to 2–3 members typing in list and in chat header

#### Polls in Group Chat
- Create a poll in a group via the + menu in the message input
- The poll is posted as a message card in the chat timeline automatically
- Members can vote in-place; results update accordingly

#### Story System
- **Create stories** → Add text and media content
- **View stories** → Horizontal carousel on homepage
- **Story reactions** → React with emojis
- **Story replies** → Reply to stories
- **Story history** → View your stories in Settings

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
| `PUT`  | `/nickname`       | Update user nickname        |
| `PUT`  | `/label/:userId`  | Update user label           |
| `PUT`  | `/nickname`       | Update user nickname        |
| `PUT`  | `/label/:userId`  | Update user label           |

### Message Routes (`/api/messages`)

| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| `GET`  | `/users`          | Get users for sidebar           |
| `GET`  | `/:id`            | Get messages with specific user |
| `POST` | `/send/:id`       | Send message to user            |
| `POST` | `/reaction/:id`   | Add reaction to message         |
| `PUT`  | `/pin/:id`        | Pin/unpin message               |
| `PUT`  | `/edit/:id`       | Edit message                    |
| `DELETE` | `/:id`           | Delete message                  |
| `POST` | `/forward`        | Forward message to users/groups |
| `PUT`  | `/:messageId/read` | Mark message as read           |
| `GET`  | `/:messageId/read-receipts` | Get read receipts for message |
| `PUT`  | `/:senderId/mark-all-read` | Mark all messages from user as read |
| `POST` | `/reaction/:id`   | Add reaction to message         |
| `PUT`  | `/pin/:id`        | Pin/unpin message               |
| `PUT`  | `/edit/:id`       | Edit message                    |
| `DELETE` | `/:id`           | Delete message                  |
| `POST` | `/forward`        | Forward message to users/groups |

### Group Routes (`/api/groups`)

| Method | Endpoint                                    | Description                           |
| ------ | ------------------------------------------- | ------------------------------------- |
| `POST` | `/`                                         | Create a new group                    |
| `GET`  | `/my-groups`                                | Get user's groups                     |
| `GET`  | `/:groupId`                                 | Get group details                     |
| `PUT`  | `/:groupId`                                 | Update group information              |
| `DELETE` | `/:groupId`                                | Delete group                          |
| `GET`  | `/:groupId/members`                         | Get group members                     |
| `POST` | `/:groupId/members`                         | Add members to group                  |
| `DELETE` | `/:groupId/members/:memberId`              | Remove member from group              |
| `PUT`  | `/:groupId/members/:memberId/role`         | Update member role                    |
| `PUT`  | `/:groupId/members/:memberId/chat`         | Toggle member chat permission         |
| `PUT`  | `/:groupId/nickname/:userId`               | Update member nickname                |
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

### Internal Cron Routes (server-only)

| Method | Endpoint                 | Description                            |
| ------ | ------------------------ | -------------------------------------- |
| `POST` | `/internal/cron/birthdays` | Trigger daily birthday broadcast       |

### Location Routes (`/api/location`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/share`                    | Share current location         |
| `GET`  | `/history`                  | Get location history           |
| `GET`  | `/nearby`                   | Find nearby places             |
| `POST` | `/live/start`               | Start live location sharing    |
| `POST` | `/live/stop`                | Stop live location sharing     |

### Story Routes (`/api/story`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/`                         | Create a new story             |
| `GET`  | `/`                         | Get all stories                |
| `GET`  | `/my-stories`               | Get user's stories             |
| `DELETE` | `/:storyId`                | Delete story                   |
| `POST` | `/:storyId/react`           | React to story                 |
| `POST` | `/:storyId/reply`           | Reply to story                 |

### Story Routes (`/api/story`)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/`                         | Create a new story             |
| `GET`  | `/`                         | Get all stories                |
| `GET`  | `/my-stories`               | Get user's stories             |
| `DELETE` | `/:storyId`                | Delete story                   |
| `POST` | `/:storyId/react`           | React to story                 |
| `POST` | `/:storyId/reply`           | Reply to story                 |

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

| Event               | Description                                   |
| ------------------- | --------------------------------------------- |
| `getOnlineUsers`    | Broadcast online users list                   |
| `typing:direct`     | Direct chat typing indicator                  |
| `typing:group`      | Group typing indicator (clients filter by id) |
| `notification:new`  | Generic notifications (e.g., birthdays)       |
| `call:incoming`     | WebRTC signaling (incoming call)              |
| `call:answer`       | WebRTC signaling (answer)                     |
| `call:ice-candidate`| WebRTC signaling (ICE candidate)              |
| `call:end`          | WebRTC signaling (end)                        |

## 🚀 Deployment

### Render Deployment

1. **Backend Deployment**
   - Connect your GitHub repository to Render
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

2. **Frontend Deployment**
   - Set build command: `npm run build`
   - Set start command: `npm run preview`
   - Add environment variables

### Environment Variables for Production

```env
# Backend
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_jwt_secret

# Frontend
VITE_API_URL=https://your-backend-url.onrender.com
```

### Scheduling Daily Birthday Announcements

Use any scheduler (Render Cron, GitHub Actions, crontab) to call the internal endpoint once per day:

```bash
curl -X POST https://your-backend-url/internal/cron/birthdays
```

This triggers a scan for users whose DOB matches today (day/month) and broadcasts a `notification:new` to all connected clients.

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
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [Lucide React](https://lucide.dev/) - Beautiful icons

---

<div align="center">
  <p>Made with ❤️ by [Đinh Trần Tiến Minh]</p>
  <p>If you find this project helpful, please give it a ⭐</p>
</div>

# Broconnect - Real-time Language Learning Chat Platform

<div align="center">Connect with language learners worldwide and practice languages through real-time conversations, group chats, and code collaboration.</div>

<div align="center">
  
[![last commit](https://img.shields.io/badge/last%20commit-January%202025-blue)](https://github.com/yourusername/realtimechat-v3)
[![languages](https://img.shields.io/badge/languages-JavaScript-blue)](https://github.com/yourusername/realtimechat-v3)

</div>

<div align="center">Built with modern technologies:</div>

<div align="center">
  
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

<div align="center">
  
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Stream Chat](https://img.shields.io/badge/Stream_Chat-005FF9?style=for-the-badge&logo=stream&logoColor=white)](https://getstream.io/)
[![Stream Video](https://img.shields.io/badge/Stream_Video-005FF9?style=for-the-badge&logo=stream&logoColor=white)](https://getstream.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

<div align="center">
  
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

## Screenshots

![Home Page](./image/homepage.png?v=2)
*Home Interface - Find language learning partners*

![Sign Up](./image/createaccountpage.png?v=2)
*User Registration Interface*

![Sign In](./image/loginpage.png?v=2)
*User Login Interface*

![Complete Profile](./image/completeprofilepage.png?v=2)
*Profile Setup - Set native and learning languages*

![Chat Interface](./image/chatpage.png?v=2)
*Real-time Chat Interface with Stream Chat*

![Notifications](./image/notificationspage.png?v=2)
*Friend Requests and Notifications*

![Call Interface](./image/callapp.png?v=2)
*Video Calling with Stream Video SDK*

![Group Chat Interface](./image/groupchat.png?v=2)
*Group Chat Management*

![Group Chat Detail Interface](./image/groupchatdetail.png?v=2)
*Group Chat Conversation View*

![Manage Group Chat Interface](./image/ManageGroup.png?v=2)
*Group Administration and Member Management*

![Call & Streaming Interface](./image/CallandSharingScreeninGroup.png?v=2)
*Group Video Calls with Screen Sharing*

![Code Playground](./image/Codeplayground.png?v=2)
*Collaborative Code Editor with Monaco Editor*

## About Broconnect

Broconnect is a comprehensive language learning platform that connects people from around the world to practice languages together. The platform combines real-time messaging, video calls, group conversations, and collaborative coding to create an immersive language learning experience.

### Key Features

1. **Language-focused Matching**: Connect with native speakers and learners based on language preferences
2. **Real-time Messaging**: Instant messaging with typing indicators and message persistence
3. **Group Conversations**: Create and manage language learning groups
4. **Video Calling**: High-quality video calls for pronunciation practice
5. **Friend System**: Send/accept friend requests with real-time notifications
6. **Code Collaboration**: Practice programming languages together with Monaco Editor
7. **Profile Management**: Comprehensive user profiles with language preferences
8. **Responsive Design**: Works seamlessly on desktop and mobile devices
9. **Theme Support**: Multiple UI themes for personalized experience
10. **Real-time Notifications**: Instant updates for friend requests and messages

## Technology Stack

### Frontend (React 19 + Vite)
- **Framework**: React 19 with modern hooks
- **Styling**: Tailwind CSS with DaisyUI components
- **State Management**: Zustand for global state, React Query for server state
- **Real-time Chat**: Stream Chat React SDK
- **Video Calls**: Stream Video React SDK
- **Code Editor**: Monaco Editor for collaborative coding
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite for fast development and building

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Real-time**: Socket.IO for friend requests and notifications
- **File Upload**: Multer for profile picture uploads
- **Security**: bcryptjs for password hashing
- **API Integration**: Stream Chat and Video server-side SDKs

### External Services
- **Stream Chat**: Powers real-time messaging and chat features
- **Stream Video**: Handles video calling and screen sharing
- **MongoDB Atlas**: Cloud database hosting
- **Avatar Service**: iran.liara.run for default profile pictures

## Project Structure

```
broconnect/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   ├── Sidebar.jsx     # Application sidebar
│   │   │   ├── SocketProvider.jsx # Socket.IO context
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.jsx    # Main dashboard
│   │   │   ├── ChatPage.jsx    # Private chat interface
│   │   │   ├── GroupChatPage.jsx # Group chat interface
│   │   │   ├── OnboardingPage.jsx # Profile setup
│   │   │   ├── CodePlaygroundPage.jsx # Code editor
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility libraries
│   │   │   ├── api.js          # API functions
│   │   │   ├── socket.js       # Socket.IO client
│   │   │   └── utils.js        # Helper functions
│   │   ├── store/              # Zustand stores
│   │   └── constants/          # Application constants
│   ├── public/                 # Static assets
│   └── package.json
└── backend/                     # Express.js backend
    ├── src/
    │   ├── controllers/        # Request handlers
    │   │   ├── auth.controller.js      # Authentication
    │   │   ├── user.controller.js      # User management
    │   │   ├── chat.controller.js      # Chat functionality
    │   │   └── groupChat.controller.js # Group management
    │   ├── models/             # MongoDB schemas
    │   │   ├── User.js         # User model
    │   │   ├── FriendRequest.js # Friend request model
    │   │   └── GroupChat.js    # Group chat model
    │   ├── routes/             # API route definitions
    │   ├── middleware/         # Express middleware
    │   ├── lib/                # Backend utilities
    │   └── server.js           # Application entry point
    ├── uploads/                # File storage
    └── package.json
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/onboarding` - Complete user profile setup
- `PUT /api/auth/profile` - Update user profile

### User Management
- `GET /api/users` - Get recommended users for language learning
- `GET /api/users/friends` - Get user's friends list
- `POST /api/users/friend-request/:id` - Send friend request
- `PUT /api/users/friend-request/:id/accept` - Accept friend request
- `DELETE /api/users/friend-request/:id/reject` - Reject friend request
- `DELETE /api/users/friend-request/:id/cancel` - Cancel sent request
- `DELETE /api/users/friends/:id` - Remove friend
- `GET /api/users/friend-requests` - Get incoming friend requests
- `GET /api/users/outgoing-friend-requests` - Get outgoing requests

### Chat & Communication
- `GET /api/chat/token` - Get Stream Chat authentication token
- `POST /api/chat/messages` - Save chat message
- `POST /api/chat/upsert-target-user` - Upsert user to Stream Chat

### Group Chat Management
- `POST /api/groups/create` - Create new group chat
- `GET /api/groups/my-groups` - Get user's group chats
- `POST /api/groups/:groupId/add-members` - Add members to group
- `POST /api/groups/:groupId/leave` - Leave group
- `POST /api/groups/:groupId/kick/:memberId` - Kick member (admin only)
- `PUT /api/groups/:groupId/update` - Update group info
- `DELETE /api/groups/:groupId/delete` - Delete group (creator only)
- `GET /api/groups/:groupId/members/search` - Search group members



## Real-time Features

### Socket.IO Events
- `register` - Register user for real-time notifications
- `friendRequest` - New friend request received
- `friendRequestAccepted` - Friend request accepted
- `friendRequestCanceled` - Friend request canceled
- `unfriended` - User unfriended
- `groupChatInvite` - Invited to group chat
- `addedToGroup` - Added to existing group
- `kickedFromGroup` - Kicked from group
- `groupDeleted` - Group chat deleted

### Stream Integration
- **Chat**: Real-time messaging with typing indicators, reactions, and file sharing
- **Video**: High-quality video calls with screen sharing capabilities
- **User Management**: Automatic user synchronization between MongoDB and Stream

## Language Learning Features

1. **Smart Matching**: Algorithm matches users based on native and learning languages
2. **Cultural Exchange**: Connect with native speakers for authentic practice
3. **Group Learning**: Join language-specific groups for collaborative learning
4. **Code Practice**: Practice programming languages while learning human languages
5. **Video Practice**: Improve pronunciation through video conversations


## Future Enhancements

1. **AI Language Assistant**: Integration with language learning AI
2. **Translation Features**: Real-time message translation
3. **Learning Progress**: Track and gamify language learning progress
4. **Mobile App**: React Native mobile application
5. **Advanced Moderation**: AI-powered content moderation for safety
6. **Language Exchange Events**: Scheduled group learning sessions
7. **File Sharing**: Document and media sharing in conversations
8. **Voice Messages**: Audio message support for pronunciation practice

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

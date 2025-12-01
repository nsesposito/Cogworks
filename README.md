# Cogworks - Retro Terminal Chat Application

A retro-inspired, minimalist chat application with real-time messaging, personal notes, and user management.

## 🚀 Features

- **Real-time Messaging**: Chat with other users using WebSocket technology
- **User Authentication**: Secure registration and login
- **Personal Notes**: Create, edit, and manage your personal notes
- **Password Management**: Change your password anytime
- **Online Status**: See who's online in real-time
- **Retro UI**: Beautiful terminal-inspired green-on-black interface

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Socket.io Client
- Axios
- Vite

### Backend
- Node.js + Express
- Socket.io
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## 📦 Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Cogworks
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL=postgresql://localhost/cogworks
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Start PostgreSQL and create database**
   ```bash
   createdb cogworks
   ```

5. **Run the application**
   
   In one terminal (server):
   ```bash
   cd server
   npm run dev
   ```
   
   In another terminal (client):
   ```bash
   cd client
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5173`

## 🌐 Deployment on Render

### Quick Deploy (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml` and set everything up!

3. **Update environment variables** (if needed)
   - The `render.yaml` file handles most configuration
   - JWT_SECRET is auto-generated
   - Database is automatically provisioned

### Manual Deploy Alternative

If you prefer manual setup:

**Backend Service:**
- Type: Web Service
- Build Command: `cd server && npm install`
- Start Command: `cd server && npm start`
- Add PostgreSQL database
- Set environment variables

**Frontend Service:**
- Type: Static Site
- Build Command: `cd client && npm install && npm run build`
- Publish Directory: `client/dist`

## 📁 Project Structure

```
Cogworks/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Backend Node.js application
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── users.js      # User routes
│   │   ├── messages.js   # Message routes
│   │   └── notes.js      # Notes routes
│   ├── db.js             # Database configuration
│   ├── server.js         # Express server setup
│   ├── socketHandlers.js # Socket.io handlers
│   └── package.json
└── render.yaml           # Render deployment config
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection (parameterized queries)
- CORS configuration
- Secure password requirements (min 6 characters)

## 🎨 UI Features

- Terminal-inspired retro design
- CRT screen effect
- Scanline animations
- Glowing green text
- Responsive layout
- Dark mode optimized

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password (requires auth)

### Users
- `GET /api/users/all` - Get all users
- `GET /api/users/search?query=` - Search users

### Messages
- `GET /api/messages/:userId` - Get message history
- `POST /api/messages` - Send message
- `GET /api/messages/conversations/list` - Get conversations list

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note

## 🔌 WebSocket Events

### Client → Server
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server → Client
- `receive_message` - Receive a message
- `user_typing` - Another user is typing
- `user_stopped_typing` - User stopped typing
- `users_online` - List of online users

## 🐛 Troubleshooting

**Database connection issues:**
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify database exists

**WebSocket not connecting:**
- Check CORS settings
- Ensure both client and server URLs are correct
- Verify firewall settings

**Build fails:**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using React and Node.js

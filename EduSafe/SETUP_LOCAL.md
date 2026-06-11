# EduSafe - Local Development Setup

## 📋 Prerequisites

- Node.js 16+ (Download from [nodejs.org](https://nodejs.org))
- MongoDB (Local or MongoDB Atlas account)
- Git
- Any code editor (VS Code recommended)

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd EduSafe/backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add:

```
MONGO_URI=mongodb://localhost:27017/edusafe
# or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/edusafe

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-for-dev
```

### 3. Start Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on: `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd EduSafe/frontend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## ✅ Verify Everything is Working

1. Open browser and go to `http://localhost:5173`
2. Check browser console for any errors
3. Try interacting with the app
4. Backend should be receiving requests on `http://localhost:5000`

---

## 📁 Project Structure

```
EduSafe/
├── backend/
│   ├── config/
│   │   └── db.js          (MongoDB connection)
│   ├── models/            (Database schemas)
│   ├── routes/            (API endpoints)
│   ├── controllers/       (Business logic)
│   ├── server.js          (Main server file)
│   ├── .env.example       (Environment template)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    (React components)
│   │   ├── pages/         (Page components)
│   │   ├── redux/         (State management)
│   │   ├── App.jsx        (Main app component)
│   │   └── main.jsx       (Entry point)
│   ├── public/            (Static assets)
│   ├── .env.example       (Environment template)
│   ├── vite.config.js     (Vite configuration)
│   └── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Change port in .env or kill process using the port
# On Windows:
netstat -ano | findstr :5000
kill PID

# On Mac/Linux:
lsof -i :5000
kill -9 PID
```

### "MongoDB connection error"
- Make sure MongoDB service is running
- Check connection string in `.env`
- If using local MongoDB: `mongodb://localhost:27017/edusafe`
- If using Atlas: Ensure IP is whitelisted

### "Module not found errors"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "CORS errors"
- Backend must have `CLIENT_URL` in `.env` set to frontend URL
- Frontend must have correct `VITE_API_URL`

---

## 📚 Useful Commands

### Backend
```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Next Steps

1. Create your first model in `backend/models/`
2. Create API route in `backend/routes/`
3. Create React component in `frontend/src/components/`
4. Test API integration
5. Deploy to production (see DEPLOYMENT.md)

---

## 📖 Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Redux Docs](https://redux.js.org)

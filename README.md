```markdown
# Game-Pen Build Guide

A step-by-step breakdown for building the entire **Game-Pen** capstone project. This guide starts with the **frontend** to help visualize core pages before wiring up data with the backend.

---

## 📁 Project Structure
```

/game-pen
/client ← React Frontend
/server ← Node/Express Backend

````

---

# 🖥️ FRONTEND FIRST

## Step 1: Create React App

```bash
npx create-react-app client
cd client
npm install react-router-dom axios jwt-decode
````

## Step 2: Create Folder Structure

```
/client/src
  /pages
    Signup.jsx
    Login.jsx
    Upload.jsx
    Explore.jsx
    Profile.jsx
  /components
    Navbar.jsx
    UploadForm.jsx
    Gallery.jsx
```

## Step 3: Setup Routing (React Router)

In `App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Step 4: Build Basic Pages

### Signup.jsx

- Fields: name, email, password, creative_focus
- Submit POST request to `/api/signup`

### Login.jsx

- Fields: email, password
- Submit POST to `/api/login`
- Save token in `localStorage`

### Upload.jsx

- Fields: image upload, title, genre
- Submit image + metadata (use FormData)

### Explore.jsx

- Fetch from `/api/uploads`
- Display images in grid
- Add genre filter dropdown

### Profile.jsx

- Fetch uploads by current user
- Display bio and uploaded images

---

# 🛠️ BACKEND SECOND

## Step 1: Setup Express Project

```bash
mkdir server
cd server
npm init -y
npm install express cors pg dotenv bcrypt jsonwebtoken
```

Create `index.js`:

```js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Game-Pen API running'));

app.listen(5000, () => console.log('Server on http://localhost:5000'));
```

## Step 2: Setup PostgreSQL via pgAdmin

1. Open pgAdmin and create a server & database

   - Server name: `GamePenServer`
   - DB name: `game_pen_db`

2. Create tables via query:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  creative_focus VARCHAR(50),
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genre_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE
);

CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(150),
  description TEXT,
  genre_tag_id INT REFERENCES genre_tags(id),
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 3: Add Auth Routes

Create `/routes/auth.js`

- POST `/signup` → register user, hash password
- POST `/login` → validate, issue JWT

```js
// Sample: POST /signup
router.post('/signup', async (req, res) => {
  const { name, email, password, creative_focus } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name, email, password_hash, creative_focus) VALUES ($1, $2, $3, $4)',
    [name, email, hashed, creative_focus]
  );
  res.sendStatus(201);
});
```

## Step 4: Add Upload + Explore Routes

- POST `/uploads` → save metadata
- GET `/uploads` → return all uploads
- GET `/uploads?genre=platformer` → filtered by genre

```js
router.post('/uploads', authMiddleware, async (req, res) => {
  const { title, description, genre_tag_id, file_path } = req.body;
  const userId = req.user.id;
  await db.query(
    'INSERT INTO uploads (user_id, title, description, genre_tag_id, file_path) VALUES ($1, $2, $3, $4, $5)',
    [userId, title, description, genre_tag_id, file_path]
  );
  res.sendStatus(201);
});
```

---

# 🔄 CONNECT FRONTEND + BACKEND

## Step 1: Axios Requests

In React components (e.g. Signup.jsx):

```js
await axios.post('http://localhost:5000/api/signup', formData);
```

## Step 2: Store JWT

After login:

```js
localStorage.setItem('token', res.data.token);
```

Add token to upload requests:

```js
axios.post('/uploads', data, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

# 🚀 Ready to Launch

1. Run backend:

```bash
cd server
node index.js
```

2. Run frontend:

```bash
cd client
npm start
```

3. Open: [http://localhost:3000](http://localhost:3000)

---

## ✅ Final Checklist

- [x] Signup/Login pages working
- [x] Auth token flows correctly
- [x] Upload page sends image data
- [x] Explore page filters uploads
- [x] Profile page shows current user’s uploads
- [x] PostgreSQL schema matches ERD

Let me know if you'd like instructions for chat/messaging, deployment, or editing profile next!

```

```

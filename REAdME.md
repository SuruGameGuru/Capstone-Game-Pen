# Capstone-Game-Pen

```markdown

```

# Indie Collaboration Platform Capstone Project

## Project Overview

This project is a website designed to help **solo game developers and artists collaborate** without being overshadowed by larger studios or mainstream platforms. Unlike sites like ArtStation or DeviantArt, this platform focuses on **direct collaboration and genre-specific networking**.

Users can upload their work and interact directly through **genre-dedicated channels**, which match developers with artists whose styles complement their game themes. The platform empowers indie creators to find and work with the right partners efficiently and authentically.

---

## Motivation

As an artist passionate about games, juggling all roles—art, design, development, audience management—was overwhelming. This platform is a response to the need for **a collaborative space** where solo creators can connect, share, and build without burnout or noise from bigger studios.

---

## Tech Stack

- **Frontend:** React, CSS
- **Backend:** Node.js + Express (PERN stack)
- **Database:** PostgreSQL
- **Languages:** JavaScript (main), Python (select backend tools), C++ (minimal)
- **Authentication:** JWT with role-based access (artist or developer)
- **Image Upload & Real-time:** Cloudinary for images, Socket.IO for chat
- **Deployment:** Render or Vercel, version control with GitHub

---

## Getting Started: Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/indie-collab-platform.git
cd indie-collab-platform
```

---

### 2. Backend Setup

#### a. Install Dependencies

```bash
cd server
npm install express pg cors dotenv jsonwebtoken socket.io cloudinary bcrypt
```

#### b. Setup PostgreSQL Database Using pgAdmin (No command line needed)

1. Open **pgAdmin**.
2. Create a new **Server** (right-click Servers > Create > Server):

   - Name: `IndieCollabServer`
   - Connection:

     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: _your password_

3. Inside the new server, create a new **Database**:

   - Name: `indie_collab_db`

4. Open the **Query Tool** for this database and run:

```sql
-- Users table with roles (artist or developer)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL -- 'artist' or 'developer'
);

-- Projects or uploads (image URLs stored)
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  image_url TEXT NOT NULL,
  genre VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages for real-time genre channels
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  genre VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### c. Configure Environment Variables

Create a `.env` file in `/server`:

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indie_collab_db

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

### 3. Backend Development

- Setup Express server in `server/index.js`.
- Connect to PostgreSQL using `pg` and the above environment variables.
- Implement JWT-based authentication with roles.
- Setup routes:

  - `/signup` – register user with role
  - `/login` – authenticate user and issue JWT
  - `/upload` – upload images via Cloudinary, save URL with genre and user
  - `/channels/:genre/messages` – real-time chat with Socket.IO

- Use Cloudinary SDK for image uploads.
- Integrate Socket.IO for chat.

---

### 4. Frontend Setup

#### a. Initialize React App

```bash
cd ..
npx create-react-app client
cd client
npm install socket.io-client axios jwt-decode
```

only run npm audit fix --force if you really need too- note from past Suru

#### b. Build UI

- Pages/components:

  - `Signup.jsx` – form with username, password, role (artist/developer)
  - `Login.jsx` – form to authenticate and save JWT
  - `Upload.jsx` – upload images, select genre
  - `GenreChannel.jsx` – real-time chat per genre with Socket.IO
  - `Profile.jsx` – view user uploads and info

- Use React Router for navigation.
- Use `axios` or `fetch` to communicate with backend.

Here's how people usually organize this:

pgsql
/src
/pages <-- full-page components tied to a route
Signup.jsx
Login.jsx
Profile.jsx
/components <-- smaller pieces used in pages
Navbar.jsx
ChatMessage.jsx
UploadForm.jsx
✅ Why the distinction matters:

```js
Pages are registered in your router (<Route path="/signup" element={<Signup />} />)
```

## Components are used inside pages, but are not directly navigated to

Absolutely! Here's your original outline explained in a **detailed, step-by-step instructional format** to guide you through setting up and running your full-stack project with React frontend and Node.js backend.

---

# 🛠️ Step-by-Step: Building Your Game-Pen Project

This guide assumes you have:

- Node.js and npm installed
- PostgreSQL database set up
- A project structure with a `server/` folder (Node/Express backend) and `client/` folder (React frontend)

---

## 📄 1. Pages and Components Overview

Here’s what you will create in the `client/src/pages/` folder of your React app:

### ✅ `Signup.jsx`

- **Purpose**: New users register an account.
- **Fields**:

  - `username` (text)
  - `password` (password)
  - `role` (dropdown or radio buttons – "artist" or "developer")

- **Functionality**:

  - Send a `POST` request to `/api/signup` with form data.
  - On success, redirect to login page.

### ✅ `Login.jsx`

- **Purpose**: Existing users log in to access their account.
- **Fields**:

  - `username`
  - `password`

- **Functionality**:

  - Send `POST` request to `/api/login`.
  - Receive a **JWT token** and save it in `localStorage`.
  - Redirect user to the `Upload` or `Profile` page.

### ✅ `Upload.jsx`

- **Purpose**: Authenticated users can upload artwork or game assets.
- **Fields**:

  - Image file upload
  - Genre dropdown (e.g., horror, fantasy, sci-fi)

- **Functionality**:

  - Send a `POST` request with image and genre (FormData).
  - Store metadata in PostgreSQL.
  - Store image file on the server or cloud storage (like Cloudinary or local folder).

### ✅ `GenreChannel.jsx`

- **Purpose**: Real-time chat room based on selected genre.
- **Functionality**:

  - Use **Socket.IO** to connect to backend WebSocket server.
  - Users can send and receive live messages.
  - Join rooms like `fantasy`, `horror`, etc., based on selected genre.

### ✅ `Profile.jsx`

- **Purpose**: View your uploaded work and personal info.
- **Functionality**:

  - Fetch user’s uploads with `GET /api/user/uploads`
  - Display user bio, role, and uploaded images.

---

## 🔁 2. Routing with React Router

Install React Router:

```bash
npm install react-router-dom
```

In your `App.jsx` or `main.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import GenreChannel from './pages/GenreChannel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat/:genre" element={<GenreChannel />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔗 3. Backend Communication

Use either `axios` or the native `fetch()` function to talk to your backend API.

### Install Axios (optional)

```bash
npm install axios
```

### Example with Axios (in `Signup.jsx`)

```jsx
import axios from 'axios';

const handleSignup = async () => {
  try {
    await axios.post('http://localhost:5000/api/signup', {
      username,
      password,
      role,
    });
    // redirect or show success
  } catch (err) {
    console.error(err);
  }
};
```

### With `fetch()`:

```js
fetch('http://localhost:5000/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, role }),
});
```

---

## 🧪 4. Run the Project Locally

### Start Your Backend

Open a terminal:

```bash
cd server
node index.js
```

This runs your backend Express server (typically on port 5000).

### Start Your Frontend

Open a second terminal:

```bash
cd client
npm start
```

This launches your React frontend at [http://localhost:3000](http://localhost:3000)

---

## 🚀 5. Optional Deployment Steps

When you're ready to share your app online:

### Backend + Database

- Deploy to [Render](https://render.com) or [Railway](https://railway.app)
- Make sure your PostgreSQL DB is also hosted and accessible

### Frontend

- Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

### Important:

- Update all API URLs in your frontend from `localhost:5000` to your **Render backend URL** (e.g., `https://game-pen-backend.onrender.com`)

---

## 🔧 6. Future Improvements (optional but recommended)

Here are ideas for expanding your project later:

| Feature               | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| **Editable Profiles** | Let users update their bio, profile image, and genre focus.                      |
| **Notifications**     | Use WebSockets or polling to notify users of new uploads or chat messages.       |
| **Collab Tools**      | Let artists and devs create shared project spaces or boards.                     |
| **Better UX/UI**      | Add animations, loading states, genre filters, and responsive design for mobile. |

---

Would you like a folder-by-folder breakdown next, or a sample `Signup.jsx` file fully written out?

---

### 5. Running Your Project Locally

#### Start Backend

```bash
cd server
node index.js
```

#### Start Frontend

```bash
cd ../client
npm start
```

Open `http://localhost:3000` in your browser.

---

### 6. Deployment (Optional)

- Backend + DB → Deploy on [Render](https://render.com)
- Frontend → Deploy on [Vercel](https://vercel.com)
- Update frontend API URLs to your deployed backend URL.

---

## Future Improvements

- Add user profiles with editable info.
- Implement notifications.
- Add project collaboration tools.
- Improve UX/UI design.

---

## Contact

Created by Suru Afariogun

---

m
a
n
i
a
m
s
t
r
e
s
s
e
d

---

# Capstone-Game-Pen

## Indie Collaboration Platform Capstone Project

### Project Overview

Game-Pen is a full-stack web platform built to help **indie game developers and visual artists** connect, collaborate, and showcase their work in a space free of corporate noise or AAA competition.

Creators can build a profile, upload images or art, and explore work from others based on **shared genres or creative focuses**. Optional features like messaging and follower connections are designed to grow with the community.

---

### Motivation

This project was born from firsthand experience juggling art, code, and visibility as an indie creator. Game-Pen provides a centralized, respectful, and creative environment for artists and devs to find collaborators and grow their audiences.

---

### Tech Stack

- **Frontend:** React, CSS Modules
- **Backend:** Node.js + Express (PERN Stack)
- **Database:** PostgreSQL
- **Languages:** JavaScript (main), SQL (PostgreSQL), HTML/CSS
- **Authentication:** JWT + Role-based (artist or game dev)
- **Image Upload:** Local server or Cloudinary (optional)
- **Deployment:** Render (backend) + Vercel (frontend)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/game-pen.git
cd game-pen
```

---

### 2. Backend Setup

#### a. Install Dependencies

```bash
cd server
npm install
```

#### b. Create the PostgreSQL Database (pgAdmin preferred)

1. Open **pgAdmin**
2. Create a new server:

   - Name: `GamePenServer`
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: _your password_

3. Create new database: `game_pen_db`
4. Open Query Tool and run:

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

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  content TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
  follower_id INT REFERENCES users(id),
  followed_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### c. Create `.env` in `/server`

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=game_pen_db
JWT_SECRET=your_jwt_secret
```

---

### 3. Backend API Overview

- `POST /signup` — Register a new user
- `POST /login` — Log in and receive JWT
- `POST /uploads` — Upload image metadata
- `GET /uploads` — Get all uploads
- `GET /uploads?genre=` — Filter by genre
- `POST /messages` — Send message (optional)
- `GET /messages` — Get messages (optional)

---

### 4. Frontend Setup

```bash
cd ../client
npm install
```

#### Structure

```
/src
  /pages
    Signup.jsx
    Login.jsx
    Upload.jsx
    Profile.jsx
    Explore.jsx
  /components
    Navbar.jsx
    UploadForm.jsx
    MessageBox.jsx
```

#### Key Pages

- **Signup/Login:** Auth forms
- **Upload:** File + genre tag form
- **Explore:** Gallery of all uploads
- **Profile:** User’s uploads
- **Chat (optional):** Messages per genre

---

### 5. Start the App Locally

#### Start Backend:

```bash
cd server
node index.js
```

#### Start Frontend:

```bash
cd client
npm start
```

---

### 6. Deployment (Optional)

- **Backend:** Render
- **Frontend:** Vercel
- Update URLs from `localhost` to live domain in frontend API calls

---

### 7. ERD Structure (Simplified)

```
Users (id, name, email, password_hash, bio, creative_focus, profile_image)
  ↳ has many Uploads
  ↳ sends/receives Messages
  ↳ follows Users

Uploads (id, user_id, title, description, genre_tag_id, file_path)
  ↳ belongs to User
  ↳ belongs to GenreTag

GenreTags (id, name)

Messages (id, sender_id, receiver_id, content)

Follows (follower_id, followed_id)
```

---

## Future Enhancements

- Profile editing and avatar upload
- Project collaboration boards
- Notification system for follows or messages
- Like/favorite system for uploads
- Improved filters and search by style/theme

---

## Created by

**Suru Afariogun**

---

## 🔐 Implementing Authentication (Login & Signup)

This section explains how to add authentication to your Login and Signup pages, including form handling, API requests, and token storage.

### Step 1: Backend API Endpoints

**Purpose**: Your frontend will communicate with backend endpoints for authentication.

**Typical Endpoints:**
- `POST /api/signup` — Register a new user
- `POST /api/login` — Authenticate user and return a JWT token

### Step 2: Signup Page Implementation

**Purpose**: Allow users to create an account.

**Action**: In `Signup.jsx`, create a controlled form and handle submission:

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    creative_focus: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await axios.post('http://localhost:5000/api/signup', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      <input name="creative_focus" value={formData.creative_focus} onChange={handleChange} placeholder="Creative Focus" />
      <button type="submit">Sign Up</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>Signup successful! Please log in.</div>}
    </form>
  );
};

export default Signup;
```

### Step 3: Login Page Implementation

**Purpose**: Allow users to log in and store their authentication token.

**Action**: In `Login.jsx`, create a controlled form and handle submission:

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      localStorage.setItem('token', res.data.token); // Store JWT
      navigate('/profile'); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
};

export default Login;
```

### Step 4: Using the Token for Authenticated Requests

**Purpose**: Use the stored JWT token to access protected routes (e.g., uploading content).

**Action**: Attach the token to your API requests:

```js
const token = localStorage.getItem('token');
await axios.post('http://localhost:5000/api/uploads', data, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Step 5: Logging Out

**Purpose**: Remove the token and redirect the user.

**Action**: Implement a logout function:

```js
const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/login');
};
```

### Step 6: Protecting Routes (Frontend)

**Purpose**: Prevent access to certain pages unless the user is logged in.

**Action**: Create a simple ProtectedRoute component:

```jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Usage in App.jsx
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

---

**Summary:**
- Signup and Login forms send POST requests to backend
- JWT token is stored in localStorage after login
- Token is attached to future API requests for authentication
- Logout removes the token
- ProtectedRoute prevents access to private pages if not logged in

---

## 🔐 Authentication System Fixes

### Quick Reference
For comprehensive authentication fixes including login, signup, token management, API connections, database connections, user account creation, deletion, and logout functionality, see:

**📖 FIXIT-DATABASE-API-AND-MORE.md - Volume Two: Authentication System Fixes**

### What's Covered in Volume Two:
- ✅ Re-enabling frontend authentication API calls
- ✅ Implementing protected routes
- ✅ Adding logout functionality  
- ✅ Fixing token storage and retrieval
- ✅ Adding user session management
- ✅ Implementing account deletion
- ✅ Fixing database connection issues
- ✅ Comprehensive testing procedures
- ✅ Common issues and solutions

### Quick Start:
1. **Check FIXIT readme** - Section "Volume Two: Authentication System Fixes"
2. **Follow step-by-step instructions** for each component
3. **Test each feature** using the provided testing checklist
4. **Use the troubleshooting section** for common issues

### Current Status:
- Backend authentication endpoints are implemented
- Frontend forms exist but API calls are temporarily disabled
- JWT middleware is ready but not being used
- Database schema supports authentication
- **Action Required**: Follow Volume Two instructions to re-enable full authentication

---

**Note**: The authentication system is mostly complete but needs to be re-enabled following the detailed instructions in the FIXIT readme.

```

```

```

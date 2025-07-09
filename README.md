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

#### b. Build UI

- Pages/components:

  - `Signup.jsx` – form with username, password, role (artist/developer)
  - `Login.jsx` – form to authenticate and save JWT
  - `Upload.jsx` – upload images, select genre
  - `GenreChannel.jsx` – real-time chat per genre with Socket.IO
  - `Profile.jsx` – view user uploads and info

- Use React Router for navigation.
- Use `axios` or `fetch` to communicate with backend.

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

Happy collaborating! 🎮🎨

```

---

If you want, I can help you add detailed sample backend or frontend code snippets next!
```

```

```

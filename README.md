## 🛠️ Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/movieIguess.git
cd movieIguess
```
### 2. Install dependencies
```bash
# For backend
cd backend
npm install
```
# For frontend
cd ../frontend
npm install
### 3. Setup environment variables
Create a .env file in both frontend/ and backend/ with:

# TMDB API Key
```bash
TMDB_API_KEY=your_tmdb_key
```

# Backend
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/movieIguess
PROXY_SECRET=your_secret
```

### 4. Run the project
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
```

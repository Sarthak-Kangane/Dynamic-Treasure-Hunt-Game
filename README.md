# Dynamic-Treasure-Hunt-Game
A modern, fully admin-driven, AI-powered treasure hunt platform for teams!

## Features

- **Dynamic Game Setup:**  
  - Admins can add, edit, and delete any number of locations and questions.
  - No hardcoded limits—everything is flexible and admin-driven.

- **Admin Dashboard:**  
  - Full-screen, responsive UI for managing the game.
  - Live leaderboard and team progress tracking.
  - Game duration controls, start/reset, and winner announcement.

- **AI-Powered Question Generation:**  
  - Generate quiz questions on any topic using OpenAI.
  - Choose difficulty and question type (MCQ, Short Answer, True/False).
  - Review, edit, and save generated questions.

- **Team Registration & Randomized Paths:**  
  - Teams register and are assigned a unique, random path through the locations.
  - All progress and logic adapts to the current number of locations/questions.

- **Answer Verification Page:**  
  - QR-only location input for secure, fair play.
  - Live leaderboard auto-refreshes for real-time competition.

- **Robust Game Logic:**  
  - Handles any number of locations/questions.
  - Dynamic progress, completion, and winner logic.
  - System is robust to admin changes at any time.

- **Modern UX:**  
  - Responsive, mobile-friendly design.
  - Animated, visually appealing leaderboard and modals.

- **Security & Fairness:**  
  - Location verification via QR codes.
  - Admin-only controls for sensitive actions.

- **Extensible:**  
  - Easily add new features (e.g., geolocation, power-ups, analytics).
 
  ## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- OpenAI API Key (for AI question generation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/horcrux-hunt.git
   cd horcrux-hunt
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your MongoDB URI and OpenAI API key:
     ```
     MONGODB_URI=your_mongodb_uri
     OPENAI_API_KEY=sk-...
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   - Admin Dashboard: `http://localhost:3000/admin`
   - Team/Player View: `http://localhost:3000/`
  
## Usage

### For Admins
- Log in to the admin dashboard.
- Add locations and questions (manually or with AI).
- Set game duration and start the game.
- Monitor team progress and leaderboard.
- Reset the game as needed.

### For Teams
- Register your team.
- Scan QR codes at each location to unlock questions.
- Answer questions in sequence.
- Track your progress and compete to win!

### Game Flow
1. Admin sets up the game (locations, questions, duration).
2. Teams register and receive a randomized path.
3. Game starts—teams move through locations, scan QR codes, and answer questions.
4. Progress and leaderboard update in real time.
5. First team to finish (or team with most answers at time limit) wins!

## Tech Stack

- **Frontend:** React (Next.js), Tailwind CSS
- **Backend:** Node.js, Express (API routes in Next.js)
- **Database:** MongoDB
- **AI Integration:** OpenAI API (gpt-3.5-turbo)

# Treasure Hunt Game - Enhanced Version

A real-time treasure hunt game with enhanced winning logic and admin controls.

## Features

### 🎮 Game Logic
- **2-hour game duration** with automatic timer
- **Two winning conditions**:
  1. First team to answer all 12 questions wins immediately
  2. If no team completes all questions, the team with the most answers after 2 hours wins
- **Real-time game status** tracking
- **Automatic game end** when time expires

### 👨‍💼 Admin Controls
- **Start Game Button**: Admin can start the game when ready
- **Real-time Dashboard**: Monitor all teams' progress live
- **Game Status Display**: Shows current game state, time remaining, and winner
- **Reset Game**: Clear all team progress for testing
- **Winner Announcement**: Automatic winner display when game ends

### 🏆 Winning Team Display
- **Immediate winner detection** when a team answers all 12 questions
- **Winner banner** appears on all player screens
- **Admin dashboard** highlights the winning team
- **Leaderboard ranking** shows team positions

### 🎯 Player Experience
- **Game status indicator** on player screens
- **Time remaining display** during active games
- **Disabled interactions** when game hasn't started
- **Real-time leaderboard** for players
- **Winner celebration** when game ends

## API Endpoints

### New Endpoints
- `POST /api/startGame` - Start the game
- `GET /api/gameStatus` - Get current game status
- `POST /api/resetGame` - Reset game state (for testing)

### Enhanced Endpoints
- `GET /api/admin` - Now includes game status and winner information
- `POST /api/answerQuestion` - Now checks game state and handles winning conditions

## How to Use

### For Admins:
1. **Access Admin Panel**: Go to `/admin` and enter password "admin"
2. **Register Teams**: Use "Register a Team" button to add teams
3. **Start Game**: Click "Game Dashboard" then "Start Game" button
4. **Monitor Progress**: Watch real-time team progress and time remaining
5. **View Results**: Winner is automatically announced when game ends

### For Players:
1. **Login**: Use team credentials at `/userLogin`
2. **Check Game Status**: See if game has started and time remaining
3. **Answer Questions**: Scan QR codes and submit answers
4. **View Leaderboard**: Check current rankings
5. **Celebrate**: Winner banner appears when game ends

## Game Rules

1. **Game Duration**: 2 hours maximum
2. **Winning Conditions**:
   - First team to answer all 12 questions wins immediately
   - If no team completes all questions, team with most answers after 2 hours wins
3. **Question Sequence**: Teams must answer questions in order
4. **Location Verification**: Teams must be at correct location to answer
5. **Real-time Updates**: All progress updates in real-time

## Technical Details

- **Game State Management**: MongoDB Game model tracks game status
- **Real-time Updates**: 5-second polling for live updates
- **Winner Detection**: Automatic detection in answerQuestion API
- **Timer Management**: Server-side timeout for game end
- **Responsive UI**: Modern, mobile-friendly interface

## Testing

Use the "Reset Game" button in the admin dashboard to clear all progress and test the game flow multiple times.

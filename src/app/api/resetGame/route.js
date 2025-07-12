import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import Game from "../../../models/Game";
import { Team } from "../../../models/Team";

export async function POST() {
  try {
    await connectDb();

    // Reset game state
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
    }

    game.isGameStarted = false;
    game.isGameOver = false;
    game.winner = null;
    game.startTime = null;
    game.endTime = null;
    game.duration = 2 * 60 * 60 * 1000; // Reset to default 2 hours
    game.durationHours = 2;
    game.durationMinutes = 0;
    await game.save();

    // Reset all teams' progress
    await Team.updateMany({}, {
      currentLocationIndex: 0,
      answeredQuestions: {},
      startTime: new Date()
    });

    return NextResponse.json({ 
      message: 'Game reset successfully! All teams progress has been cleared.',
      gameState: {
        isGameStarted: game.isGameStarted,
        isGameOver: game.isGameOver,
        winner: game.winner,
        durationHours: game.durationHours,
        durationMinutes: game.durationMinutes
      }
    });
  } catch (error) {
    console.error('Error resetting game:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import Game from "../../../models/Game";
import { Team } from "../../../models/Team";

export async function GET() {
  try {
    await connectDb();

    // Get game instance
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
      await game.save();
    }

    // Get winner details if game is over
    let winnerDetails = null;
    if (game.isGameOver && game.winner) {
      const winner = await Team.findById(game.winner);
      if (winner) {
        winnerDetails = {
          teamName: winner.teamName,
          questionsAnswered: winner.answeredQuestions.size
        };
      }
    }

    // Calculate remaining time if game is started but not over
    let remainingTime = null;
    if (game.isGameStarted && !game.isGameOver && game.endTime) {
      const now = new Date();
      const endTime = new Date(game.endTime);
      remainingTime = Math.max(0, endTime.getTime() - now.getTime());
    }

    return NextResponse.json({
      isGameStarted: game.isGameStarted,
      isGameOver: game.isGameOver,
      startTime: game.startTime,
      endTime: game.endTime,
      remainingTime,
      winner: winnerDetails,
      duration: game.duration,
      durationHours: game.durationHours,
      durationMinutes: game.durationMinutes
    });
  } catch (error) {
    console.error('Error fetching game status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 
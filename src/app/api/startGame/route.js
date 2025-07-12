import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import Game from "../../../models/Game";

export async function POST(req) {
  try {
    await connectDb();

    // Get duration from request body
    const { durationHours = 2, durationMinutes = 0 } = await req.json();

    // Validate duration
    if (durationHours < 0 || durationMinutes < 0 || durationMinutes > 59) {
      return NextResponse.json({ 
        message: 'Invalid duration. Hours must be >= 0 and minutes must be 0-59' 
      }, { status: 400 });
    }

    if (durationHours === 0 && durationMinutes === 0) {
      return NextResponse.json({ 
        message: 'Game duration cannot be zero' 
      }, { status: 400 });
    }

    // Calculate duration in milliseconds
    const durationMs = (durationHours * 60 * 60 * 1000) + (durationMinutes * 60 * 1000);

    // Get or create game instance
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
    }

    // Check if game is already started
    if (game.isGameStarted) {
      return NextResponse.json({ 
        message: 'Game is already started', 
        startTime: game.startTime,
        isGameOver: game.isGameOver 
      }, { status: 400 });
    }

    // Check if game is already over
    if (game.isGameOver) {
      return NextResponse.json({ 
        message: 'Game is already over', 
        winner: game.winner 
      }, { status: 400 });
    }

    // Start the game with custom duration
    game.isGameStarted = true;
    game.startTime = new Date();
    game.endTime = new Date(Date.now() + durationMs);
    game.duration = durationMs;
    game.durationHours = durationHours;
    game.durationMinutes = durationMinutes;
    await game.save();

    // Set timeout to end the game after duration
    setTimeout(async () => {
      try {
        await connectDb();
        const currentGame = await Game.findOne();
        if (currentGame && currentGame.isGameStarted && !currentGame.isGameOver) {
          // End the game and determine winner
          await endGameAndDetermineWinner();
        }
      } catch (error) {
        console.error('Error in game timeout:', error);
      }
    }, durationMs);

    return NextResponse.json({ 
      message: 'Game started successfully!',
      startTime: game.startTime,
      endTime: game.endTime,
      duration: game.duration,
      durationHours: game.durationHours,
      durationMinutes: game.durationMinutes
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function endGameAndDetermineWinner() {
  try {
    const { Team } = await import("../../../models/Team");
    const Question = await import("../../../models/Question");
    
    const game = await Game.findOne();
    const teams = await Team.find();
    const totalQuestions = await Question.default.countDocuments();

    let winner = null;
    let maxQuestionsAnswered = 0;

    // Find the team with the most questions answered
    for (const team of teams) {
      const questionsAnswered = team.answeredQuestions.size;
      if (questionsAnswered > maxQuestionsAnswered) {
        maxQuestionsAnswered = questionsAnswered;
        winner = team;
      }
    }

    // Update game state
    game.isGameOver = true;
    game.winner = winner ? winner._id : null;
    await game.save();

    console.log(`Game ended. Winner: ${winner ? winner.teamName : 'No winner'}`);
  } catch (error) {
    console.error('Error ending game:', error);
  }
} 
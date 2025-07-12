import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import Question from "../../../models/Question";
import Game from "../../../models/Game";

export async function GET(req) {
    await connectDb();

    try {
        // Fetch game status
        let game = await Game.findOne();
        if (!game) {
            game = new Game();
            await game.save();
        }

        // Fetch all teams from the database
        const teams = await Team.find();

        if (!teams || teams.length === 0) {
            return NextResponse.json({ message: "No teams found" }, { status: 404 });
        }

        const teamStatus = [];

        // Loop through each team to get their status
        for (let team of teams) {
            // Prepare the team status object
            const numberOfQuestionsAnswered = team.answeredQuestions.size;
            const currentQuestionNumber = numberOfQuestionsAnswered + 1;
            const currentLocation = team.locationPath[team.currentLocationIndex];

            teamStatus.push({
                teamName: team.teamName,
                locationPath: team.locationPath.join(" -> "), // Show the unique path horizontally
                currentLocation, // Add current location
                numberOfQuestionsAnswered,
                currentQuestionNumber,
                isWinner: game.winner && game.winner.toString() === team._id.toString()
            });
        }

        // Sort teams by questions answered (descending)
        teamStatus.sort((a, b) => b.numberOfQuestionsAnswered - a.numberOfQuestionsAnswered);

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
            status: "success", 
            teams: teamStatus,
            gameStatus: {
                isGameStarted: game.isGameStarted,
                isGameOver: game.isGameOver,
                startTime: game.startTime,
                endTime: game.endTime,
                remainingTime,
                winner: winnerDetails,
                duration: game.duration,
                durationHours: game.durationHours,
                durationMinutes: game.durationMinutes
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching team status:", error);
        return NextResponse.json({ message: "Error fetching team status", error }, { status: 500 });
    }
}

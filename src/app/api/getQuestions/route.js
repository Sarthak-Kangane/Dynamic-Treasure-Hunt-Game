import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import Question from "../../../models/Question";

export async function POST(req) {
    try {
        await connectDb();
        const { teamId } = await req.json();
        console.log("helooooo                   !!!!!!!")
        if (!teamId) {
            return NextResponse.json({ message: "Team ID is required" }, { status: 400 });
        }

        // Fetch the team details
        const team = await Team.findById(teamId);

        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        // Calculate the sequence number
        const sequenceNumber = team.currentLocationIndex + 1;

        // Fetch the question based on sequence number
        const question = await Question.findOne({ sequenceNumber });

        if (!question) {
            return NextResponse.json({ message: "Question not found" }, { status: 404 });
        }

        // Return the question details
        return NextResponse.json(
            {
                message: "Question retrieved successfully",
                question: {
                    questionText: question.questionText,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching question:", error);
        return NextResponse.json(
            { message: "Error fetching question", error: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import Question from "../../../models/Question";

export async function POST(req) {
    await connectDb();

    const { teamId, answer, curr_location } = await req.json();

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        const currentLocationIndex = team.currentLocationIndex;
        const expectedLocation = team.locationPath[currentLocationIndex];

        if (curr_location !== expectedLocation) {
            return NextResponse.json({ message: "You are not at the correct location" }, { status: 400 });
        }

        // Fetch the current question based on the sequenceNumber
        const sequenceNumber = currentLocationIndex + 1; // Sequence starts at 1
        const question = await Question.findOne({ sequenceNumber });

        if (!question) {
            return NextResponse.json({ message: "Question not found" }, { status: 404 });
        }

        console.log("Question to answer is:", question.questionText);

        // Check if the previous question in the sequence is answered
        if (
            sequenceNumber > 1 &&
            team.answeredQuestions.get((sequenceNumber - 1).toString()) !== "answered"
        ) {
            return NextResponse.json(
                { message: "You must answer the previous question before this one" },
                { status: 400 }
            );
        }

        // Check if the current question is already answered
        if (team.answeredQuestions.get(sequenceNumber.toString()) === "answered") {
            return NextResponse.json(
                { message: "This question has already been answered" },
                { status: 400 }
            );
        }

        // Validate the answer
        if (answer === question.correctAnswer) {
            // Mark the question as answered
            team.answeredQuestions.set(sequenceNumber.toString(), "answered");

            // Move to the next location if the answer is correct
            if (team.currentLocationIndex < team.locationPath.length - 1) {
                team.currentLocationIndex += 1;
            }

            await team.save();

            return NextResponse.json(
                { message: "Correct answer! Move to the next location" },
                { status: 200 }
            );
        } else {
            return NextResponse.json({ message: "Incorrect answer" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error validating answer:", error);
        return NextResponse.json(
            { message: "Error validating answer", error: error.message },
            { status: 500 }
        );
    }
}

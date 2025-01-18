import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import  Question  from "../../../models/Question"; // Import Question model

export async function GET(req) {
    await connectDb();

    try {
        // Fetch all teams from the database
        const teams = await Team.find();

        if (!teams || teams.length === 0) {
            return NextResponse.json({ message: "No teams found" }, { status: 404 });
        }

        const teamStatus = [];

        // Loop through each team to get their status
        for (let team of teams) {
            // Prepare the team status object
            const numberOfQuestionsAnswered = team.currentLocationIndex;
            const currentQuestionNumber = numberOfQuestionsAnswered + 1;
            const currentLocation = team.locationPath[team.currentLocationIndex];

            teamStatus.push({
                teamName: team.teamName,
                locationPath: team.locationPath.join(" -> "), // Show the unique path horizontally
                currentLocation, // Add current location
                numberOfQuestionsAnswered,
                currentQuestionNumber
            });
        }

        return NextResponse.json({ status: "success", teams: teamStatus }, { status: 200 });
    } catch (error) {
        console.error("Error fetching team status:", error);
        return NextResponse.json({ message: "Error fetching team status", error }, { status: 500 });
    }
}

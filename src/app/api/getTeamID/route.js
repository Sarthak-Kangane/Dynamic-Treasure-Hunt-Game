import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDb();

        // Parse the JSON body
        const { teamName } = await req.json();

        if (!teamName) {
            return NextResponse.json({ message: "Team name is required" }, { status: 400 });
        }

        // Find the team by teamName
        const team = await Team.findOne({ teamName });

        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        // Respond with the team ID, team name, and currentLocation
        return NextResponse.json({ 
            teamId: team._id,
            teamName: team.teamName,
            currentLocation: team.locationPath[team.currentLocationIndex]
        });
    } catch (err) {
        console.error("Error finding team:", err); // Log the error for debugging
        return NextResponse.json({ message: "Error in finding team" }, { status: 500 });
    }
}

import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDb();

        // Parse the JSON body
        const { teamName, password } = await req.json();

        if (!teamName || !password) {
            return NextResponse.json({ message: "Team name and password are required" }, { status: 400 });
        }

        // Find the team by teamName
        const team = await Team.findOne({ teamName });

        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        // Check if the password matches
        if (team.password !== password) {
            console.log("Helloo                     !!!!!!!!!!!!!!!!!!!!!!!", team.password); 
            return NextResponse.json({ message: "Incorrect password" }, { status: 401 });

        }

        // Respond with the team ID
        return NextResponse.json({ teamId: team._id });
    } catch (err) {
        console.error("Error finding team:", err); // Log the error for debugging
        return NextResponse.json({ message: "Error in finding team" }, { status: 500 });
    }
}

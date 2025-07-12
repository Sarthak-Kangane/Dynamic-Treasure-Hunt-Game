import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team";
import { Location } from "../../../models/Location.js";
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

        // Get the current location from the team's path
        const currentLocation = team.locationPath[team.currentLocationIndex];
        // Fetch the location hint for this location
        let locationHint = "Location hint not available.";
        try {
            const location = await Location.findOne({ locationName: currentLocation });
            
            console.log("Found location:", location);
            if (location) {
                locationHint = location.hint;
            }
        } catch (error) {
            console.error("Error fetching location hint:", error);
        }

        // Respond with the team ID, team name, currentLocation, and location hint
        return NextResponse.json({ 
            teamId: team._id,
            teamName: team.teamName,
            currentLocation: currentLocation,
            currentLocationIndex: team.currentLocationIndex,
            locationHint: locationHint
        });
    } catch (err) {
        console.error("Error finding team:", err); // Log the error for debugging
        return NextResponse.json({ message: "Error in finding team" }, { status: 500 });
    }
}

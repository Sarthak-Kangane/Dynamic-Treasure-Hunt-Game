import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Team } from "../../../models/Team"; // Import the team model
import generateRandomPath from "../../../utils/generateRandomPath";
import { generateRandomPassword } from "../../../utils/generateRandomPassword"; // Import password generator

export async function POST(req) {
    await connectDb();

    const { teamName } = await req.json();

    try {
        // Check if a team with the same name already exists
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return NextResponse.json({ message: 'Team name already exists' }, { status: 400 });
        }

        // Generate a random password for the team
        const password = generateRandomPassword();
        console.log("Hellooo                                        !!!!!!!!!!!!!!!!!!!: ",password);
        // Generate a random path of 12 locations
        const locationPath = generateRandomPath();
        console.log(locationPath);

        // Create a new team
        const newTeam = new Team({
            teamName,
            password,  // Store the generated password in the database
            currentLocationIndex: 0,
            locationPath,
            answeredQuestions: {},  // Initially no questions answered
        });

        // Save the team to the database
        await newTeam.save();
        console.log(`First location for team ${teamName}: ${locationPath[newTeam.currentLocationIndex]}`);
        return NextResponse.json({ message: 'Team registered successfully!', teamId: newTeam._id, password }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error registering team', error }, { status: 500 });
    }
}

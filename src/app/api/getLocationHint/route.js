import Location from "@/models/Location";
import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";

export async function POST(req) {
    try {
        await connectDb();
        const { locationName } = await req.json();

        const location = await Location.findOne({ locationName });
        if (!location) {
            return NextResponse.json({ message: "Location not found" }, { status: 404 });
        }

        return NextResponse.json({ hint: location.hint }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

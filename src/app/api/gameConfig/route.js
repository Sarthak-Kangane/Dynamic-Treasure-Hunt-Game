import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Location } from "../../../models/Location";
import Question from "../../../models/Question";

export async function GET() {
  await connectDb();
  const numLocations = await Location.countDocuments();
  const numQuestions = await Question.countDocuments();
  return NextResponse.json({ numLocations, numQuestions });
} 
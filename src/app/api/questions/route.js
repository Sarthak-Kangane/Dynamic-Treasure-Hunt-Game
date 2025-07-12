import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import Question from "../../../models/Question";

export async function GET() {
  await connectDb();
  const questions = await Question.find().sort({ sequenceNumber: 1 });
  return NextResponse.json(questions);
}

export async function POST(req) {
  await connectDb();
  const { questionText, correctAnswer, sequenceNumber } = await req.json();
  if (!questionText || !correctAnswer || !sequenceNumber) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }
  const question = new Question({ questionText, correctAnswer, sequenceNumber });
  await question.save();
  return NextResponse.json(question);
}

export async function PUT(req) {
  await connectDb();
  const { _id, questionText, correctAnswer, sequenceNumber } = await req.json();
  if (!_id || !questionText || !correctAnswer || !sequenceNumber) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }
  const updated = await Question.findByIdAndUpdate(_id, { questionText, correctAnswer, sequenceNumber }, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  await connectDb();
  const { _id } = await req.json();
  if (!_id) {
    return NextResponse.json({ message: '_id is required' }, { status: 400 });
  }
  await Question.findByIdAndDelete(_id);
  return NextResponse.json({ message: 'Question deleted' });
} 
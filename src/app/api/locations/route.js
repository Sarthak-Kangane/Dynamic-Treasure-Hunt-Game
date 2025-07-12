import { NextResponse } from "next/server";
import { connectDb } from "../../../utils/db";
import { Location } from "../../../models/Location";

export async function GET() {
  await connectDb();
  const locations = await Location.find();
  return NextResponse.json(locations);
}

export async function POST(req) {
  await connectDb();
  const { locationName, hint } = await req.json();
  if (!locationName || !hint) {
    return NextResponse.json({ message: 'locationName and hint are required' }, { status: 400 });
  }
  const location = new Location({ locationName, hint });
  await location.save();
  return NextResponse.json(location);
}

export async function PUT(req) {
  await connectDb();
  const { _id, locationName, hint } = await req.json();
  if (!_id || !locationName || !hint) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }
  const updated = await Location.findByIdAndUpdate(_id, { locationName, hint }, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  await connectDb();
  const { _id } = await req.json();
  if (!_id) {
    return NextResponse.json({ message: '_id is required' }, { status: 400 });
  }
  await Location.findByIdAndDelete(_id);
  return NextResponse.json({ message: 'Location deleted' });
} 
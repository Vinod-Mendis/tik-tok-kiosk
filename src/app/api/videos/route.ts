/** @format */

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("roaradx_videos"); // Hardcode to verify
    const collection = db.collection("videos");

    const data = await collection.find({}).toArray();

    console.log("Fetched documents:", data.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: String(error) },
      { status: 500 }
    );
  }
}

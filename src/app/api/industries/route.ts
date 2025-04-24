import { NextResponse } from 'next/server';
import { db } from '@/shared/db';

export async function GET() {
  try {
    const collection = await db.collection('industries');
    const industries = await collection.find().toArray();
    return NextResponse.json(industries);
  } catch (error) {
    console.error('Failed to fetch industries:', error);
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
  }
} 
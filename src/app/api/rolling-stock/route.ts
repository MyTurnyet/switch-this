import { NextResponse } from 'next/server';
import { db } from '@/shared/db';

export async function GET() {
  try {
    const collection = await db.collection('rollingStock');
    const rollingStock = await collection.find().toArray();
    return NextResponse.json(rollingStock);
  } catch (error) {
    console.error('Failed to fetch rolling stock:', error);
    return NextResponse.json({ error: 'Failed to fetch rolling stock' }, { status: 500 });
  }
} 
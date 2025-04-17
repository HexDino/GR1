import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonials = await db.query(
      'SELECT * FROM testimonials ORDER BY date DESC LIMIT 3'
    );
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, image, rating, comment } = body;

    // Validate required fields
    if (!name || !role || !image || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new testimonial
    const result = await db.query(
      `INSERT INTO testimonials (name, role, image, rating, comment, date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, role, image, rating, comment]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
} 
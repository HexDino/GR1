import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock testimonials data
    const testimonials = [
      {
        id: "1",
        name: "Sarah Johnson",
        role: "Cardiologist Patient",
        image: "/testimonials/patient1.png",
        rating: 5,
        comment: "The care I received was exceptional. The doctors were knowledgeable and took the time to explain everything thoroughly. The facilities are modern and clean.",
        date: "March 15, 2024"
      },
      {
        id: "2",
        name: "Michael Chen",
        role: "Pediatrics Patient",
        image: "/testimonials/patient2.png",
        rating: 5,
        comment: "The pediatric team was amazing with my child. They made the whole experience comfortable and less scary for both of us. Highly recommended!",
        date: "March 10, 2024"
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        role: "Neurology Patient",
        image: "/testimonials/patient3.png",
        rating: 5,
        comment: "From the reception to the medical staff, everyone was professional and caring. The follow-up care has been outstanding.",
        date: "March 5, 2024"
      },
      {
        id: "4",
        name: "David Thompson",
        role: "Orthopedic Patient",
        image: "/testimonials/patient1.png",
        rating: 5,
        comment: "The surgical team was excellent. Recovery was smooth thanks to their detailed post-op care instructions and follow-up appointments.",
        date: "February 28, 2024"
      },
      {
        id: "5",
        name: "Lisa Wang",
        role: "Dermatology Patient",
        image: "/testimonials/patient2.png",
        rating: 5,
        comment: "Professional service and state-of-the-art equipment. The dermatology department exceeded my expectations.",
        date: "February 20, 2024"
      }
    ];

    return NextResponse.json({
      success: true,
      testimonials,
      total: testimonials.length
    });

  } catch (error) {
    console.error('Error in testimonials API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch testimonials',
        testimonials: []
      },
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

    // For now, just return success (would implement with Prisma later)
    const result = {
      id: Date.now(),
      name,
      role,
      image,
      rating,
      comment,
      date: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      testimonial: result
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
} 
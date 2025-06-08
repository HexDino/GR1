import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDoctorReviews() {
  console.log('Seeding doctor reviews...');

  // Get completed appointments for reviews
  const completedAppointments = await prisma.appointment.findMany({
    where: { status: 'COMPLETED' },
    include: {
      patient: true,
      doctor: true
    },
    take: 40
  });

  if (completedAppointments.length === 0) {
    console.log('ℹ️ No completed appointments found, skipping reviews seeding...');
    return;
  }

  const reviewComments = {
    5: [
      "Excellent doctor! Very thorough examination and clear explanation of my condition. Highly recommend!",
      "Outstanding service! Dr. was very professional and made me feel comfortable throughout the visit.",
      "Amazing experience! The doctor took time to listen to all my concerns and provided excellent care.",
      "Perfect visit! Very knowledgeable doctor with excellent bedside manner. Will definitely return.",
      "Exceptional care! The doctor was patient, understanding, and provided comprehensive treatment.",
      "Superb medical service! Professional, caring, and very effective treatment. Couldn't be happier!",
      "Wonderful doctor! Clear communication, thorough examination, and excellent follow-up care.",
      "Outstanding physician! Very experienced and provided exactly the care I needed. Highly recommended!"
    ],
    4: [
      "Very good doctor! Professional service and effective treatment. Would recommend to others.",
      "Good experience overall. Doctor was knowledgeable and helpful with my health concerns.",
      "Solid medical care. The doctor was thorough and provided good advice for my condition.",
      "Good visit! Doctor was professional and took time to address my questions.",
      "Very satisfied with the care received. Doctor was competent and friendly.",
      "Good medical service. Professional approach and effective treatment plan.",
      "Positive experience! Doctor was well-informed and provided good healthcare.",
      "Good doctor with solid medical knowledge. Would consider returning for future care."
    ],
    3: [
      "Average experience. Doctor was professional but consultation felt rushed.",
      "Decent medical care. Doctor was competent but could have been more thorough.",
      "Okay visit. Doctor addressed my concerns but explanation could have been clearer.",
      "Fair service. Doctor was professional but waiting time was quite long.",
      "Average consultation. Doctor was knowledgeable but bedside manner could improve.",
      "Satisfactory care. Doctor provided treatment but communication could be better.",
      "Decent experience overall. Doctor was competent but not particularly impressive.",
      "Reasonable medical service. Doctor was professional but nothing exceptional."
    ],
    2: [
      "Below average experience. Doctor seemed rushed and didn't fully address my concerns.",
      "Disappointing visit. Long waiting time and doctor appeared distracted during consultation.",
      "Poor communication. Doctor was knowledgeable but didn't explain things clearly.",
      "Unsatisfactory service. Doctor was professional but treatment didn't help much.",
      "Not impressed. Doctor seemed disinterested and consultation was very brief.",
      "Below expectations. Doctor was competent but customer service needs improvement.",
      "Mediocre experience. Doctor was professional but didn't inspire confidence.",
      "Poor bedside manner. Doctor was knowledgeable but not very approachable."
    ],
    1: [
      "Very poor experience. Doctor was unprofessional and didn't listen to my concerns.",
      "Terrible service! Long wait, rushed consultation, and ineffective treatment.",
      "Worst medical experience ever. Doctor was rude and dismissive of my symptoms.",
      "Extremely disappointed. Doctor seemed incompetent and made my condition worse.",
      "Awful visit! Doctor was unprofessional and provided incorrect diagnosis.",
      "Horrible experience. Doctor was impatient and didn't take my concerns seriously.",
      "Very unsatisfactory. Doctor was unprofessional and treatment was ineffective.",
      "Terrible medical service. Would never recommend this doctor to anyone."
    ]
  };

  const reviews = [];

  for (const appointment of completedAppointments) {
    // Skip if review already exists
    const existingReview = await prisma.doctorReview.findFirst({
      where: { 
        userId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id
      }
    });

    if (existingReview) continue;

    // 70% chance of having a review (not all patients leave reviews)
    if (Math.random() > 0.7) continue;

    // Generate rating (skewed towards positive)
    let rating: number;
    const rand = Math.random();
    if (rand < 0.4) rating = 5;
    else if (rand < 0.7) rating = 4;
    else if (rand < 0.85) rating = 3;
    else if (rand < 0.95) rating = 2;
    else rating = 1;

    const comments = reviewComments[rating as keyof typeof reviewComments];
    const comment = comments[Math.floor(Math.random() * comments.length)];

    const review = {
      rating,
      comment,
      isAnonymous: Math.random() < 0.2, // 20% anonymous reviews
      isPinned: rating === 5 && Math.random() < 0.1, // 10% of 5-star reviews are pinned
      images: [], // We'll keep images empty for simplicity
      userId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.id
    };

    reviews.push(review);
  }

  // Check if reviews already exist
  const existingCount = await prisma.doctorReview.count();
  
  if (existingCount === 0 && reviews.length > 0) {
    await prisma.doctorReview.createMany({
      data: reviews,
      skipDuplicates: true
    });

    // Update doctor ratings
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctor: true }
    });

    for (const doctor of doctors) {
      if (!doctor.doctor) continue;

      const doctorReviews = await prisma.doctorReview.findMany({
        where: { doctorId: doctor.doctor.id }
      });

      if (doctorReviews.length > 0) {
        const totalRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / doctorReviews.length;

        await prisma.doctor.update({
          where: { id: doctor.doctor.id },
          data: {
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalReviews: doctorReviews.length
          }
        });
      }
    }

    console.log(`✅ Created ${reviews.length} doctor reviews`);
  } else {
    console.log(`ℹ️ Doctor reviews already exist (${existingCount} found), skipping...`);
  }
} 
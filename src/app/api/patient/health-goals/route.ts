import { NextRequest, NextResponse } from 'next/server';

// Mock health goals data
const mockHealthGoals = [
  {
    id: '1',
    title: 'Lose 5kg in 3 months',
    description: 'Achieve healthy weight through diet and exercise',
    category: 'weight',
    target: '65',
    current: '70.5',
    unit: 'kg',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 55,
    status: 'active',
    priority: 'high',
    notes: 'Making good progress with diet changes',
    milestones: [
      {
        id: 'm1',
        title: 'Lose first 2kg',
        target: '68kg',
        completed: true,
        completedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'm2',
        title: 'Reach 67kg',
        target: '67kg',
        completed: false
      }
    ]
  },
  {
    id: '2',
    title: 'Exercise 4 times per week',
    description: 'Build consistent exercise routine',
    category: 'exercise',
    target: '4',
    current: '3',
    unit: 'times/week',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    status: 'active',
    priority: 'medium',
    notes: 'Consistency improving week by week',
    milestones: [
      {
        id: 'm3',
        title: 'Exercise 2 times per week',
        target: '2 times/week',
        completed: true,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'm4',
        title: 'Exercise 3 times per week',
        target: '3 times/week',
        completed: true,
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '3',
    title: 'Improve sleep quality',
    description: 'Get 7-8 hours of quality sleep nightly',
    category: 'sleep',
    target: '8',
    current: '6.5',
    unit: 'hours',
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 39 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 40,
    status: 'active',
    priority: 'medium',
    notes: 'Working on bedtime routine',
    milestones: [
      {
        id: 'm5',
        title: 'Establish bedtime routine',
        target: 'Consistent routine',
        completed: true,
        completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'm6',
        title: 'Sleep 7 hours consistently',
        target: '7 hours',
        completed: false
      }
    ]
  },
  {
    id: '4',
    title: 'Reduce stress levels',
    description: 'Practice meditation and stress management',
    category: 'mental_health',
    target: '3',
    current: '7',
    unit: 'stress level (1-10)',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 60,
    status: 'active',
    priority: 'high',
    notes: 'Daily meditation helping significantly',
    milestones: [
      {
        id: 'm7',
        title: 'Start daily meditation',
        target: '10 minutes daily',
        completed: true,
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '5',
    title: 'Quit smoking',
    description: 'Completely stop smoking cigarettes',
    category: 'general',
    target: '0',
    current: '0',
    unit: 'cigarettes/day',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    status: 'completed',
    priority: 'high',
    notes: 'Successfully quit 2 weeks ago!',
    milestones: [
      {
        id: 'm8',
        title: 'Reduce to 5 cigarettes/day',
        target: '5 cigarettes/day',
        completed: true,
        completedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'm9',
        title: 'Reduce to 1 cigarette/day',
        target: '1 cigarette/day',
        completed: true,
        completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'm10',
        title: 'Complete cessation',
        target: '0 cigarettes/day',
        completed: true,
        completedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';

    let filteredGoals = mockHealthGoals;

    // Filter by status
    if (status !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === status);
    }

    // Filter by category
    if (category !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.category === category);
    }

    return NextResponse.json({
      success: true,
      goals: filteredGoals
    });
  } catch (error) {
    console.error('Error fetching health goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health goals' },
      { status: 500 }
    );
  }
} 
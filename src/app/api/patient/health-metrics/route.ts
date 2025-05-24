import { NextRequest, NextResponse } from 'next/server';

// Mock health metrics data
const mockHealthMetrics = [
  {
    id: '1',
    type: 'blood_pressure',
    value: '120/80',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    notes: 'Normal reading'
  },
  {
    id: '2',
    type: 'heart_rate',
    value: '72',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    notes: 'Resting heart rate'
  },
  {
    id: '3',
    type: 'weight',
    value: '70.5',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    notes: 'Morning weight'
  },
  {
    id: '4',
    type: 'blood_sugar',
    value: '95',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    notes: 'Fasting glucose'
  },
  {
    id: '5',
    type: 'blood_pressure',
    value: '118/78',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    notes: 'Evening reading'
  },
  {
    id: '6',
    type: 'heart_rate',
    value: '68',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    notes: 'After exercise'
  },
  {
    id: '7',
    type: 'weight',
    value: '70.2',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    notes: 'Weekly weigh-in'
  },
  {
    id: '8',
    type: 'blood_sugar',
    value: '102',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    notes: 'Post-meal reading'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Filter metrics based on date range
    let daysBack = 30;
    switch (range) {
      case '7d':
        daysBack = 7;
        break;
      case '30d':
        daysBack = 30;
        break;
      case '90d':
        daysBack = 90;
        break;
    }

    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const filteredMetrics = mockHealthMetrics.filter(metric => 
      new Date(metric.date) >= cutoffDate
    );

    return NextResponse.json({
      success: true,
      metrics: filteredMetrics
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health metrics' },
      { status: 500 }
    );
  }
} 
import { prisma } from '@/lib/db/prisma'

/**
 * Phân tích chỉ số huyết áp và đưa ra khuyến nghị
 */
export async function analyzeBloodPressure(userId: string, period = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - period)
    
    // Lấy các chỉ số huyết áp từ khoảng thời gian đã chỉ định
    const readings = await prisma.healthMetric.findMany({
      where: {
        userId,
        type: 'BLOOD_PRESSURE',
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    
    if (readings.length === 0) {
      return {
        status: 'NO_DATA',
        message: 'No blood pressure readings found for the specified period.',
      }
    }
    
    // Phân tích các giá trị và tính trung bình
    const systolicValues: number[] = []
    const diastolicValues: number[] = []
    
    readings.forEach(reading => {
      const values = reading.value.toString().split('/')
      if (values.length === 2) {
        systolicValues.push(parseInt(values[0], 10))
        diastolicValues.push(parseInt(values[1], 10))
      }
    })
    
    const avgSystolic = systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length
    const avgDiastolic = diastolicValues.reduce((sum, val) => sum + val, 0) / diastolicValues.length
    
    // Phân tích các giá trị huyết áp
    let status = 'NORMAL'
    let message = 'Your blood pressure is within the normal range.'
    
    if (avgSystolic >= 140 || avgDiastolic >= 90) {
      status = 'HIGH'
      message = 'Your blood pressure is elevated. Consider consulting a healthcare professional.'
      
      if (avgSystolic >= 180 || avgDiastolic >= 120) {
        status = 'CRITICAL'
        message = 'Your blood pressure is critically high. Seek medical attention immediately.'
      }
    } else if (avgSystolic < 90 || avgDiastolic < 60) {
      status = 'LOW'
      message = 'Your blood pressure is lower than normal. Consider consulting a healthcare professional.'
    }
    
    // Kiểm tra xu hướng
    let trend = 'STABLE'
    if (systolicValues.length >= 3) {
      const firstHalf = systolicValues.slice(0, Math.floor(systolicValues.length / 2))
      const secondHalf = systolicValues.slice(Math.floor(systolicValues.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
      
      if (secondHalfAvg - firstHalfAvg > 5) {
        trend = 'INCREASING'
      } else if (firstHalfAvg - secondHalfAvg > 5) {
        trend = 'DECREASING'
      }
    }
    
    return {
      status,
      message,
      trend,
      data: {
        readings: readings.length,
        avgSystolic: Math.round(avgSystolic),
        avgDiastolic: Math.round(avgDiastolic),
        minSystolic: Math.min(...systolicValues),
        maxSystolic: Math.max(...systolicValues),
        minDiastolic: Math.min(...diastolicValues),
        maxDiastolic: Math.max(...diastolicValues),
      },
    }
  } catch (error) {
    console.error('Error analyzing blood pressure:', error)
    throw error
  }
}

/**
 * Tính BMI dựa trên chiều cao và cân nặng
 */
export function calculateBMI(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  
  let category
  let recommendation
  
  if (bmi < 18.5) {
    category = 'UNDERWEIGHT'
    recommendation = 'Consider consulting a healthcare professional about a nutrition plan to achieve a healthy weight.'
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'NORMAL'
    recommendation = 'Maintain your current healthy weight through regular exercise and balanced nutrition.'
  } else if (bmi >= 25 && bmi < 30) {
    category = 'OVERWEIGHT'
    recommendation = 'Consider lifestyle modifications such as diet changes and increased physical activity.'
  } else {
    category = 'OBESE'
    recommendation = 'Consult a healthcare professional for a comprehensive weight management plan.'
  }
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    recommendation,
  }
}

/**
 * Tạo thông tin sức khỏe dựa trên dữ liệu người dùng
 */
export async function generateHealthInsights(userId: string) {
  try {
    // Lấy dữ liệu hồ sơ người dùng
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        height: true,
        weight: true,
        dateOfBirth: true,
        gender: true,
        medicalHistory: true,
        allergies: true,
      },
    })
    
    if (!profile) {
      return {
        status: 'NO_DATA',
        message: 'Profile data not found.',
      }
    }
    
    const insights = []
    
    // Tính BMI nếu có chiều cao và cân nặng
    if (profile.height && profile.weight) {
      const bmiResult = calculateBMI(profile.height, profile.weight)
      insights.push({
        type: 'BMI',
        status: bmiResult.category,
        message: `Your BMI is ${bmiResult.bmi} (${bmiResult.category.toLowerCase()})`,
        recommendation: bmiResult.recommendation,
      })
    }
    
    // Lấy các chỉ số sức khỏe gần đây
    const recentMetrics = await prisma.healthMetric.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 ngày gần đây
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Phân tích huyết áp nếu có sẵn
    const bloodPressureMetrics = recentMetrics.filter(m => m.type === 'BLOOD_PRESSURE')
    if (bloodPressureMetrics.length > 0) {
      const bpAnalysis = await analyzeBloodPressure(userId)
      insights.push({
        type: 'BLOOD_PRESSURE',
        status: bpAnalysis.status,
        message: bpAnalysis.message,
        data: bpAnalysis.data,
      })
    }
    
    // Thêm khuyến nghị chung dựa trên dữ liệu hồ sơ
    if (profile.medicalHistory) {
      insights.push({
        type: 'MEDICAL_HISTORY',
        status: 'INFO',
        message: 'Regular check-ups are recommended based on your medical history.',
      })
    }
    
    // Khuyến nghị dựa trên tuổi
    if (profile.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
      
      if (age >= 40) {
        insights.push({
          type: 'AGE',
          status: 'INFO',
          message: 'Regular health screenings are recommended for your age group.',
          recommendation: 'Consider annual check-ups, cholesterol tests, and other age-appropriate screenings.',
        })
      }
    }
    
    return {
      timestamp: new Date(),
      insights,
    }
  } catch (error) {
    console.error('Error generating health insights:', error)
    throw error
  }
} 
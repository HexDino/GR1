import { prisma } from '@/lib/db/prisma'
import { NotificationType } from '@prisma/client'

export { NotificationType }

export async function createNotification({
  userId,
  title,
  message,
  type,
}: {
  userId: string
  title: string
  message: string
  type: NotificationType
  relatedId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    })
    
    // Ở đây thường sẽ kích hoạt thông báo real-time
    // thông qua WebSockets hoặc công nghệ tương tự
    await triggerRealTimeNotification(notification)
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

export async function getUserNotifications(userId: string, limit = 10, offset = 0) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
    
    const totalCount = await prisma.notification.count({
      where: { userId },
    })
    
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    })
    
    return {
      notifications,
      totalCount,
      unreadCount,
    }
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

// Hàm này sẽ được implement với dịch vụ nhắn tin real-time
// như Socket.io, Pusher, hoặc tương tự
async function triggerRealTimeNotification(notification: any) {
  // Implementation phụ thuộc vào giải pháp real-time của bạn
  // Đây là placeholder
  console.log('Would send real-time notification:', notification)
  
  // Ví dụ implementation với websocket service giả định:
  // await websocketService.sendToUser(notification.userId, {
  //   type: 'NEW_NOTIFICATION',
  //   data: notification,
  // })
  
  return true
} 
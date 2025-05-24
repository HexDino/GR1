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
    
    // Here you would typically trigger real-time notifications
    // through WebSockets or a similar technology
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

// This function would be implemented with a real-time messaging service
// like Socket.io, Pusher, or similar
async function triggerRealTimeNotification(notification: any) {
  // Implementation depends on your real-time solution
  // This is a placeholder
  console.log('Would send real-time notification:', notification)
  
  // Example implementation with a hypothetical websocket service:
  // await websocketService.sendToUser(notification.userId, {
  //   type: 'NEW_NOTIFICATION',
  //   data: notification,
  // })
  
  return true
} 
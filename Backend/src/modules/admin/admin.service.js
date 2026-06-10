const prisma = require('../../config/db')
const orderService = require('../orders/order.service')
const vendorService = require('../vendor/vendor.service')
const { parsePagination, paginationMeta } = require('../../utils/pagination')
const { generateCardPDF } = require('../../utils/pdf')
const { sendOrderConfirmationEmail, sendVendorOrderEmail } = require('../../utils/mailService')

async function getDashboard() {
  const [
    totalUsers,
    activeUsers,
    pending,
    confirmed,
    completed,
    cancelled,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_active: true } }),
    prisma.printingOrder.count({ where: { status: 'PENDING' } }),
    prisma.printingOrder.count({ where: { status: 'CONFIRMED' } }),
    prisma.printingOrder.count({ where: { status: 'COMPLETED' } }),
    prisma.printingOrder.count({ where: { status: 'CANCELLED' } }),
    prisma.printingOrder.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { username: true, email: true } },
      },
    }),
  ])

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    orders: { pending, confirmed, completed, cancelled },
    recent_orders: recentOrders,
  }
}

async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query, 20, 50)

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        profile: { select: { completeness_score: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count(),
  ])

  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    is_active: u.is_active,
    profile_completion: u.profile?.completeness_score ?? 0,
    order_count: u._count.orders,
    created_at: u.created_at,
  }))

  return { users: data, meta: paginationMeta(total, page, limit) }
}

async function getUserDetail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      orders: { orderBy: { created_at: 'desc' } },
    },
  })

  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  const { password_hash, google_id, ...safeUser } = user
  return safeUser
}

async function updateUserStatus(userId, isActive) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  return prisma.user.update({
    where: { id: userId },
    data: { is_active: isActive },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      is_active: true,
    },
  })
}

async function updateOrderStatus(orderId, status) {
  const { order, previousStatus, userWithProfile } = await orderService.updateOrderStatus(
    orderId,
    status
  )

  if (status === 'CONFIRMED' && previousStatus !== 'CONFIRMED') {
    const qr = await prisma.qRCode.findUnique({
      where: {
        user_id_type: { user_id: order.user_id, type: order.qr_type },
      },
    })

    const profile = userWithProfile.profile || {}
    const pdfBuffer = await generateCardPDF(
      profile,
      qr?.qr_data_url,
      order.design_config
    )

    await sendOrderConfirmationEmail(order, userWithProfile, pdfBuffer).catch(console.error)
  }

  return order
}

async function sendOrderToVendor(orderId, vendorId) {
  const order = await orderService.getOrderById(orderId)
  const vendor = await vendorService.getActiveVendor(vendorId)

  const updated = await prisma.printingOrder.update({
    where: { id: orderId },
    data: { vendor_id: vendorId },
    include: {
      user: { include: { profile: true } },
      vendor: true,
    },
  })

  const qr = await prisma.qRCode.findUnique({
    where: {
      user_id_type: { user_id: order.user_id, type: order.qr_type },
    },
  })

  const pdfBuffer = await generateCardPDF(
    order.user.profile || {},
    qr?.qr_data_url,
    order.design_config
  )

  await sendVendorOrderEmail(updated, order.user, vendor, pdfBuffer).catch(console.error)

  return updated
}

module.exports = {
  getDashboard,
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateOrderStatus,
  sendOrderToVendor,
}

const prisma = require('../../config/db')
const { parsePagination, paginationMeta } = require('../../utils/pagination')

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

function canTransition(current, next) {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false
}

async function createOrder(userId, data) {
  const qr = await prisma.qRCode.findUnique({
    where: { user_id_type: { user_id: userId, type: data.qr_type } },
  })

  if (!qr) {
    const err = new Error(`No ${data.qr_type} QR code exists. Generate one first.`)
    err.status = 400
    throw err
  }

  return prisma.printingOrder.create({
    data: {
      user_id: userId,
      design_config: data.design_config,
      qr_type: data.qr_type,
      quantity: data.quantity,
      notes: data.notes,
      status: 'PENDING',
    },
  })
}

async function listUserOrders(userId, query) {
  const { page, limit, skip } = parsePagination(query, 10, 50)
  const where = { user_id: userId }

  if (query.status) where.status = query.status

  const [orders, total] = await Promise.all([
    prisma.printingOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.printingOrder.count({ where }),
  ])

  return { orders, meta: paginationMeta(total, page, limit) }
}

async function getUserOrder(userId, orderId) {
  const order = await prisma.printingOrder.findFirst({
    where: { id: orderId, user_id: userId },
  })

  if (!order) {
    const err = new Error('Order not found')
    err.status = 404
    throw err
  }

  return order
}

async function cancelOrder(userId, orderId) {
  const order = await getUserOrder(userId, orderId)

  if (order.status !== 'PENDING') {
    const err = new Error('Only pending orders can be cancelled')
    err.status = 422
    throw err
  }

  return prisma.printingOrder.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  })
}

async function listAllOrders(query) {
  const { page, limit, skip } = parsePagination(query, 20, 50)
  const where = {}

  if (query.status) where.status = query.status
  if (query.vendor_id) where.vendor_id = parseInt(query.vendor_id, 10)

  const [orders, total] = await Promise.all([
    prisma.printingOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
        vendor: true,
      },
    }),
    prisma.printingOrder.count({ where }),
  ])

  return { orders, meta: paginationMeta(total, page, limit) }
}

async function getOrderById(orderId) {
  const order = await prisma.printingOrder.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          profile: true,
        },
      },
      vendor: true,
    },
  })

  if (!order) {
    const err = new Error('Order not found')
    err.status = 404
    throw err
  }

  return order
}

async function updateOrderStatus(orderId, newStatus) {
  const order = await prisma.printingOrder.findUnique({
    where: { id: orderId },
    include: {
      user: { include: { profile: true } },
    },
  })

  if (!order) {
    const err = new Error('Order not found')
    err.status = 404
    throw err
  }

  if (!canTransition(order.status, newStatus)) {
    const err = new Error(`Cannot transition from ${order.status} to ${newStatus}`)
    err.status = 422
    throw err
  }

  const updated = await prisma.printingOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      user: { select: { id: true, username: true, email: true } },
      vendor: true,
    },
  })

  return { order: updated, previousStatus: order.status, userWithProfile: order.user }
}

module.exports = {
  createOrder,
  listUserOrders,
  getUserOrder,
  cancelOrder,
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  canTransition,
}

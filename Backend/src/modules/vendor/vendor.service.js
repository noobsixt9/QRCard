const prisma = require('../../config/db')

async function createVendor(data) {
  const existing = await prisma.vendor.findUnique({ where: { email: data.email } })
  if (existing) {
    const err = new Error('Vendor with this email already exists')
    err.status = 409
    throw err
  }

  return prisma.vendor.create({ data })
}

async function listVendors() {
  const vendors = await prisma.vendor.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return vendors.map(({ _count, ...vendor }) => ({
    ...vendor,
    order_count: _count.orders,
  }))
}

async function getVendorById(vendorId) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      orders: {
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      },
    },
  })

  if (!vendor) {
    const err = new Error('Vendor not found')
    err.status = 404
    throw err
  }

  return vendor
}

async function updateVendor(vendorId, data) {
  await getVendorById(vendorId)

  if (data.email) {
    const existing = await prisma.vendor.findFirst({
      where: { email: data.email, NOT: { id: vendorId } },
    })
    if (existing) {
      const err = new Error('Vendor with this email already exists')
      err.status = 409
      throw err
    }
  }

  return prisma.vendor.update({
    where: { id: vendorId },
    data,
  })
}

async function deactivateVendor(vendorId) {
  await getVendorById(vendorId)

  return prisma.vendor.update({
    where: { id: vendorId },
    data: { is_active: false },
  })
}

async function getActiveVendor(vendorId) {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, is_active: true },
  })

  if (!vendor) {
    const err = new Error('Vendor not found or inactive')
    err.status = 404
    throw err
  }

  return vendor
}

module.exports = {
  createVendor,
  listVendors,
  getVendorById,
  updateVendor,
  deactivateVendor,
  getActiveVendor,
}

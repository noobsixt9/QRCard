const adminService = require('./admin.service')
const orderService = require('../orders/order.service')
const vendorService = require('../vendor/vendor.service')
const { z } = require('zod')

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
})

const userStatusSchema = z.object({
  is_active: z.boolean(),
})

async function dashboard(req, res, next) {
  try {
    const data = await adminService.getDashboard()
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

async function listOrders(req, res, next) {
  try {
    const { orders, meta } = await orderService.listAllOrders(req.query)
    res.status(200).json({ success: true, data: orders, meta })
  } catch (err) {
    next(err)
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(parseInt(req.params.id, 10))
    res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const parsed = statusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }

    const order = await adminService.updateOrderStatus(
      parseInt(req.params.id, 10),
      parsed.data.status
    )

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

async function sendToVendor(req, res, next) {
  try {
    const vendorId = parseInt(req.body.vendor_id, 10)
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'vendor_id is required' })
    }

    const order = await adminService.sendOrderToVendor(
      parseInt(req.params.id, 10),
      vendorId
    )

    res.status(200).json({
      success: true,
      message: 'Order sent to vendor',
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

async function listUsers(req, res, next) {
  try {
    const { users, meta } = await adminService.listUsers(req.query)
    res.status(200).json({ success: true, data: users, meta })
  } catch (err) {
    next(err)
  }
}

async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserDetail(parseInt(req.params.id, 10))
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const parsed = userStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }

    const user = await adminService.updateUserStatus(
      parseInt(req.params.id, 10),
      parsed.data.is_active
    )

    res.status(200).json({
      success: true,
      message: 'User status updated',
      data: user,
    })
  } catch (err) {
    next(err)
  }
}

async function createVendor(req, res, next) {
  try {
    const vendor = await vendorService.createVendor(req.body)
    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    })
  } catch (err) {
    next(err)
  }
}

async function listVendors(req, res, next) {
  try {
    const vendors = await vendorService.listVendors()
    res.status(200).json({ success: true, data: vendors })
  } catch (err) {
    next(err)
  }
}

async function getVendor(req, res, next) {
  try {
    const vendor = await vendorService.getVendorById(parseInt(req.params.id, 10))
    res.status(200).json({ success: true, data: vendor })
  } catch (err) {
    next(err)
  }
}

async function updateVendor(req, res, next) {
  try {
    const vendor = await vendorService.updateVendor(
      parseInt(req.params.id, 10),
      req.body
    )
    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor,
    })
  } catch (err) {
    next(err)
  }
}

async function deleteVendor(req, res, next) {
  try {
    await vendorService.deactivateVendor(parseInt(req.params.id, 10))
    res.status(200).json({
      success: true,
      message: 'Vendor deactivated successfully',
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  dashboard,
  listOrders,
  getOrder,
  updateOrderStatus,
  sendToVendor,
  listUsers,
  getUser,
  updateUserStatus,
  createVendor,
  listVendors,
  getVendor,
  updateVendor,
  deleteVendor,
}

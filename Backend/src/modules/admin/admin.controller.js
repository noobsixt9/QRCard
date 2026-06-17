const adminService = require('./admin.service')
const orderService = require('../orders/order.service')
const vendorService = require('../vendor/vendor.service')
const { parseUuid } = require('../../utils/uuid')

async function dashboard(_req, res, next) {
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
    const orderId = parseUuid(req.params.id, 'order id')
    const order = await orderService.getOrderById(orderId)
    res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const orderId = parseUuid(req.params.id, 'order id')
    const order = await adminService.updateOrderStatus(orderId, req.body.status)
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

async function sendToVendor(req, res, next) {
  try {
    const orderId = parseUuid(req.params.id, 'order id')
    const result = await adminService.sendOrderToVendor(orderId, req.body.vendor_id)
    res.status(200).json({
      success: true,
      message: 'Order sent to vendor successfully',
      data: result,
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
    const userId = parseUuid(req.params.id, 'user id')
    const user = await adminService.getUserDetail(userId)
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const userId = parseUuid(req.params.id, 'user id')
    const user = await adminService.updateUserStatus(userId, req.body.is_active)
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
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

async function listVendors(_req, res, next) {
  try {
    const vendors = await vendorService.listVendors()
    res.status(200).json({ success: true, data: vendors })
  } catch (err) {
    next(err)
  }
}

async function getVendor(req, res, next) {
  try {
    const vendorId = parseUuid(req.params.id, 'vendor id')
    const vendor = await vendorService.getVendorById(vendorId)
    res.status(200).json({ success: true, data: vendor })
  } catch (err) {
    next(err)
  }
}

async function updateVendor(req, res, next) {
  try {
    const vendorId = parseUuid(req.params.id, 'vendor id')
    const vendor = await vendorService.updateVendor(vendorId, req.body)
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
    const vendorId = parseUuid(req.params.id, 'vendor id')
    const vendor = await vendorService.deactivateVendor(vendorId)
    res.status(200).json({
      success: true,
      message: 'Vendor deactivated successfully',
      data: vendor,
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

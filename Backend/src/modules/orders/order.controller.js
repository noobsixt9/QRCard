const orderService = require('./order.service')
const { parseUuid } = require('../../utils/uuid')

async function create(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body)
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

async function list(req, res, next) {
  try {
    const { orders, meta } = await orderService.listUserOrders(req.user.id, req.query)
    res.status(200).json({ success: true, data: orders, meta })
  } catch (err) {
    next(err)
  }
}

async function getOne(req, res, next) {
  try {
    const orderId = parseUuid(req.params.id, 'order id')
    const order = await orderService.getUserOrder(req.user.id, orderId)
    res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

async function cancel(req, res, next) {
  try {
    const orderId = parseUuid(req.params.id, 'order id')
    const order = await orderService.cancelOrder(req.user.id, orderId)
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, list, getOne, cancel }

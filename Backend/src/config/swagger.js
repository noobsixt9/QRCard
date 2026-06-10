const { buildSpec } = require('./openapi.spec')

const swaggerSpec = buildSpec()

module.exports = swaggerSpec

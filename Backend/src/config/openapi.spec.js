/**
 * Complete OpenAPI 3.0 specification for QRCard API.
 * Loaded directly by swagger.js (not generated from route JSDoc comments).
 */

const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: { type: 'object' },
  },
}

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
}

function buildSpec() {
  const serverUrl = process.env.APP_BASE_URL || 'http://localhost:5001'

  return {
    openapi: '3.0.0',
    info: {
      title: 'QRCard API',
      version: '1.0.0',
      description:
        'QR-based Digital Visiting Card Backend API — auth, profiles, QR codes, AI, orders, and admin.',
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Auth', description: 'Registration, login, OAuth' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'QR', description: 'Online and offline QR codes' },
      { name: 'AI', description: 'Gemini-powered bio and suggestions' },
      { name: 'Orders', description: 'Printing order placement' },
      { name: 'Admin', description: 'Admin dashboard and management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: successResponse,
        ErrorResponse: errorResponse,
        RegisterBody: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'rajan@example.com' },
            username: { type: 'string', example: 'rajan' },
            password: { type: 'string', example: 'SecurePass@123' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        ProfileUpdateBody: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            job_title: { type: 'string' },
            company: { type: 'string' },
            bio: { type: 'string' },
            phone: { type: 'string' },
            public_email: { type: 'string', format: 'email' },
            website: { type: 'string', format: 'uri' },
            address: { type: 'string' },
            social_links: {
              type: 'object',
              properties: {
                linkedin: { type: 'string', nullable: true },
                github: { type: 'string', nullable: true },
                twitter: { type: 'string', nullable: true },
                instagram: { type: 'string', nullable: true },
                facebook: { type: 'string', nullable: true },
              },
            },
          },
        },
        CreateOrderBody: {
          type: 'object',
          required: ['design_config', 'qr_type', 'quantity'],
          properties: {
            design_config: {
              type: 'object',
              properties: {
                template: { type: 'string', example: 'minimal-light' },
                primary_color: { type: 'string', example: '#1a1a2e' },
                secondary_color: { type: 'string', example: '#ffffff' },
                show_avatar: { type: 'boolean' },
                font: { type: 'string', example: 'inter' },
              },
            },
            qr_type: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
            quantity: { type: 'integer', minimum: 10, maximum: 500 },
            notes: { type: 'string' },
          },
        },
        OrderStatusBody: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
            },
          },
        },
        UserStatusBody: {
          type: 'object',
          required: ['is_active'],
          properties: { is_active: { type: 'boolean' } },
        },
        VendorBody: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        AssignVendorBody: {
          type: 'object',
          required: ['vendor_id'],
          properties: { vendor_id: { type: 'integer' } },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'API is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
            },
          },
          responses: {
            201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Email or username taken' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Current user info' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/google': {
        get: {
          tags: ['Auth'],
          summary: 'Redirect to Google OAuth consent screen',
          responses: {
            302: { description: 'Redirect to Google' },
            503: { description: 'Google OAuth not configured' },
          },
        },
      },
      '/api/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Google OAuth callback — issues JWT and redirects to frontend',
          responses: {
            302: { description: 'Redirect to frontend with token' },
          },
        },
      },
      '/api/profile': {
        get: {
          tags: ['Profile'],
          summary: 'Get own full profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile data' } },
        },
        put: {
          tags: ['Profile'],
          summary: 'Update own profile (partial update)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ProfileUpdateBody' } },
            },
          },
          responses: { 200: { description: 'Updated profile' } },
        },
      },
      '/api/profile/avatar': {
        post: {
          tags: ['Profile'],
          summary: 'Upload avatar image',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    avatar: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Avatar uploaded' } },
        },
        delete: {
          tags: ['Profile'],
          summary: 'Remove avatar',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Avatar removed' } },
        },
      },
      '/api/profile/public/{username}': {
        get: {
          tags: ['Profile'],
          summary: 'Public profile (no auth) — increments online QR scan count',
          parameters: [
            { name: 'username', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Public profile fields' },
            404: { description: 'Not found' },
          },
        },
      },
      '/api/qr/online': {
        post: {
          tags: ['QR'],
          summary: 'Generate or regenerate online QR (profile URL)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Online QR data URL' } },
        },
      },
      '/api/qr/offline': {
        post: {
          tags: ['QR'],
          summary: 'Generate or regenerate offline vCard QR',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Offline QR + vCard content' } },
        },
      },
      '/api/qr': {
        get: {
          tags: ['QR'],
          summary: 'Get both QR codes for current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Online and offline QR codes' } },
        },
      },
      '/api/qr/{type}': {
        delete: {
          tags: ['QR'],
          summary: 'Delete a QR code',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'type',
              in: 'path',
              required: true,
              schema: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
            },
          ],
          responses: { 200: { description: 'QR deleted' } },
        },
      },
      '/api/ai/bio': {
        post: {
          tags: ['AI'],
          summary: 'Generate professional bio via Gemini',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Generated bio' },
            400: { description: 'Profile incomplete' },
            429: { description: 'Rate limit exceeded' },
            502: { description: 'Gemini unavailable' },
          },
        },
      },
      '/api/ai/completeness': {
        get: {
          tags: ['AI'],
          summary: 'Profile completeness score + AI suggestions',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Score, level, and suggestions' } },
        },
      },
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Place a new printing order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateOrderBody' } },
            },
          },
          responses: { 201: { description: 'Order created' } },
        },
        get: {
          tags: ['Orders'],
          summary: 'List own orders (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
            },
          ],
          responses: { 200: { description: 'Paginated order list' } },
        },
      },
      '/api/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get single own order',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order detail' }, 404: { description: 'Not found' } },
        },
      },
      '/api/orders/{id}/cancel': {
        patch: {
          tags: ['Orders'],
          summary: 'Cancel own pending order',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order cancelled' }, 422: { description: 'Cannot cancel' } },
        },
      },
      '/api/admin/dashboard': {
        get: {
          tags: ['Admin'],
          summary: 'Dashboard stats',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User and order statistics' } },
        },
      },
      '/api/admin/orders': {
        get: {
          tags: ['Admin'],
          summary: 'List all orders',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'vendor_id', in: 'query', schema: { type: 'integer' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'All orders' } },
        },
      },
      '/api/admin/orders/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get single order with user and vendor details',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Order detail' } },
        },
      },
      '/api/admin/orders/{id}/status': {
        patch: {
          tags: ['Admin'],
          summary: 'Update order status',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/OrderStatusBody' } },
            },
          },
          responses: { 200: { description: 'Status updated' }, 422: { description: 'Invalid transition' } },
        },
      },
      '/api/admin/orders/{id}/send-to-vendor': {
        post: {
          tags: ['Admin'],
          summary: 'Assign vendor and email print PDF',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AssignVendorBody' } },
            },
          },
          responses: { 200: { description: 'Sent to vendor' } },
        },
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'List all users',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'User list with completion %' } },
        },
      },
      '/api/admin/users/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get user detail with profile and orders',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'User detail' } },
        },
      },
      '/api/admin/users/{id}/status': {
        patch: {
          tags: ['Admin'],
          summary: 'Activate or deactivate user',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserStatusBody' } },
            },
          },
          responses: { 200: { description: 'User status updated' } },
        },
      },
      '/api/admin/vendors': {
        post: {
          tags: ['Admin'],
          summary: 'Create vendor',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VendorBody' } },
            },
          },
          responses: { 201: { description: 'Vendor created' } },
        },
        get: {
          tags: ['Admin'],
          summary: 'List active vendors',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Vendor list' } },
        },
      },
      '/api/admin/vendors/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get vendor with assigned orders',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vendor detail' } },
        },
        put: {
          tags: ['Admin'],
          summary: 'Update vendor',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VendorBody' } },
            },
          },
          responses: { 200: { description: 'Vendor updated' } },
        },
        delete: {
          tags: ['Admin'],
          summary: 'Deactivate vendor (soft delete)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vendor deactivated' } },
        },
      },
    },
  }
}

module.exports = { buildSpec }

const request = require('supertest')
const app = require('../src/app')

describe('Auth API', () => {
  const unique = Date.now()
  const testUser = {
    email: `test${unique}@example.com`,
    username: `user_${unique}`,
    password: 'SecurePass@123',
  }

  let token

  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('POST /api/auth/register creates user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    token = res.body.data.token
  })

  it('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
  })

  it('GET /api/auth/me returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.username).toBe(testUser.username)
  })
})

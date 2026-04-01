import request from 'supertest';
import { buildApp, connectTestDB, clearTestDB, closeTestDB } from './testHelpers.js';

const app = buildApp();

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await closeTestDB(); });

// ─── helpers ──────────────────────────────────────────────────────────────────

const registerUser = (overrides = {}) =>
  request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: 'test@example.com', password: 'password123', ...overrides });

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(res.body.token).toBeDefined();
    expect(res.body.password).toBeUndefined(); // never exposed
  });

  it('returns 400 when email is already registered', async () => {
    await registerUser();
    const res = await registerUser(); // duplicate

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nope@example.com' }); // no name or password

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => { await registerUser(); });

  it('returns user + token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe('test@example.com');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 401 for an email that does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

// ─── Protected route guard ────────────────────────────────────────────────────

describe('Protected route — no token', () => {
  it('returns 401 when Authorization header is absent', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', 'Bearer this.is.not.valid');
    expect(res.status).toBe(401);
  });
});

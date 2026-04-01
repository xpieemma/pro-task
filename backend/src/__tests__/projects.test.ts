import request from 'supertest';
import { buildApp, connectTestDB, clearTestDB, closeTestDB } from './testHelpers.js';

const app = buildApp();

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await closeTestDB(); });

// ─── helpers ──────────────────────────────────────────────────────────────────

const createUser = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Alice', email: 'alice@example.com', password: 'password123', ...overrides });
  return { token: res.body.token as string, id: res.body._id as string };
};

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

const createProject = (token: string, overrides = {}) =>
  request(app)
    .post('/api/projects')
    .set(authHeader(token))
    .send({ name: 'Test Project', description: 'A project', ...overrides });

// ─── GET /api/projects ────────────────────────────────────────────────────────

describe('GET /api/projects', () => {
  it('returns an empty array when user has no projects', async () => {
    const { token } = await createUser();
    const res = await request(app).get('/api/projects').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns only projects owned by or shared with the user', async () => {
    const { token: tokenA } = await createUser();
    const { token: tokenB } = await createUser({
      email: 'bob@example.com',
      name: 'Bob',
    });

    await createProject(tokenA);
    await createProject(tokenB, { name: "Bob's Project" });

    const res = await request(app).get('/api/projects').set(authHeader(tokenA));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Project');
  });
});

// ─── POST /api/projects ───────────────────────────────────────────────────────

describe('POST /api/projects', () => {
  it('creates a project and returns it with owner populated', async () => {
    const { token } = await createUser();
    const res = await createProject(token);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Project');
    expect(res.body.description).toBe('A project');
    expect(res.body._id).toBeDefined();
    expect(res.body.owner).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/projects')
      .set(authHeader(token))
      .send({ description: 'No name' });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────

describe('GET /api/projects/:id', () => {
  it('returns the project with populated owner and collaborators', async () => {
    const { token } = await createUser();
    const created = await createProject(token);
    const projectId = created.body._id;

    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(projectId);
    expect(res.body.owner).toHaveProperty('name');
    expect(res.body.owner).toHaveProperty('email');
    expect(res.body.owner).not.toHaveProperty('password');
  });

  it('returns 403 when a non-member tries to view the project', async () => {
    const { token: ownerToken } = await createUser();
    const { token: strangerToken } = await createUser({
      email: 'stranger@example.com',
      name: 'Stranger',
    });
    const created = await createProject(ownerToken);

    const res = await request(app)
      .get(`/api/projects/${created.body._id}`)
      .set(authHeader(strangerToken));

    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent project ID', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get('/api/projects/000000000000000000000000')
      .set(authHeader(token));

    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────

describe('PUT /api/projects/:id', () => {
  it('owner can update name and description', async () => {
    const { token } = await createUser();
    const created = await createProject(token);

    const res = await request(app)
      .put(`/api/projects/${created.body._id}`)
      .set(authHeader(token))
      .send({ name: 'Renamed Project', description: 'New desc' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed Project');
    expect(res.body.description).toBe('New desc');
  });

  it('non-owner cannot update the project', async () => {
    const { token: ownerToken } = await createUser();
    const { token: otherToken } = await createUser({
      email: 'other@example.com',
      name: 'Other',
    });
    const created = await createProject(ownerToken);

    const res = await request(app)
      .put(`/api/projects/${created.body._id}`)
      .set(authHeader(otherToken))
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(404); // returns 404 (not found or unauthorized)
  });
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────

describe('DELETE /api/projects/:id', () => {
  it('owner can delete their project', async () => {
    const { token } = await createUser();
    const created = await createProject(token);

    const res = await request(app)
      .delete(`/api/projects/${created.body._id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);

    // Verify it's gone
    const check = await request(app)
      .get(`/api/projects/${created.body._id}`)
      .set(authHeader(token));
    expect(check.status).toBe(404);
  });

  it('non-owner cannot delete the project', async () => {
    const { token: ownerToken } = await createUser();
    const { token: otherToken } = await createUser({
      email: 'other@example.com',
      name: 'Other',
    });
    const created = await createProject(ownerToken);

    const res = await request(app)
      .delete(`/api/projects/${created.body._id}`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/projects/:id/invite ───────────────────────────────────────────

describe('POST /api/projects/:id/invite', () => {
  it('owner can invite an existing user as collaborator', async () => {
    const { token: ownerToken } = await createUser();
    // Register the invitee first
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });

    const created = await createProject(ownerToken);

    const res = await request(app)
      .post(`/api/projects/${created.body._id}/invite`)
      .set(authHeader(ownerToken))
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/collaborator added/i);

    // Bob should now see the project
    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'password123' });
    const bobProjects = await request(app)
      .get('/api/projects')
      .set(authHeader(bobLogin.body.token));
    expect(bobProjects.body).toHaveLength(1);
  });

  it('returns 404 when inviting an email that is not registered', async () => {
    const { token } = await createUser();
    const created = await createProject(token);

    const res = await request(app)
      .post(`/api/projects/${created.body._id}/invite`)
      .set(authHeader(token))
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(404);
  });

  it('non-owner cannot invite collaborators', async () => {
    const { token: ownerToken } = await createUser();
    const { token: otherToken } = await createUser({
      email: 'other@example.com',
      name: 'Other',
    });
    const created = await createProject(ownerToken);

    const res = await request(app)
      .post(`/api/projects/${created.body._id}/invite`)
      .set(authHeader(otherToken))
      .send({ email: 'alice@example.com' });

    expect(res.status).toBe(403);
  });
});

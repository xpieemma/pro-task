import request from 'supertest';
import { buildApp, connectTestDB, clearTestDB, closeTestDB } from './testHelpers.js';

const app = buildApp();

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearTestDB(); });
afterAll(async () => { await closeTestDB(); });

// ─── helpers ──────────────────────────────────────────────────────────────────

const registerAndLogin = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Alice', email: 'alice@example.com', password: 'password123', ...overrides });
  return { token: res.body.token as string, userId: res.body._id as string };
};

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

const mkProject = async (token: string, name = 'Sprint 1') => {
  const res = await request(app)
    .post('/api/projects')
    .set(authHeader(token))
    .send({ name, description: 'Test project' });
  return res.body._id as string;
};

const mkTask = async (token: string, projectId: string, overrides = {}) =>
  request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set(authHeader(token))
    .send({ title: 'Fix bug', description: 'Details here', ...overrides });

// ─── GET /api/projects/:projectId/tasks ───────────────────────────────────────

describe('GET /api/projects/:projectId/tasks', () => {
  it('returns an empty array when project has no tasks', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all tasks belonging to the project', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    await mkTask(token, projectId, { title: 'Task A' });
    await mkTask(token, projectId, { title: 'Task B' });

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((t: any) => t.title);
    expect(titles).toContain('Task A');
    expect(titles).toContain('Task B');
  });

  it('returns 403 for a user with no access to the project', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      email: 'other@example.com',
      name: 'Other',
    });
    const projectId = await mkProject(ownerToken);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(403);
  });

  it('collaborator can read tasks', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: collabToken } = await registerAndLogin({
      email: 'collab@example.com',
      name: 'Collab',
    });
    const projectId = await mkProject(ownerToken);
    await mkTask(ownerToken, projectId, { title: 'Owner task' });

    // Invite collaborator
    await request(app)
      .post(`/api/projects/${projectId}/invite`)
      .set(authHeader(ownerToken))
      .send({ email: 'collab@example.com' });

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(collabToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

// ─── POST /api/projects/:projectId/tasks ──────────────────────────────────────

describe('POST /api/projects/:projectId/tasks', () => {
  it('creates a task with default status "To Do"', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await mkTask(token, projectId);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Fix bug');
    expect(res.body.description).toBe('Details here');
    expect(res.body.status).toBe('To Do');
    expect(res.body._id).toBeDefined();
    expect(res.body.project).toBe(projectId);
  });

  it('creates a task with an explicit status', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await mkTask(token, projectId, { title: 'Done task', status: 'Done' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Done');
  });

  it('creates a task with a dueDate and persists it', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const due = '2025-12-31T00:00:00.000Z';

    const res = await mkTask(token, projectId, { title: 'Due task', dueDate: due });

    expect(res.status).toBe(201);
    expect(new Date(res.body.dueDate).toISOString()).toBe(due);
  });

  it('returns 400 when title is missing', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(authHeader(token))
      .send({ description: 'No title here' });

    expect(res.status).toBe(400);
  });

  it('returns 403 when user has no project access', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      email: 'other@example.com',
      name: 'Other',
    });
    const projectId = await mkProject(ownerToken);

    const res = await mkTask(otherToken, projectId);

    expect(res.status).toBe(403);
  });

  it('creates an activity entry after task creation', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    await mkTask(token, projectId, { title: 'Tracked task' });

    const actRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    expect(actRes.status).toBe(200);
    expect(actRes.body).toHaveLength(1);
    expect(actRes.body[0].action).toBe('created task');
    expect(actRes.body[0].details).toContain('Tracked task');
  });
});

// ─── PUT /api/projects/:projectId/tasks/:taskId ───────────────────────────────

describe('PUT /api/projects/:projectId/tasks/:taskId', () => {
  it('updates title and description', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId);
    const taskId = taskRes.body._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ title: 'Updated title', description: 'New desc' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
    expect(res.body.description).toBe('New desc');
  });

  it('updates status and logs a "changed status" activity', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId, { title: 'Move me' });
    const taskId = taskRes.body._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');

    const actRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    const actions = actRes.body.map((a: any) => a.action);
    expect(actions).toContain('changed status');
    const statusChange = actRes.body.find((a: any) => a.action === 'changed status');
    expect(statusChange.details).toContain('To Do');
    expect(statusChange.details).toContain('In Progress');
  });

  it('updates dueDate and logs a "changed due date" activity', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId);
    const taskId = taskRes.body._id;
    const newDue = '2026-06-15T00:00:00.000Z';

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ dueDate: newDue });

    expect(res.status).toBe(200);
    expect(new Date(res.body.dueDate).toISOString()).toBe(newDue);

    const actRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    const actions = actRes.body.map((a: any) => a.action);
    expect(actions).toContain('changed due date');
  });

  it('can clear dueDate by passing null', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId, { dueDate: '2025-01-01T00:00:00.000Z' });
    const taskId = taskRes.body._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ dueDate: null });

    expect(res.status).toBe(200);
    expect(res.body.dueDate).toBeNull();
  });

  it('returns 404 for a non-existent task', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/000000000000000000000000`)
      .set(authHeader(token))
      .send({ title: 'Ghost' });

    expect(res.status).toBe(404);
  });

  it('returns 403 when a non-member tries to update a task', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      email: 'other@example.com',
      name: 'Other',
    });
    const projectId = await mkProject(ownerToken);
    const taskRes = await mkTask(ownerToken, projectId);
    const taskId = taskRes.body._id;

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(otherToken))
      .send({ title: 'Hijacked' });

    expect(res.status).toBe(403);
  });

  it('collaborator can update a task', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: collabToken } = await registerAndLogin({
      email: 'collab@example.com',
      name: 'Collab',
    });
    const projectId = await mkProject(ownerToken);
    const taskRes = await mkTask(ownerToken, projectId, { title: 'Collab edits me' });
    const taskId = taskRes.body._id;

    await request(app)
      .post(`/api/projects/${projectId}/invite`)
      .set(authHeader(ownerToken))
      .send({ email: 'collab@example.com' });

    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(collabToken))
      .send({ status: 'Done' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Done');
  });
});

// ─── DELETE /api/projects/:projectId/tasks/:taskId ────────────────────────────

describe('DELETE /api/projects/:projectId/tasks/:taskId', () => {
  it('deletes the task and returns success message', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId);
    const taskId = taskRes.body._id;

    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);

    // Verify task is gone
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(token));
    expect(listRes.body).toHaveLength(0);
  });

  it('logs a "deleted task" activity entry', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    const taskRes = await mkTask(token, projectId, { title: 'Doomed task' });
    const taskId = taskRes.body._id;

    await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token));

    const actRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    const actions = actRes.body.map((a: any) => a.action);
    expect(actions).toContain('deleted task');
    const entry = actRes.body.find((a: any) => a.action === 'deleted task');
    expect(entry.details).toContain('Doomed task');
  });

  it('returns 404 for a non-existent task', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/000000000000000000000000`)
      .set(authHeader(token));

    expect(res.status).toBe(404);
  });

  it('returns 403 when a non-member tries to delete a task', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      email: 'other@example.com',
      name: 'Other',
    });
    const projectId = await mkProject(ownerToken);
    const taskRes = await mkTask(ownerToken, projectId);
    const taskId = taskRes.body._id;

    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(403);
  });
});

// ─── GET /api/projects/:projectId/tasks/activity ──────────────────────────────

describe('GET /api/projects/:projectId/tasks/activity', () => {
  it('returns an empty array when no actions have occurred', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns entries in reverse-chronological order', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    const t1 = await mkTask(token, projectId, { title: 'First' });
    const t2 = await mkTask(token, projectId, { title: 'Second' });

    // Update t1 to generate a second activity after t2's creation
    await request(app)
      .put(`/api/projects/${projectId}/tasks/${t1.body._id}`)
      .set(authHeader(token))
      .send({ status: 'Done' });

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    // Most recent first
    expect(res.body[0].action).toBe('changed status');
  });

  it('populates the user field with name and email (not password)', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);
    await mkTask(token, projectId);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    const entry = res.body[0];
    expect(entry.user).toHaveProperty('name', 'Alice');
    expect(entry.user).toHaveProperty('email', 'alice@example.com');
    expect(entry.user).not.toHaveProperty('password');
  });

  it('returns 403 for a user with no project access', async () => {
    const { token: ownerToken } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      email: 'other@example.com',
      name: 'Other',
    });
    const projectId = await mkProject(ownerToken);

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(403);
  });

  it('caps the feed at 50 entries', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    // Create 55 tasks — each generates one activity entry
    for (let i = 0; i < 55; i++) {
      await mkTask(token, projectId, { title: `Task ${i}` });
    }

    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(50);
  });
});

// ─── Full task lifecycle (end-to-end flow) ────────────────────────────────────

describe('Full task lifecycle', () => {
  it('create → update status → update dueDate → delete leaves correct activity trail', async () => {
    const { token } = await registerAndLogin();
    const projectId = await mkProject(token);

    // 1. Create
    const createRes = await mkTask(token, projectId, { title: 'Lifecycle task' });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body._id;

    // 2. Move to In Progress
    await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ status: 'In Progress' });

    // 3. Set a due date
    await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token))
      .send({ dueDate: '2026-03-01T00:00:00.000Z' });

    // 4. Delete
    await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set(authHeader(token));

    // 5. Verify activity trail
    const actRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/activity`)
      .set(authHeader(token));

    const actions = actRes.body.map((a: any) => a.action);
    expect(actions).toContain('created task');
    expect(actions).toContain('changed status');
    expect(actions).toContain('changed due date');
    expect(actions).toContain('deleted task');

    // 6. Task itself should be gone
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(authHeader(token));
    expect(listRes.body).toHaveLength(0);
  });
});

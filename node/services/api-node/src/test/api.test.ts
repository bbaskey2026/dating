import request from 'supertest';
import { createApp } from '../index';
import { Repositories } from '../repositories/interfaces';
import { Express } from 'express';

describe('Topolgira Node.js API Service Integration Tests (DI Layer)', () => {
  let app: Express;
  let repos: Repositories;

  beforeAll(async () => {
    const serverInstance = createApp('json');
    app = serverInstance.app;
    repos = serverInstance.repos;
  });

  it('should register a new user successfully', async () => {
    const email = `reg_${Date.now()}_${Math.random()}@example.com`;
    const res = await request(app)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        phoneNumber: '+919999988888',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should login an existing user', async () => {
    const email = `login_${Date.now()}_${Math.random()}@example.com`;
    await request(app)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  it('should create and retrieve user profile', async () => {
    const email = `profile_${Date.now()}_${Math.random()}@example.com`;
    const regRes = await request(app)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
      });

    expect(regRes.status).toBe(201);
    const token = regRes.body.data.accessToken;

    const profileRes = await request(app)
      .post('/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bhima',
        age: 25,
        gender: 'male',
        city: 'Ranchi',
        relationshipGoal: 'marriage',
        interests: ['music', 'travel', 'coding', 'movies'],
        languages: ['Hindi', 'English'],
        hobbies: ['hiking', 'gaming'],
        foodPreferences: ['spicy', 'veg'],
        musicInterests: ['rock', 'folk'],
      });

    expect([200, 201]).toContain(profileRes.status);
    expect(profileRes.body.success).toBe(true);
    expect(profileRes.body.data.name).toBe('Bhima');

    const meRes = await request(app)
      .get('/profiles/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.city).toBe('Ranchi');
  });

  it('should create mutual match when both users like each other', async () => {
    const emailA = `match_a_${Date.now()}_${Math.random()}@test.com`;
    const emailB = `match_b_${Date.now()}_${Math.random()}@test.com`;

    const regA = await request(app).post('/auth/register').send({ email: emailA, password: 'password123' });
    const regB = await request(app).post('/auth/register').send({ email: emailB, password: 'password123' });

    const tokenA = regA.body.data.accessToken;
    const tokenB = regB.body.data.accessToken;
    const userAId = regA.body.data.user.id;
    const userBId = regB.body.data.user.id;

    // User A likes User B
    const likeA = await request(app)
      .post('/likes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ toUserId: userBId });

    expect(likeA.status).toBe(201);
    expect(likeA.body.data.isMatch).toBe(false);

    // User B likes User A (Mutual match)
    const likeB = await request(app)
      .post('/likes')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ toUserId: userAId });

    expect(likeB.status).toBe(201);
    expect(likeB.body.data.isMatch).toBe(true);
    expect(likeB.body.message).toBe('ITS_A_MATCH');

    // Retrieve User A's matches
    const matchesRes = await request(app)
      .get('/likes/matches')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(matchesRes.status).toBe(200);
    expect(matchesRes.body.data.length).toBe(1);
  });
});


import { describe, test, expect } from 'bun:test'
import app from '@/app';

describe('API Test Route Authentication', async() => {

    test('POST /api/v1/login', async() => {

        const req = new Request('http://localhost:4560/api/v1/auth/login', {
            method: "POST",
            body: JSON.stringify({
                "email" : "johnDoe@gmail.com",
                "password": "JohnDoe123"
            }),
            headers: {
                "Content-Type" : "application/json"
            }
        });

        const res = await app.fetch(req);
        const resBody = await res.json() as any;

        expect(resBody.message).toBe('Login successful');
        expect(res.status).toBe(200);

    });

    test('POST /api/v1/register', async() => {

         const req = new Request('http://localhost:4560/api/v1/auth/register?test=true', {
            method: "POST",
            body: JSON.stringify({
               "name" : "John Doe",
               "email" : "johnDoe@gmail.com",
               "username" : "johndoe123",
               "password": "JohnDoe123",
            }),
            headers: {
                "Content-Type" : "application/json"
            }
        });

        const res = await app.fetch(req);
        expect(res.status).toBe(201);
    });

    test('GET /api/v1/me', async() => {
        const req = new Request('http://localhost:4560/api/v1/auth/me', {
            method: "GET",
            headers: {
                "Authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzFmZWU1OS1hMTI4LTQ2ZmEtYTMxNi04ODkwYzE1NjMxMDciLCJlbWFpbCI6ImFsZG8xMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyODIzNzkzfQ.YYwO5xn1l5rZgh0fkp5R2agdv9njBla2tg0bmlLLBqk",
                'Content-Type' : "application/json"
            }
        });

        const res = await app.fetch(req);

        const bodyJson = await res.json() as any;
        
        expect(res.status).toBe(200);
        expect(bodyJson.message).toBe("Profile retrieved");
        expect(bodyJson.success).toBe(true);
    });

    test('A GET request must fail with a 401 status if the JWT token is invalid. /api/v1/me', async() => {
        const req = new Request('http://localhost:4560/api/v1/auth/me', {
            method: "GET",
            headers: {
                "Authorization" : "Bearer testing",
                'Content-Type' : "application/json"
            }
        });

        const res = await app.fetch(req);
        const bodyJson = await res.json() as any;

        expect(res.status).toBe(401);

    })
})
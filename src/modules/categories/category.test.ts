import app from '@/app';
import { describe, test, expect } from 'bun:test'

describe('API Test Route Category', async() => {

  test('GET /api/v1/category return a list category', async() => {
    
    const req = new Request("http://localhost:4560/api/v1/category", {
        method: 'GET',
        headers: {
            "Authorization" : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzFmZWU1OS1hMTI4LTQ2ZmEtYTMxNi04ODkwYzE1NjMxMDciLCJlbWFpbCI6ImFsZG8xMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyODIzNzkzfQ.YYwO5xn1l5rZgh0fkp5R2agdv9njBla2tg0bmlLLBqk`,
            'Content-Type' : "application/json"
        }
    });

    const res = await app.fetch(req);
    const resBody = await res.json() as any;

    expect(resBody.success).toBe(true);
    expect(resBody.message).toBe("Success");

    expect(JSON.stringify({ page: 1, limit: 20 }))
        .toBe(JSON.stringify({ 
            page: resBody.meta.page, 
            limit: resBody.meta.limit
        }));

    expect(res.status).toBe(200);
  })
})
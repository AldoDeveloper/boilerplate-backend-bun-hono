
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { authService } from './auth.service';

const mockCreatePost = mock();

async function testingFunctionMocking(data: any) {
    return await authService.login(data);
}

mock.module('./auth.service', () => {
    return {
        authService: {
            login: mockCreatePost,
            me: mockCreatePost
        }
    }
})

describe('[AUTH] Services', async() => {

    beforeEach(() => {
        mockCreatePost.mockReset()
    })

    test('Skenario Sukses: Harus mengembalikan 200 dan data post yang di-mock LOGIN', async() => {
        
        const fakeData = {
           success: true,
           message: "OK"
        };

        mockCreatePost.mockResolvedValue(fakeData);

        //act menjalankan: Periksa http
        
        const result = await testingFunctionMocking({ 
            email: "johndoe123@gmail.com", 
            password: "JohnDoe123"
        });

        expect(result.success).toBeBoolean();
        expect(result.message).toBe('OK');

        expect(mockCreatePost).toHaveBeenCalledWith({
            email: "johndoe123@gmail.com", 
            password: "JohnDoe123"
        });

        expect(mockCreatePost).toHaveBeenCalledTimes(1);

    })
});
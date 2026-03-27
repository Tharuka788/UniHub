// Using built-in fetch (Node.js 18+)


const BASE_URL = 'http://localhost:5050/api/users';

const testAuth = async () => {
    try {
        console.log('--- Starting Auth Test ---');

        // 1. Register User
        console.log('\n1. Testing Registration...');
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            phoneNumber: '0112345678',
            password: 'password123'
        };

        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        console.log('Registration Success:', regData.name);

        const token = regData.token;

        // 2. Login User
        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        console.log('Login Success:', loginData.name);

        const loginToken = loginData.token;

        // 3. Get Profile (Protected)
        console.log('\n3. Testing Profile Access...');
        const profileRes = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${loginToken}` }
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(`Profile access failed: ${JSON.stringify(profileData)}`);
        console.log('Profile Access Success:', profileData.email);


        console.log('\n--- Auth Test Completed Successfully ---');
    } catch (error) {
        console.error('\nTest Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testAuth();

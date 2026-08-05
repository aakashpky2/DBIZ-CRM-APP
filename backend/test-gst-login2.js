const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { login } = require('./gst/controllers/auth');

const req = {
    body: {
        username: 'testuser',
        password: 'password123'
    }
};

const res = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('\n--- RESPONSE ---');
        console.log('Status Code:', this.statusCode);
        console.log('Response JSON:', data);
    }
};

login(req, res);

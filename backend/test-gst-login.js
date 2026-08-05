const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { login } = require('./gst/controllers/auth');

const req = {
    body: {
        username: 'gst1234',
        password: 'Kich@2026'
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

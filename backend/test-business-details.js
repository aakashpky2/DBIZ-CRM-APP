const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { saveBusinessDetails } = require('./gst/controllers/businessDetails');

const req = {
  body: {
    trn: 'TEST-1234',
    userId: '00000000-0000-0000-0000-000000000000',
    legalName: 'Test Legal Name',
    stateName: 'Delhi'
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response Status:', this.statusCode);
    console.log('Response Data:', data);
  }
};

saveBusinessDetails(req, res);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'blob:'],
      connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      fontSrc: ["'self'", 'data:', 'https:']
    }
  }
}));
app.use(cors({
  origin(origin, callback) {
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5000', process.env.FRONTEND_URL].filter(Boolean).map(v => v.replace(/\/$/, ''));
    if (!origin || allowed.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('CORS blocked origin'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// CRM routes remain under /api
app.get('/api/health', (req, res) => res.json({ success: true, service: 'crm-api', timestamp: new Date() }));
app.use('/api/auth', authLimiter, require('./crm/routes/auth'));
app.use('/api/items', require('./crm/routes/items'));
app.use('/api/superadmin', require('./crm/routes/superadmin'));
app.use('/api/session', require('./crm/routes/sessions'));
app.use('/api', require('./crm/routes/credits'));
app.use('/api/learning/videos', require('./crm/routes/learningVideos'));
app.use('/api/video', require('./crm/routes/videoSessions'));
app.use('/api/users', require('./crm/routes/users'));
app.use('/api/notifications', require('./crm/routes/notifications'));

// GST routes are namespaced under /api/gst
app.get('/api/gst/health', (req, res) => res.json({ success: true, service: 'gst-api', timestamp: new Date() }));
app.use('/api/gst/auth', require('./gst/routes/auth'));
app.use('/api/gst/registration', require('./gst/routes/registration'));
app.use('/api/gst/business-details', require('./gst/routes/businessDetails'));
app.use('/api/gst/forms', require('./gst/routes/forms'));
app.use('/api/gst/payments', require('./gst/routes/payments'));
app.use('/api/gst/hsn', require('./gst/routes/hsn'));
app.use('/api/gst/cause-list', require('./gst/routes/causeList'));
app.use('/api/gst/rfn', require('./gst/routes/rfn'));
app.use('/api/gst/holidays', require('./gst/routes/holidays'));
app.use('/api/gst/gstp', require('./gst/routes/gstp'));
app.use('/api/gst/gst-law', require('./gst/routes/gstLaw'));
app.use('/api/gst/gst-statistics', require('./gst/routes/gstStatistics'));
app.use('/api/gst/search-taxpayer', require('./gst/routes/searchTaxpayer'));
app.use('/api/gst/gstr2b', require('./gst/routes/gstr2b'));
app.use('/api/gst/gstr2a', require('./gst/routes/gstr2a'));
app.use('/api/gst/gstr1', require('./gst/routes/gstr1'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'dbiz-combined-app', timestamp: new Date().toISOString() }));

app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found' }));

const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
const frontendIndex = path.join(frontendDist, 'index.html');
if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(frontendIndex, err => err && next(err));
  });
}

const crmErrorHandler = require('./crm/middleware/error');
app.use(crmErrorHandler);

app.listen(PORT, () => console.log(`DBIZ combined app running on port ${PORT}`));

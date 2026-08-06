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
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

const allowedList = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5000',
  'https://lightseagreen-clam-943131.hostingersite.com',
  'https://app.dbiz.online',
  'https://training.acoundz360.com',
  'https://www.training.acoundz360.com',
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use('/api', cors(corsOptions));

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

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

const frontendDistPath = path.resolve(
  __dirname,
  '..',
  'frontend',
  'dist'
);

const frontendIndexPath = path.join(
  frontendDistPath,
  'index.html'
);

const frontendAssetsPath = path.join(
  frontendDistPath,
  'assets'
);

console.log('[Frontend] dist path:', frontendDistPath);
console.log(
  '[Frontend] index exists:',
  fs.existsSync(frontendIndexPath)
);
console.log(
  '[Frontend] assets directory exists:',
  fs.existsSync(frontendAssetsPath)
);

if (fs.existsSync(frontendAssetsPath)) {
  console.log(
    '[Frontend] sample assets:',
    fs.readdirSync(frontendAssetsPath).slice(0, 20)
  );
}

if (fs.existsSync(frontendIndexPath)) {
  app.use(
    express.static(frontendDistPath, {
      index: false,
      fallthrough: true,
      maxAge:
        process.env.NODE_ENV === 'production'
          ? '1d'
          : 0,
    })
  );

  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (req.path.startsWith('/api')) {
      return next();
    }

    if (req.path.startsWith('/assets/')) {
      return res.status(404).send('Asset not found');
    }

    return res.sendFile(frontendIndexPath, error => {
      if (error) {
        next(error);
      }
    });
  });
} else {
  console.error(
    `[Frontend] Build missing: ${frontendIndexPath}`
  );
}

app.use((error, req, res, next) => {
  console.error('[SERVER ERROR]', {
    method: req.method,
    path: req.path,
    message: error.message,
    code: error.code,
    stack: error.stack,
  });

  next(error);
});

const crmErrorHandler = require('./crm/middleware/error');
app.use(crmErrorHandler);

app.listen(PORT, () => console.log(`DBIZ combined app running on port ${PORT}`));

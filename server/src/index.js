const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Config CORS
const allowedOrigins = process.env.CLIENT_URL 
    ? [process.env.CLIENT_URL] 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Security Headers (CSP)
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' http://localhost:3001; script-src 'self' 'unsafe-inline';"
    );
    next();
});

// Parsers
app.use(express.json());
app.use(cookieParser());

// === ROUTES ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Skillhub API is running' });
});

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const documentRoutes = require('./routes/documentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const providerRoutes = require('./routes/providerRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const applicationPlanRoutes = require('./routes/applicationPlanRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const optimizationRoutes = require('./routes/optimizationRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const annualReviewRoutes = require('./routes/annualReviewRoutes');
const skillRoutes = require('./routes/skillRoutes');

// Static
app.use('/uploads', express.static('uploads'));

// API V1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/plans', applicationPlanRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/optimization', optimizationRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/certifications', certificationRoutes);
app.use('/api/v1/annual-reviews', annualReviewRoutes);
app.use('/api/v1/skills', skillRoutes);

// === ERROR HANDLING ===
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
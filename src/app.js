const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/product.route');
const dashboardRoutes = require('./routes/dashboard.route');
const chatRoutes = require('./routes/chat.route');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Render/Vercel jaise proxy ke peeche real user ki IP (rate limit ke liye) sahi milne ke liye
app.set('trust proxy', 1);

const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = clientUrl
    ? clientUrl
        .split(',')
        .map((url) => url.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    : [];

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (Postman, curl, server-to-server)
            if (!origin) return callback(null, true);
            // Fallback if CLIENT_URL is not specified (e.g. dev)
            if (!clientUrl) return callback(null, true);

            const normalizedOrigin = origin.trim().replace(/\/+$/, '');
            if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Root and Health routes
app.get('/', (req, res) => res.json({ message: 'TWS Gift API is running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
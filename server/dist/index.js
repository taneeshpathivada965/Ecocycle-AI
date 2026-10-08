"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const deviceRoutes_1 = __importDefault(require("./routes/deviceRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const partnerRoutes_1 = __importDefault(require("./routes/partnerRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const demoRoutes_1 = __importDefault(require("./routes/demoRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Security: CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests from localhost, vite dev server, or client URL
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parser with 15MB payload limit for camera photo analysis
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'EcoCycle AI Circular Economy Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// EcoCycle AI Core API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/devices', deviceRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/partners', partnerRoutes_1.default);
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/eco-wallet', walletRoutes_1.default);
app.use('/api/demo', demoRoutes_1.default);
// Static client build serving
const clientDistPath = path_1.default.resolve(__dirname, '../../client/dist');
const clientIndex = path_1.default.join(clientDistPath, 'index.html');
if (fs_1.default.existsSync(clientDistPath)) {
    app.use(express_1.default.static(clientDistPath));
}
// Centralized Error Handling Middleware
app.use(errorHandler_1.errorHandler);
// SPA client routing fallback for non-API routes
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    if (fs_1.default.existsSync(clientIndex)) {
        return res.sendFile(clientIndex);
    }
    res.send(`<!DOCTYPE html><html><head><title>EcoCycle AI</title></head><body><h1>EcoCycle AI Engine is Live</h1><p>API is active at <a href="/api/health">/api/health</a></p></body></html>`);
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger_1.logger.info(`EcoCycle AI Backend Server running on port ${PORT}`);
        logger_1.logger.info(`Health check available at http://localhost:${PORT}/api/health`);
    });
}
exports.default = app;

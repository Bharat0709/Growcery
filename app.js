const express = require('express');
const app = express();
const authRouter = require('./routes/authRoutes');
const itemsRouter = require('./routes/userRoutes');
const addressRouter = require('./routes/addressRoutes');
const adminRouter = require('./routes/adminroutes');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');

app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());

app.use(express.static('public'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/items', itemsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/address', addressRouter);

module.exports = app;

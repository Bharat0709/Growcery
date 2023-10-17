const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const secretKey = process.env.JWT_SECRET;

exports.authenticateJWT = (req, res, next) => {
  console.log('authenticate middleware is called');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ message: 'Token is not valid' });
    }

    console.log('Decoded token:', decoded);

    req.userId = decoded.id;

    next();
  });
};

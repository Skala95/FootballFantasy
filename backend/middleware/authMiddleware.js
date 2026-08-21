import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    console.log('authMiddleware pozvan! Headers:', req.headers.authorization);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verify error:', error.message);
        res.status(400).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;    
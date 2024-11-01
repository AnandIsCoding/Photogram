import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false
            });
        }

        const decoded = await jwt.verify(token, process.env.PRIVATE_KEY);
        if (!decoded || !decoded._id) {  // Ensure _id exists in decoded token
            return res.status(401).json({
                message: 'Invalid token',
                success: false
            });
        }

        req.userId = decoded._id;  // Use req.userId to store user ID
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export default isAuthenticated;

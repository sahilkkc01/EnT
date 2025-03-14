const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET
exports.authenticateUser = (req, res, next) => {
    const token = req.cookies.token; // Extract token from cookie
  
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: Please Login" });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Verify token
      req.user = decoded; // Attach user info to req.user
      next();
    } catch (error) {
      return res.status(403).json({ msg: "Invalid or expired tokenm Please login " });
    }
  };
  
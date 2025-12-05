// middleware/auth.js
const jwt = require("jsonwebtoken");

// Verify token and attach user info to req.user
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded will contain { id, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

// Allow only admins
function isAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
}

// Allow only administrators
function isAdministrator(req, res, next) {
  if (req.user?.role !== "ADMINISTRATOR") {
    return res.status(403).json({ message: "Administrator access only" });
  }
  next();
}

// Allow admins or administrators
function isAdminOrAbove(req, res, next) {
  if (req.user?.role !== "ADMIN" && req.user?.role !== "ADMINISTRATOR") {
    return res.status(403).json({ message: "Admin or Administrator access required" });
  }
  next();
}

module.exports = { auth, isAdmin, isAdministrator, isAdminOrAbove };

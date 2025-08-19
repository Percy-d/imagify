import jwt from 'jsonwebtoken';

export const userAuth = async (req, res, next) => {
  const { token } = req.headers;
  
  if (!token) {
    return res.json({ success: false, message: 'Not authorized. Login again' });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);    
    if (tokenDecode.id) {
      // Initialize req.body if it doesn't exist
      if (!req.body) {
        req.body = {};
      }
      
      // Set the userId on req.body
      req.body.userId = tokenDecode.id;
      next();
    } else {
      return res.json({ success: false, message: 'Not authorized. Login again' });
    }
  } catch (error) {
    res.json({ success: false, message: "Invalid token" });
  }
}
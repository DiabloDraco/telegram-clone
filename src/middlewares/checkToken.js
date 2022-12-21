import jwt from '../utils/jwt.js';

export default (req, res, next) => {
  try {
    let { token } = req.headers;

    if (!token) {
      return res.sendStatus(403)
    }

    let { userId } = jwt.verify(token);

    req.userId = userId;

    return next();
  } catch (error) {
     return res.sendStatus(403);
  }
};

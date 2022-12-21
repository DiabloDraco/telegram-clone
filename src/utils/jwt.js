import  jwt  from "jsonwebtoken";

export default {
  sign: (payload) => jwt.sign(payload, 'chat'),
  verify: (token) => jwt.verify(token, 'chat')
};

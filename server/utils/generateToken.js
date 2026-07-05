import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_change_me_in_production', {
    expiresIn: '30d',
  });
};

export default generateToken;

import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res) => {
  const payload = { id: user._id, role: user.role };
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'repx_fallback_jwt_secret_dev_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  const token = jwt.sign(payload, secret, {
    expiresIn,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Strip password from returned user
  const sanitizedUser = user.toObject ? user.toObject() : { ...user };
  delete sanitizedUser.password;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: sanitizedUser,
  });
};

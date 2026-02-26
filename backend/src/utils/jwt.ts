import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export type JwtPayload = {
  userId: number;
  role: 'CUSTOMER' | 'MERCHANT_ADMIN';
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, accessSecret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}

const decodeJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return decoded;
  } catch {
    return null;
  }
};

/** Decode a JWT payload without verifying its signature. */
export const decodeToken = decodeJwt;

export const isTokenExpired = (token: string | null) => {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 < Date.now();
};

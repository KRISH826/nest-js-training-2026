export const jwtConstants = {
  accessSecret:
    process.env.JWT_ACCESS_SECRET || 'accessSecretKey_change_in_prod',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'refreshSecretKey_change_in_prod',
  accessExpiresIn: '15m',
  refreshExpiresIn: '100d',
};

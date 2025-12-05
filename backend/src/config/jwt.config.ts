const DEFAULT_SECRETS = [
  'your-super-secret-jwt-key-change-this',
  'your-super-secret-jwt-key-change-this-in-production',
  'your-refresh-secret',
  'your-refresh-secret-change-this-in-production',
  'change-this',
  'secret',
];

function validateSecret(secret: string | undefined, secretName: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!secret) {
    if (isProduction) {
      throw new Error(
        `❌ SECURITY ERROR: ${secretName} is required in production. ` +
        `Please set ${secretName} in your .env file with a strong, random secret.`
      );
    }
    // In development, use a default but warn
    console.warn(
      `⚠️  WARNING: ${secretName} not set. Using default value. ` +
      `This is unsafe for production!`
    );
    return secretName.includes('REFRESH') 
      ? 'your-refresh-secret' 
      : 'your-super-secret-jwt-key-change-this';
  }

  // Check if using default/weak secrets in production
  if (isProduction) {
    const isDefaultSecret = DEFAULT_SECRETS.some(defaultSecret => 
      secret.includes(defaultSecret) || secret === defaultSecret
    );
    
    if (isDefaultSecret || secret.length < 32) {
      throw new Error(
        `❌ SECURITY ERROR: ${secretName} is using a default or weak value in production. ` +
        `Please set a strong, random secret (minimum 32 characters) in your .env file. ` +
        `Current value appears to be: "${secret.substring(0, 20)}..."`
      );
    }
  }

  // Warn if secret is too short even in development
  if (secret.length < 32) {
    console.warn(
      `⚠️  WARNING: ${secretName} is shorter than recommended 32 characters. ` +
      `Consider using a longer, more secure secret.`
    );
  }

  return secret;
}

// Validate secrets on module load
const secret = validateSecret(process.env.JWT_SECRET, 'JWT_SECRET');
const refreshSecret = validateSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');

export const jwtConfig = {
  secret,
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  refreshSecret,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
};


const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = `# Database Configuration
# ⚠️ IMPORTANT: Replace with your own database credentials
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD_HERE
DATABASE_NAME=taskmaster

# JWT Configuration
# ⚠️ CRITICAL: Replace these with strong, random secrets in production!
# Generate secrets using: node scripts/generate-secrets.js
JWT_SECRET=your-super-secret-jwt-key-change-this-minimum-32-characters
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
JWT_REFRESH_EXPIRATION=30d

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# SMTP Configuration (for password reset emails)
# ⚠️ IMPORTANT: Replace with your own email credentials
# For Gmail, you need to generate an App Password: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_EMAIL@gmail.com
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE
SMTP_FROM=YOUR_EMAIL@gmail.com
`;

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Reading current content...');
  const currentContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if SMTP is already configured
  if (currentContent.includes('SMTP_USER=') && !currentContent.includes('SMTP_USER=YOUR_EMAIL@gmail.com')) {
    console.log('✅ SMTP configuration already exists in .env');
    console.log('📝 Please make sure SMTP_PASSWORD is set to your email App Password');
  } else {
    // Append SMTP config if not present
    const smtpConfig = `
# SMTP Configuration (for password reset emails)
# ⚠️ IMPORTANT: Replace with your own email credentials
# For Gmail, you need to generate an App Password: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_EMAIL@gmail.com
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE
SMTP_FROM=YOUR_EMAIL@gmail.com
`;
    fs.appendFileSync(envPath, smtpConfig);
    console.log('⚠️  Please update SMTP configuration in .env with your own email credentials');
  }
} else {
  // Create new .env file
  fs.writeFileSync(envPath, envContent);
}



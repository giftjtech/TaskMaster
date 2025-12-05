const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found! Please run setup-env.js first.');
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for SMTP password
rl.question('Enter your Gmail App Password (or press Enter to skip): ', (newPassword) => {
  if (!newPassword || newPassword.trim() === '') {
    console.log('⚠️  No password provided. Skipping update.');
    rl.close();
    return;
  }

  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('SMTP_PASSWORD=')) {
    envContent = envContent.replace(
      /SMTP_PASSWORD=.*/g,
      `SMTP_PASSWORD=${newPassword.trim()}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ SMTP_PASSWORD updated successfully in .env');
  } else {
    console.log('⚠️  SMTP_PASSWORD not found in .env file. Adding SMTP configuration...');
    
    // Check if SMTP_USER exists
    if (!envContent.includes('SMTP_USER=')) {
      rl.question('Enter your email address: ', (email) => {
        const smtpConfig = `
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${email.trim()}
SMTP_PASSWORD=${newPassword.trim()}
SMTP_FROM=${email.trim()}
`;
        fs.appendFileSync(envPath, smtpConfig);
        console.log('✅ SMTP configuration added to .env');
        rl.close();
      });
    } else {
      const smtpConfig = `
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_PASSWORD=${newPassword.trim()}
SMTP_FROM=
`;
      fs.appendFileSync(envPath, smtpConfig);
      console.log('✅ SMTP configuration added to .env');
      rl.close();
    }
  }
  
  if (rl) {
    rl.close();
  }
});


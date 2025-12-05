#!/usr/bin/env node

/**
 * Script to generate secure JWT secrets for production
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

#!/usr/bin/env node

/**
 * UPI Guard Deployment Helper Script
 * This script helps prepare your project for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 UPI Guard Deployment Helper\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found!');
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
    console.log('🔧 Please update .env with your actual Firebase credentials\n');
  }
} else {
  console.log('✅ .env file found');
}

// Check if all required files exist
const requiredFiles = [
  'vercel.json',
  'netlify.toml',
  '.gitignore',
  'package.json'
];

console.log('\n📁 Checking required deployment files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'preview'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} script missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
}

console.log('\n🎯 Next Steps:');
console.log('1. Update .env with your Firebase credentials');
console.log('2. Run: git add . && git commit -m "Prepare for deployment"');
console.log('3. Push to GitHub: git push origin main');
console.log('4. Deploy to Vercel: https://vercel.com');
console.log('5. Deploy to Netlify: https://netlify.com');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions');

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to read JSON file
function readJSON(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to write JSON file
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Function to increment version
function incrementVersion(currentVersion, type = 'patch') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Function to update Android versionCode (increment by 1)
function incrementVersionCode(currentVersionCode) {
  return currentVersionCode + 1;
}

// Function to check current version
function checkVersion() {
  const rootDir = path.join(__dirname, '..');
  
  // Check package.json
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = readJSON(packagePath);
  console.log(`📦 package.json version: ${packageJson.version}`);
  
  // Check Android build.gradle
  const androidGradlePath = path.join(rootDir, 'android/app/build.gradle');
  let gradleContent = fs.readFileSync(androidGradlePath, 'utf8');
  
  const versionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  const versionNameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);
  
  if (versionCodeMatch && versionNameMatch) {
    const versionCode = versionCodeMatch[1];
    const versionName = versionNameMatch[1];
    console.log(`🤖 Android versionName: ${versionName}`);
    console.log(`🔢 Android versionCode: ${versionCode}`);
    
    // Check for mismatches
    if (packageJson.version !== versionName) {
      console.log(`⚠️  Version mismatch detected!`);
      console.log(`   package.json: ${packageJson.version}`);
      console.log(`   Android: ${versionName}`);
    } else {
      console.log(`✅ Versions are synchronized`);
    }
  }
}

// Main function
function updateVersion(type = 'patch') {
  const rootDir = path.join(__dirname, '..');
  
  // Update package.json
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = readJSON(packagePath);
  const newVersion = incrementVersion(packageJson.version, type);
  packageJson.version = newVersion;
  writeJSON(packagePath, packageJson);
  console.log(`✅ Updated package.json version to ${newVersion}`);
  
  // Update Android build.gradle
  const androidGradlePath = path.join(rootDir, 'android/app/build.gradle');
  let gradleContent = fs.readFileSync(androidGradlePath, 'utf8');
  
  // Extract current versionCode and versionName
  const versionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  const versionNameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);
  
  if (versionCodeMatch && versionNameMatch) {
    const currentVersionCode = parseInt(versionCodeMatch[1]);
    const newVersionCode = incrementVersionCode(currentVersionCode);
    
    // Update versionName and versionCode
    gradleContent = gradleContent.replace(
      /versionName\s+"[^"]+"/,
      `versionName "${newVersion}"`
    );
    gradleContent = gradleContent.replace(
      /versionCode\s+\d+/,
      `versionCode ${newVersionCode}`
    );
    
    fs.writeFileSync(androidGradlePath, gradleContent);
    console.log(`✅ Updated Android version to ${newVersion} (versionCode: ${newVersionCode})`);
  }
  
  console.log(`\n🎉 Version updated successfully!`);
  console.log(`New version: ${newVersion}`);
}

// Handle command line arguments
const args = process.argv.slice(2);
const type = args[0] || 'patch';

if (type === 'check') {
  checkVersion();
} else if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('❌ Invalid version type. Use: patch, minor, major, or check');
  console.log('Usage: node scripts/version.js [patch|minor|major|check]');
  process.exit(1);
} else {
  updateVersion(type);
}

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/logo-pwa.png');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  if (!fs.existsSync(inputPath)) {
    console.error('Logo not found at public/logo.png');
    return;
  }

  try {
    await sharp(inputPath)
      .resize(192, 192)
      .toFile(path.join(publicDir, 'icon-192x192.png'));
    
    await sharp(inputPath)
      .resize(512, 512)
      .toFile(path.join(publicDir, 'icon-512x512.png'));

    await sharp(inputPath)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-icon.png'));

    console.log('Icons generated successfully.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

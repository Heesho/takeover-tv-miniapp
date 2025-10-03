# Convert SVG Images to PNG

The Farcaster Mini App manifest requires PNG images, not SVG. You need to convert the placeholder SVG files to PNG format.

## Quick Conversion Options

### Option 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png or https://svgtopng.com
2. Upload `logo.svg` and convert to PNG at 200x200px
3. Upload `og-image.svg` and convert to PNG at 1200x630px
4. Download and save as `logo.png` and `og-image.png`

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first (if not already installed)
# Then run:
magick logo.svg -resize 200x200 logo.png
magick og-image.svg -resize 1200x630 og-image.png
```

### Option 3: Using Inkscape (Command Line)
```bash
inkscape logo.svg --export-filename=logo.png --export-width=200 --export-height=200
inkscape og-image.svg --export-filename=og-image.png --export-width=1200 --export-height=630
```

### Option 4: Using Node.js (sharp library)
```bash
npm install sharp
```

Then create a script:
```javascript
const sharp = require('sharp');

sharp('public/logo.svg')
  .resize(200, 200)
  .png()
  .toFile('public/logo.png');

sharp('public/og-image.svg')
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png');
```

## After Conversion

1. Delete or keep the SVG files (they're just templates)
2. Verify the PNG files exist:
   - `public/logo.png` (200x200px)
   - `public/og-image.png` (1200x630px)
3. Test the manifest at `/.well-known/farcaster.json`

## Creating a Real Screenshot

For `screenshot1.png`, you need an actual app screenshot:

1. Run the app locally: `npm run dev`
2. Open in browser at mobile dimensions (390x844 or similar)
3. Take a screenshot
4. Save as `public/screenshot1.png`

Alternatively, use browser dev tools device emulation to capture a perfect mobile screenshot.

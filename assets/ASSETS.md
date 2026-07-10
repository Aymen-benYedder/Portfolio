# Assets Directory

## Images
- `style.webp` - Primary social media image (recommended 1200x630px, optimized WebP)
- `style.avif` - Optional higher-compression alternative (recommended when available)

## Fonts
Self-hosted web fonts for performance (WOFF2):
- `Inter-Regular.woff2` - primary
- `Inter-SemiBold.woff2` - secondary weight
- `Inter-Bold.woff2` - bold weight
- `FiraCode-Regular.woff2` - monospace for code blocks

## Optimization Guidelines
- Images: use WebP/AVIF when possible, aim for <100KB for social images (1200x630), quality 80-85%, strip metadata, use sRGB profile.
- Fonts: use WOFF2 and subset to necessary character sets to reduce size. Keep `font-display: swap` in CSS.

## Structure
```
/assets/
  ├── style.webp
  ├── style.avif (optional)
  └── /fonts/
      ├── Inter-Regular.woff2
      ├── Inter-SemiBold.woff2
      ├── Inter-Bold.woff2
      └── FiraCode-Regular.woff2
```

## Notes
- Only modern formats (WebP/AVIF) should be kept in `/assets` for production. If you need to keep a source PNG, store it outside `/assets` (e.g., `/src/images/`) and use that to regenerate optimized assets.
- Consider generating `style.avif` for additional performance where supported.

## Useful Commands
- Check image dimensions (ImageMagick):
  magick identify -format "%wx%h" assets/style.webp

- Convert PNG Source → WebP (cwebp):
  cwebp -q 85 -m 6 src/images/style.png -o assets/style.webp

- Convert WebP → AVIF (avifenc / magick):
  avifenc --min 0 --max 63 --speed 4 assets/style.webp assets/style.avif
  OR
  magick convert assets/style.webp assets/style.avif

- Strip metadata (exiftool):
  exiftool -all= assets/style.webp

Note: These tools may not be installed by default. Add them to your dev environment for repeatable optimization steps.
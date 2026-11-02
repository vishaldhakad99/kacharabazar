# Asset Guide for Kachra Bazar

This directory contains assets for the Kachra Bazar application.

### Replacing Images with Real Photos:
1. **Hero & Landing Page Imagery**:
   - The landing page uses SVG illustrations and optimized imagery for waste segregation, door-to-door collection, and recycling.
   - To replace hero imagery with local high-resolution photos of Bhopal Municipal Corporation (BMC) waste collection trucks or Swachh Bharat drives:
     - Place your JPEG/PNG/WebP image in this folder: `client/src/assets/hero-bhopal.jpg`.
     - Update the reference in `client/src/pages/LandingPage.jsx`.

2. **Dump Report Before/After Samples**:
   - Seeded and default dump reports use verified sample images served via `/uploads` or Unsplash CDN fallbacks.
   - For custom demonstration images, upload directly through the **Report Dump** citizen flow or the **Clear Dump** worker flow.
   - Uploaded files are stored in `server/uploads/` and served at `/uploads/<filename>`.

3. **Rewards Catalog Badges & Icons**:
   - Rewards cards display high-contrast SVGs and badges for electricity bills, water discounts, compost kits, and cloth bags.
   - Custom sponsor logos can be added to `client/src/assets/rewards/`.

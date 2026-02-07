# Screenshot Proof Artifacts

Store compressed PNG/JPG screenshots here (avoid large binaries).

## Expected files
- `home.png`
- `products.png`
- `product-detail.png`
- `checkout.png`
- `admin-dashboard.png`
- `admin-orders.png`

## Capture checklist
1. Run backend + frontend locally.
2. Capture desktop viewport at 1440px width.
3. Ensure no personal data or secrets are visible.
4. Keep each image under ~500 KB when possible.

## Suggested capture commands
- macOS full-screen: `screencapture -x docs/screenshots/home.png`
- Region capture: `screencapture -x -R0,120,1440,900 docs/screenshots/products.png`

If screenshots are unavailable, keep this file updated with target filenames and capture procedure (this repository’s current fallback mode).

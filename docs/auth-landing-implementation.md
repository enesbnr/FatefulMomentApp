# Auth landing implementation

Only the landing screen is implemented. Buttons use no-op handlers. The legal text has the reference line break before “Privacy Policy”; no navigation or link destinations are implemented. The email button has only its confirmed translucent fill.

## Adjustable estimates

All estimates live in `src/theme/authLanding.ts`:

| Property | Value | Meaning |
| --- | --- | --- |
| top | 38 | Safe-area top to logo |
| logoToTitle | 36 | Logo bottom to title line box |
| titleToSubtitle | 8 | Gap between text line boxes |
| subtitleToButtons | 48 | Subtitle bottom to email button |
| buttonToDivider | 24 | Email button bottom to divider row |
| dividerToSocial | 24 | Divider row bottom to Apple button |
| socialButtons | 16 | Apple-to-Google gap |
| legalMinimumGap | 24 | Minimum Google-to-legal spacing on short screens |
| legalBottom | 14 | Legal text bottom to bottom safe-area boundary |
| legalBody | #6B7280 | Pending visual verification |

Anchoring estimate: top content follows the top safe area; the legal container expands to push text toward the bottom safe area. On shorter screens, it retains the minimum gap and the whole content scrolls without visible scroll indicators. There is no fixed-height canvas. Native status/navigation areas remain system-managed.

The divider center width of 52 is derived, not estimated: 327 − 2 × 137.5. Its lines flex on other widths. Button minimum height is 56 with confirmed padding, allowing text accessibility scaling to grow it.

## Files created or changed

- `App.tsx`: renders only the auth landing screen and light status-bar content.
- `src/auth/AuthLandingScreen.tsx`: landing layout.
- `src/theme/authLanding.ts`: confirmed colors/typography and isolated estimates.
- `src/types/assets.d.ts`: SVG import types.
- `assets/auth/ fateful-moment-logo.png` → `assets/auth/fateful-moment-logo.png`: filename rename only.
- `assets/fonts/Inter-Regular.ttf`
- `assets/fonts/Inter-Medium.ttf`
- `assets/fonts/Inter-Bold.ttf`
- `assets/fonts/LICENSE.txt`
- `assets/fonts/SOURCE.md`
- `android/app/src/main/assets/fonts/Inter-Regular.ttf`
- `android/app/src/main/assets/fonts/Inter-Medium.ttf`
- `android/app/src/main/assets/fonts/Inter-Bold.ttf`
- `ios/FatefulMomentApp/Info.plist`: registers the three fonts.
- `ios/FatefulMomentApp.xcodeproj/project.pbxproj`: adds font resources, preserving existing project edits.
- `ios/Podfile`: aligns the SVG filter resource bundle deployment target with React Native's supported minimum for the installed Xcode SDK.
- `ios/Podfile.lock`: resolves the SVG native dependency.
- `package.json` and `package-lock.json`: SVG renderer and transformer dependencies.
- `metro.config.js`: imports the original SVGs through the transformer.
- `jest.config.js` and `test-support/svgMock.js`: SVG support for the existing render test.
- `docs/auth-landing-implementation.md`: this report.

Existing privacy-manifest edits and the existing workspace were preserved. Generated native build files and installed dependencies are not source changes.

## Assets used

- `fateful-moment-logo.png`: 148×148, radius 74.
- `email-icon.svg`: 20×16.
- `apple-icon.svg`: 18×22.
- `google-icon.png`: 22×22.

Original image/SVG contents are unchanged. Inter static weights 400/500/700 are from the official [Inter 4.1 release](https://github.com/rsms/inter/releases/tag/v4.1), with the license bundled. Android font copies are byte-identical to the originals.

## Verification

- TypeScript (`npx tsc --noEmit`): passed.
- ESLint (`npm run lint`): passed.
- Existing Jest render test: passed.
- Metro production JS bundles for iOS and Android: passed.
- Android `assembleDebug`: passed.
- iOS simulator Debug build: passed after the targeted SVG resource-bundle deployment fix.
- Launched and visually inspected on the available iPhone 17 Pro simulator and Android emulator.

The old Metro server was restarted to load SVG transformer configuration. Exact 375×812 comparison and shorter-screen interaction review remain for the next visual pass. Current previews use the available devices, not a simulated 375×812 canvas.

## Next visual comparison

Tune only the listed estimates against the 375×812 Figma reference. Check legal color and safe-area-relative anchoring. The provided logo and Google PNG are only 1× assets and look soft on high-density screens; higher-resolution exports would improve sharpness without changing their logical sizes. No assets were recreated. No email border/effect was added.

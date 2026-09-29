# FatefulMomentApp — Codex Working Rules

This file defines how Codex should work on the FatefulMomentApp React Native project.

The goal is to reproduce the provided Figma auth flow as closely as possible while keeping the implementation responsive, reusable, maintainable, and consistent across iOS and Android.

---

## 1. Source of truth

Figma is the visual source of truth.

When implementing or modifying a screen:

1. Inspect the supplied Figma screenshot / Dev Mode CSS / exported values first.
2. Use exact values when they are known.
3. Do not silently invent missing measurements, colors, effects, typography, states, icons, or copy.
4. If a value is not known, preserve the existing implementation unless there is clear evidence it is wrong.
5. If a Figma screenshot and generated CSS appear inconsistent, prioritize the actual visible Figma screen for visual appearance, but report the inconsistency.
6. Do not “improve” or redesign the UI.

Do not rename or rewrite text just because it seems semantically unusual. If Figma says `Sign In`, keep `Sign In` unless explicitly instructed otherwise.

---

## 2. Reference frame is NOT a fixed canvas

The current Figma auth designs use a reference frame of:

- width: 375
- height: 812

This is a reference layout, not a fixed coordinate system.

Never implement the entire screen using absolute positions copied directly from Figma.

Wrong approach:

```ts
position: 'absolute',
top: 355,
left: 24,
```

for every screen element.

Instead, extract the relationships from Figma:

- element dimensions
- horizontal margins
- maximum content width
- vertical gaps
- safe-area relationship
- alignment
- grouping

Then recreate those relationships using normal React Native layout.

---

## 3. Responsive layout rules

### Horizontal behavior

For phone auth screens:

- minimum horizontal screen inset: `24`
- content width: `100%`
- content `maxWidth`: `327`
- content centered horizontally

At the 375px Figma reference:

```text
375 - 24 - 24 = 327
```

For narrower phones:

- keep 24px side padding when possible
- content width shrinks naturally
- do not shrink fonts, icons, button heights, or logo just because the screen is narrower

For wider phones:

- content should remain capped at the Figma max width unless a specific screen says otherwise
- extra width becomes surrounding whitespace

For tablets:

- do not stretch a 327px auth form across the entire tablet
- keep the auth column centered
- preserve the mobile component dimensions unless a tablet-specific Figma design exists
- extra width should become whitespace
- do not invent tablet-specific scaling without design evidence

---

## 4. Vertical responsiveness

Do NOT scale vertical positions proportionally with screen height.

Never do:

```text
newTop = figmaTop * currentHeight / 812
```

Instead:

- preserve element sizes
- preserve important internal gaps
- respect the native safe area
- allow extra screen height to become whitespace
- use scrolling on short screens
- do not aggressively shrink the UI

### Example: Back button

Figma reference:

- width: 40
- height: 40
- left: 24
- top: 64

Responsive interpretation:

- button stays `40x40`
- horizontal inset stays `24`
- do not scale `top: 64`
- position it relative to the current safe-area top plus the intended visual gap

Conceptually:

```text
buttonTop = safeAreaTop + visualTopGap
```

The visual relationship should remain stable across devices.

On taller screens, do NOT push the back button farther down simply because the display is taller.

---

## 5. Safe area

Use native safe-area handling.

Do not manually draw:

- iOS status bar
- Dynamic Island
- Android status bar
- iOS home indicator
- Android navigation bar

Do not use Figma’s status bar or home-indicator layers as app content.

Screen layout must work with the actual device safe-area inset.

---

## 6. Short screens and keyboard

Auth screens must remain usable on smaller devices and when the keyboard is open.

Use the existing responsive / scroll / keyboard-aware structure.

Requirements:

- focused input remains accessible
- buttons are not permanently hidden behind the keyboard
- screen can scroll when necessary
- do not shrink typography or logo just to make everything fit
- do not reproduce the keyboard shown in Figma

Use the native iOS / Android keyboard.

---

## 7. Preserve Figma spacing relationships

When exact Figma coordinates are supplied, convert them into layout relationships.

Example:

```text
Header ends at Y=323
Email starts at Y=355
=> gap = 32

Email height = 56
Password starts at Y=443
=> gap = 32
```

Implement:

```text
Header
32px gap
Email
32px gap
Password
```

instead of globally absolutely positioning each element at those Y coordinates.

For each screen, preserve:

- component dimensions
- horizontal alignment
- internal gaps
- major group-to-group gaps

Do not allow `space-between` across the entire screen to randomly redistribute Figma spacing.

---

## 8. Shared auth components

Reuse existing components instead of rebuilding identical UI for every screen.

Expected shared components include, where already justified by the design:

- `BackButton`
- `AuthHeader`
- `FormField`
- `PasswordField`
- `AuthButton`
- small auth footer/link row
- auth screen layout/wrapper if already present

Do not over-engineer a universal design system.

Do not duplicate a shared component just because one screen uses slightly different content.

Use props / variants for real design-system differences.

---

## 9. Main component vs screen instance

Figma may provide a base/main component and an overridden screen instance.

Never assume the base component dimensions are the screen dimensions.

Example:

A Figma main component may be:

```text
232x48
```

while the actual auth screen instance is:

```text
327x56
```

In that situation:

- use the base component to understand the design language / behavior
- use the screen instance for actual screen dimensions, typography, icon visibility, and padding

Do not replace screen-instance values with base-component preview values.

---

## 10. Primary Glass / Liquid Glass buttons

The cyan auth buttons use the project’s existing Primary Glass treatment.

Examples include:

- `Continue with Email`
- `Sign in`
- Reset Password flow primary button
- `Back to Sign in`
- other buttons explicitly using the same Figma primary-glass variant

Do NOT apply this style to Apple or Google social buttons.

Known base tint:

```ts
backgroundColor: 'rgba(0, 211, 243, 0.14)'
```

Known auth large-instance values:

- width: `100%`
- maxWidth: `327`
- height: `56`
- paddingHorizontal: `24`
- paddingVertical: `16`
- borderRadius: `16`

Label:

- Inter
- weight 500
- size 16
- lineHeight 24
- color `#00D3F3`

The project may already contain an implementation of the visual glass rim / blur effect.

If it exists:

- reuse it
- do not create another incompatible version per screen
- keep all primary-glass auth buttons visually consistent

Disabled primary state:

- retain the same visual construction
- whole-button opacity may be `0.35` where Figma explicitly shows that state

Do not use a solid `#00D3F3` background plus opacity as a replacement for the translucent fill.

---

## 11. Social buttons

Apple and Google buttons are a separate visual variant.

Do not modify them while working on Primary Glass buttons unless explicitly requested.

Known social-button structure:

- width: `100%`
- maxWidth: `327`
- height: `56`
- padding: `16`
- gap: `12`
- borderRadius: `16`
- background: `rgba(17, 24, 39, 0.8)`

Text:

- Inter 500
- 16 / 24
- white

Icons:

- Apple: exported asset
- Google: exported asset
- preserve aspect ratio and original colors

---

## 12. Form fields

Shared auth fields should use the existing `FormField` implementation.

Known base style:

- height: `56`
- width: `100%`
- maxWidth: `327`
- borderRadius: `16`
- background: `rgba(17, 24, 39, 0.8)`
- default border: `1px solid rgba(255, 255, 255, 0.05)`

Text:

- Inter
- weight 400
- size 16
- lineHeight 24

Placeholder:

- `#62748E`

Entered text:

- `#FFFFFF`

Active/filled border behavior:

```text
empty + unfocused -> default border
focused -> cyan border
filled + unfocused -> cyan border remains
filled + focused -> cyan border
```

Do not regress this behavior.

If iOS and Android render the TextInput baseline differently, fix the native TextInput behavior inside the shared component rather than changing the screen geometry.

Do not use random negative margins or arbitrary transforms unless absolutely necessary and verified on both platforms.

---

## 13. Typography

Auth UI uses Inter unless Figma explicitly states otherwise.

Do not fall back to the platform default font if Inter is already configured.

Use the exact supplied Figma:

- font family
- weight
- font size
- line height
- alignment
- color

Do not invent token names such as `title03` or similar unless those names are actually present in the supplied design system.

Neutral code names are preferred over invented Figma token names.

---

## 14. Assets

Use the actual exported Figma assets.

Current auth asset area is:

```text
assets/auth/
```

Examples may include:

```text
fateful-moment-logo.png
email-icon.svg
apple-icon.svg
google-icon.png
back-arrow.svg
```

Rules:

- inspect the real filename before importing
- do not replace exported assets with icon-library approximations without explicit approval
- preserve aspect ratio
- do not stretch images
- do not export entire interactive buttons as images
- containers, buttons, fields, and text should remain native React Native UI

If a required asset does not exist:

- do not invent a replacement silently
- leave the API/component prepared if useful
- report the missing asset

---

## 15. Back button

Reuse the shared `BackButton`.

Known visual values:

- 40x40
- borderRadius: 999
- background: `rgba(255, 255, 255, 0.05)`
- borderWidth: about `0.750392`
- borderColor: `rgba(255, 255, 255, 0.1)`
- inner icon box: 20x20
- use `back-arrow.svg`

Do not rebuild the arrow from text characters.

Do not scale the back button for larger devices.

---

## 16. Navigation

Use the project’s existing navigation / auth-screen-state approach.

Do not add a navigation dependency just for one screen if the current flow is already handled locally.

When implementing a screen:

- wire only the requested forward/back action
- do not invent future screens
- do not invent success/error/network states

---

## 17. Backend scope

Unless explicitly requested, auth screens are currently UI/local-state work.

Do not invent:

- backend APIs
- fake API calls
- loading responses
- success toasts
- error toasts
- network delays
- authentication tokens
- fake accounts

Implement only the requested local UI state and navigation.

---

## 18. Do not modify unrelated UI

A task scoped to one component must stay scoped to that component.

Examples:

If asked to fix FormField border:
- do not change buttons

If asked to refine Primary Glass:
- do not change Apple/Google buttons

If asked to implement Check Your Email:
- do not redesign Sign In

Before editing, inspect usages so a shared-component change does not accidentally alter an unrelated variant.

---

## 19. Visual verification

After a visual change, compare both:

- iOS
- Android

Pay attention to:

- safe-area offset
- text baseline
- font rendering
- input padding
- button height
- icon sizing
- border/rim rendering
- vertical spacing

When screenshots differ from Figma, diagnose the layout relationship instead of adding random per-device offsets.

---

## 20. Testing / checks

After each implementation task, normally run:

```bash
npx tsc --noEmit
npm run lint
```

Run targeted tests if the modified flow already has tests.

Do not repeatedly run expensive unrelated workflows unless needed.

Do not use Computer Use / continuous screenshot automation unless explicitly requested. File editing, terminal commands, simulator builds, and targeted screenshots are preferred.

---

## 21. Before modifying code

For every task:

1. Inspect the relevant existing files.
2. Inspect the existing shared components.
3. Inspect current asset names.
4. Understand which values are already correct.
5. Change the smallest necessary surface.
6. Preserve previously approved behavior.

Do not rewrite working components from scratch unless necessary.

---

## 22. After modifying code

Report concisely:

- files changed
- components changed/created
- exact behavior corrected
- any dependency added
- any Figma value that had to be inferred

If nothing was inferred, say that the implementation used supplied values.

Do not automatically proceed to the next screen.

---

## 23. Token / work efficiency

Keep work focused.

Prefer small scoped tasks over broad “review the entire app” passes.

Avoid:

- repeatedly scanning the whole repository
- repeatedly rebuilding both platforms when unnecessary
- generating large logs without need
- using Computer Use for work that can be done through files/terminal
- rewriting already verified components

---

## 24. Core principle

The implementation should satisfy all four:

```text
Figma fidelity
+ responsive layout
+ shared component consistency
+ platform-safe React Native behavior
```

Responsive does NOT mean proportional scaling.

It means preserving the Figma visual relationships while adapting safely to:

- different safe areas
- narrower/wider phones
- taller/shorter phones
- tablets
- keyboard presence

When in doubt, preserve the Figma component sizes and gaps, center/cap the content width, respect the safe area, and let extra screen space become whitespace.

# SkillBridge Learn v0.2.7 Release Candidate QA

## Status

```text
RC Status: Ready for v0.2.x freeze candidate
Version: v0.2.7
Scope: Stable local-first learning loop + safety layers + QA reports
```

## QA Sweep Summary

This release candidate sweep reviews the current v0.2.x architecture before moving toward v0.3.0 review intelligence work.

## Verified Areas

### 1. Version and Cache Metadata

- `APP_VERSION` is centralized in `js/config/appMeta.js`.
- `CACHE_VERSION` is derived from `APP_VERSION`.
- `CACHE_PREFIX` is centralized.
- Service Worker uses metadata from the same source of truth.

### 2. App Shell Registry

- Route page paths are centralized in `js/config/appShellAssets.js`.
- Required engines are centralized.
- Core app shell assets are centralized.
- Content QA and Service Worker use the same app shell registry.

### 3. Offline Support

- Service Worker uses module imports.
- Core assets are precached with `Promise.allSettled`.
- Old caches are cleaned during activation.
- Navigation requests fall back to the app shell.

### 4. Runtime Safety

- Unknown routes are normalized.
- Lesson payloads are sanitized.
- Vocabulary section payloads are sanitized.
- Unsafe state routes are repaired before rendering.
- Invalid quiz answers are ignored.

### 5. Render Safety

- Route rendering is wrapped with an error boundary.
- Page renderer failures no longer cause a blank white screen.
- Users receive a recovery card with a Home button.
- Errors are reported to the console for debugging.

### 6. Storage Integrity

- LocalStorage JSON parsing is guarded.
- Broken state shapes are repaired.
- Broken arrays are repaired.
- Broken objects are repaired.
- Invalid numbers are repaired.
- Stale routes and stale active IDs are repaired.

### 7. QA Panels

- Content QA is available from the app.
- Runtime QA is integrated into the QA report.
- Storage QA is integrated into the QA report.
- Final QA status depends on all QA layers passing.

## Freeze Recommendation

```text
Recommendation: Freeze v0.2.x after one real-device smoke test.
```

Recommended manual smoke test:

1. Open the app from GitHub Pages.
2. Navigate Home, Learn, Lesson, Quiz, Library, Saved, Guide, Settings.
3. Open Content QA and confirm all checks pass.
4. Refresh the page.
5. Reopen the app offline if installed as PWA.
6. Confirm the version badge shows v0.2.7.

## Next Milestone

```text
Milestone 35 — Manual Smoke Test Checklist
```

Purpose: create a simple checklist for phone testing before starting v0.3.0.

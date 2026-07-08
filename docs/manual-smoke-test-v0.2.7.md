# SkillBridge Learn v0.2.7 Manual Smoke Test Checklist 📱

## Purpose

Use this checklist on a real phone before freezing the v0.2.x line and starting v0.3.0.

```text
Goal: Confirm the core learning loop, navigation, QA pages, storage repair, and offline shell behave correctly on a real device.
```

## Test Device

```text
Device:
Browser:
Date:
Tester:
Result: PASS / NEEDS FIX
```

## 1. First Load

- [ ] Open the GitHub Pages app URL.
- [ ] Confirm the app loads without a white screen.
- [ ] Confirm the header shows `SkillBridge Learn`.
- [ ] Confirm the version badge shows `v0.2.7`.
- [ ] Confirm bottom navigation appears correctly.

## 2. Navigation Smoke Test

Open each main page once:

- [ ] Home
- [ ] Learn
- [ ] Library
- [ ] Saved
- [ ] Guide
- [ ] Settings
- [ ] Content QA from Settings

Expected result:

```text
Every page opens without crashing and bottom navigation remains usable.
```

## 3. Core Learning Loop

- [ ] Open Learn.
- [ ] Open the first available lesson.
- [ ] Complete the lesson.
- [ ] Confirm XP changes.
- [ ] Open quiz for the same lesson.
- [ ] Answer all quiz questions.
- [ ] Finish quiz.
- [ ] Confirm quiz result appears.

Expected result:

```text
Learn → Lesson → Complete → Quiz → Result works without state errors.
```

## 4. Vocabulary Loop

- [ ] Open Library.
- [ ] Open an active vocabulary section.
- [ ] Save one word.
- [ ] Open Saved.
- [ ] Confirm the saved word appears.
- [ ] Review the saved word.

Expected result:

```text
Library → Save Word → Saved → Review works correctly.
```

## 5. Guide and Analytics

- [ ] Open Guide.
- [ ] Confirm the guide card renders.
- [ ] Confirm Activity Insight renders.
- [ ] Confirm the Daily Plan renders.
- [ ] Press the main guide action button.

Expected result:

```text
The guide sends the user to a valid page and does not open a broken route.
```

## 6. Progress and Timeline

- [ ] Open Progress.
- [ ] Confirm XP, streak, and stats render.
- [ ] Confirm Activity Timeline renders.
- [ ] Confirm recent actions appear if the learning loop was completed.

Expected result:

```text
Progress dashboard reflects recent local activity.
```

## 7. QA Report

- [ ] Open Settings.
- [ ] Open Content QA.
- [ ] Confirm Content QA section appears.
- [ ] Confirm Runtime QA section appears.
- [ ] Confirm Storage QA section appears.
- [ ] Confirm the final status is `All checks passed`.

Expected result:

```text
Content QA + Runtime QA + Storage QA pass together.
```

## 8. Refresh Test

- [ ] Refresh the page.
- [ ] Confirm the app reloads without losing critical progress.
- [ ] Confirm the current route opens safely.
- [ ] Confirm no white screen appears.

Expected result:

```text
LocalStorage state survives refresh and is repaired if needed.
```

## 9. PWA / Offline Test

Optional if testing from a browser that supports installation:

- [ ] Install the app as PWA.
- [ ] Open the installed app.
- [ ] Turn off internet.
- [ ] Reopen the app.
- [ ] Navigate Home, Learn, Saved, Guide, Settings.

Expected result:

```text
The app shell opens offline after it has been cached once online.
```

## 10. Final Decision

```text
PASS: v0.2.7 can be frozen as the v0.2.x release candidate.
NEEDS FIX: create a v0.2.8 patch before v0.3.0.
```

## Notes

```text
Issue 1:
Issue 2:
Issue 3:
Decision:
```

# Fix Critical State Management Bugs in Menubar

## Summary

This PR fixes three critical state management bugs in the Menubar class that were causing inconsistent behavior, potential memory leaks, and race conditions with blur event handling.

## Bugs Fixed

### 🐛 Bug #1: Incorrect Timer Cleanup Function
**Issue:** `clearInterval()` was being used instead of `clearTimeout()` to clear the blur timeout
**Location:** `src/Menubar.ts:259`
**Impact:** Timeout would not be properly canceled, leading to unexpected window hiding behavior
**Fix:** Changed to use the correct `clearTimeout()` function

```typescript
// Before
clearInterval(this._blurTimeout);

// After
clearTimeout(this._blurTimeout);
```

### 🐛 Bug #2: Incomplete State Reset
**Issue:** Multiple state variables were not being properly reset when the window closed
**Location:** `src/Menubar.ts:323-331` (windowClear method) and line 260 (clicked method)
**Impact:**
- App could think window was visible after it closed
- Dangling references to destroyed window objects
- Active timeouts that reference destroyed windows
- Potential memory leaks

**Fix:** Properly reset all state variables:
```typescript
private windowClear(): void {
  this._browserWindow = undefined;
  this._positioner = undefined;      // ✓ Added
  this._isVisible = false;            // ✓ Added
  if (this._blurTimeout) {            // ✓ Added
    clearTimeout(this._blurTimeout);
    this._blurTimeout = null;
  }
  this.emit('after-close');
}
```

### 🐛 Bug #3: Race Condition with Multiple Blur Events
**Issue:** Multiple rapid blur events could create orphaned timeouts without clearing previous ones
**Location:** `src/Menubar.ts:294-304`
**Impact:** Multiple timeouts could be queued, causing unpredictable hide behavior
**Fix:** Clear any existing timeout before creating a new one

```typescript
// Before (ternary with no cleanup)
this._browserWindow.isAlwaysOnTop()
  ? this.emit('focus-lost')
  : (this._blurTimeout = setTimeout(() => {
      this.hideWindow();
    }, 100));

// After (clear existing timeout first)
if (this._browserWindow.isAlwaysOnTop()) {
  this.emit('focus-lost');
} else {
  if (this._blurTimeout) {
    clearTimeout(this._blurTimeout);
  }
  this._blurTimeout = setTimeout(() => {
    this.hideWindow();
  }, 100);
}
```

## Testing

These fixes address fundamental state management issues that would manifest as:
- Window not responding to clicks after being closed and reopened
- App thinking window is visible when it's not
- Blur timeout firing after window is destroyed
- Multiple hide attempts from orphaned timeouts

## Changes

- Modified `src/Menubar.ts` only (19 insertions, 6 deletions)
- No breaking changes
- No API changes
- Pure bug fixes

## Commits

1. `fix: use clearTimeout instead of clearInterval for blur timeout`
2. `fix: properly reset state in windowClear and clicked methods`
3. `fix: prevent multiple blur timeouts from being created`

---

**Note:** These are critical stability fixes that improve the reliability of menubar window state management. All existing functionality is preserved while eliminating edge cases that could cause crashes or inconsistent behavior.

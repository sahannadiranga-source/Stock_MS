# Testing Guide - Soft Drinks Copy Yesterday Fix

## Issue Fixed
The "Copy yesterday → today" function now properly handles soft drinks even when navigating to a new day that has no data yet.

## Root Cause
When you navigate to a new date (e.g., tomorrow), the page loads with empty rows. If you immediately click "Copy yesterday", it was mapping over an empty array and returning empty results. The fix now creates rows from yesterday's data if today has no rows yet.

## How to Test Soft Drinks Copy

### Step 1: Clear Old Data (Optional but Recommended)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.clear()`
4. Refresh the page
5. This ensures you start fresh

### Step 2: Add a Soft Drink Product
1. Go to **Products** page
2. Click **"Add Product"**
3. Fill in:
   - **Name**: Coca Cola
   - **Category**: Soft Drinks
   - **Initial Stock (Bottles)**: 100
   - **Price per Bottle**: 150
4. Click **Save**

### Step 3: Enter Data for Today (Jan 30, 2026)
1. Go to **Daily Sheet** page
2. Make sure date is **2026-01-30** (today)
3. Find "Coca Cola" in the **"Cigarettes & Soft Drinks"** table
4. Enter:
   - **Previous Bottles**: Should show 100 (from initial stock)
   - **Sold Bottles**: 20
   - **New Bottles**: 30
5. Today Stock should calculate: 100 - 20 + 30 = **110 bottles**

### Step 4: Navigate to Tomorrow
1. Change date to **2026-01-31** (tomorrow)
2. You should see empty rows (no data yet for tomorrow)
3. Coca Cola should appear but with 0 previous bottles

### Step 5: Copy Yesterday to Today
1. Click **"Copy yesterday → today"** button
2. You should see alert: "✅ Copied from 2026-01-30 to 2026-01-31"
3. Check Coca Cola row:
   - **Previous Bottles**: Should now show **110** (yesterday's closing)
   - **Sold Bottles**: Empty (ready for new day)
   - **New Bottles**: Empty (ready for new day)

### Step 6: Verify It Works Multiple Days
1. Enter new data for Jan 31:
   - Sold: 15
   - New: 20
   - Today Stock: 110 - 15 + 20 = **115 bottles**
2. Go to **2026-02-01** (Feb 1)
3. Click **"Copy yesterday → today"**
4. Previous Bottles should show **115**

## Expected Results

✅ **Soft drinks closing bottles copy to next day's previous bottles**
✅ **Works even when navigating to a new date with no data**
✅ **Sold and New bottles reset to empty for the new day**
✅ **Same fix applied to drinks and cigarettes for consistency**

## What Was Fixed

### Before
```typescript
// Only mapped over existing today rows
setSoftDrinkRows((today) => {
  return today.map((t) => { ... }); // Returns [] if today is empty!
});
```

### After
```typescript
// Creates rows from yesterday if today is empty
setSoftDrinkRows((today) => {
  // If today has no rows yet, create them from yesterday's data
  if (today.length === 0 && ySoftDrinks.length > 0) {
    return ySoftDrinks.map((yRow) => {
      // Calculate closing and create new row
    });
  }
  
  // Otherwise map over existing rows
  return today.map((t) => { ... });
});
```

## Additional Notes

- The same fix was applied to **Drinks** and **Cigarettes** for consistency
- This ensures copy works reliably regardless of when you click it
- The fix handles the timing issue between date change and product sync
- All builds successful with no errors

## If It Still Doesn't Work

1. **Clear localStorage**: `localStorage.clear()` in browser console
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check product category**: Make sure product is "Soft Drinks" not "Food"
4. **Check date**: Make sure you're copying from a day that has data
5. **Check console**: Look for any JavaScript errors in DevTools console

# Quick Reference Guide

## What Changed

### 1. Cigarette Tracking Now Includes Loose Cigarettes
- **Before**: Only tracked packs
- **After**: Tracks both packs AND loose cigarettes separately
- **Display**: Shows "7 packs" with "13 loose" below in gray
- **Copy**: Properly carries forward both packs and loose to next day

### 2. Cashiers Can Now Lock Days
- **Before**: Only Admin could lock
- **After**: Cashier can lock TODAY (after entering data), Admin can lock ANY day
- **Unlock**: Only Admin can unlock

### 3. Copy Yesterday Fixed
- **Drinks**: ✅ Copies closing stock to previous
- **Cigarettes**: ✅ Copies closing packs+loose to previous
- **Food**: ✅ Resets to empty (was incorrectly copying before)
- **Expenses**: ✅ Copies expenses (no need to retype)

### 4. Monthly Summary Added
- Click "📊 Monthly Summary" button in header
- See monthly totals and daily breakdown
- Click any date to jump to that day
- Shows which days are locked

### 5. Soft Drinks Category
- Already working - appears in "Cigarettes, Soft Drinks & Food" table
- Tracked like food items (sold count only)

---

## User Workflows

### Daily Workflow (Cashier)
1. Open today's date (default)
2. Enter sold quantities for drinks, cigarettes, food
3. Add new stock received
4. Add expenses
5. Click "🔒 Lock Day" when done
6. Tomorrow: Click "Copy yesterday → today" to start fresh

### Daily Workflow (Admin)
1. Can view/edit ANY date
2. Can unlock locked days if corrections needed
3. Can lock any day
4. Use Monthly Summary to review performance

### Monthly Review
1. Click "📊 Monthly Summary"
2. Review monthly totals
3. Check daily breakdown
4. Click dates to investigate specific days
5. Verify all days are locked

---

## Technical Details

### Cigarette Calculation
```
Previous Total = (previousPacks × 20) + previousLoose
Today Total = Previous Total - (soldPacks × 20) - soldLoose + (newPacks × 20)
Today Packs = floor(Today Total / 20)
Today Loose = Today Total % 20
```

### Copy Yesterday Logic
```
Drinks:
  today.previousStock = yesterday.closing
  today.sold = ""
  today.newStock = ""

Cigarettes:
  yesterday.closing = (prevPacks × 20 + prevLoose) - (soldPacks × 20) - soldLoose + (newPacks × 20)
  today.previousPacks = floor(closing / 20)
  today.previousLoose = closing % 20
  today.sold = ""
  today.newPacks = ""

Food:
  today.soldCount = "" (reset)

Expenses:
  today.expenses = yesterday.expenses (copy all)
```

### Lock Permissions
```
Cashier:
  - Can lock: TODAY only
  - Can unlock: NO

Admin:
  - Can lock: ANY day
  - Can unlock: ANY day
```

---

## Data Storage (localStorage)

### Keys
- `dailySheet-drinks-2026-01-30` - Drink data for Jan 30, 2026
- `dailySheet-cigarettes-2026-01-30` - Cigarette data
- `dailySheet-food-2026-01-30` - Food data
- `dailySheet-expenses-2026-01-30` - Expenses
- `dailySheet-locked-2026-01-30` - Lock status ("true" or absent)

### Clear Data (Browser Console)
```javascript
// Clear specific date
localStorage.removeItem('dailySheet-drinks-2026-01-30');

// Clear all daily sheets
Object.keys(localStorage)
  .filter(key => key.startsWith('dailySheet-'))
  .forEach(key => localStorage.removeItem(key));
```

---

## Future Backend Migration

### Current: localStorage
```typescript
localStorage.setItem('dailySheet-drinks-2026-01-30', JSON.stringify(data));
const data = localStorage.getItem('dailySheet-drinks-2026-01-30');
```

### Future: API
```typescript
await api.saveDrinks('2026-01-30', data);
const data = await api.getDrinks('2026-01-30');
```

All localStorage calls are in hooks, making migration straightforward.

---

## Troubleshooting

### Cigarettes not calculating correctly
- Check previousLoose is set (should be 0 or positive number)
- Verify cigarettesPerPack is set in product (default 20)
- Check copy yesterday was used (not manual entry)

### Can't lock day
- Cashier: Only works for TODAY
- Check user role in localStorage: `localStorage.getItem('user')`
- Admin can lock any day

### Copy yesterday not working
- Verify yesterday has data
- Check yesterday is not empty
- Ensure today is not locked

### Monthly summary shows $0 sales
- This is expected - sales calculation needs product prices
- Expenses are accurate
- Can be enhanced later with product data

---

## Files Modified

### Core Hooks
1. `useDailySheetData.ts` - Data management + previousLoose
2. `useDailySheetLock.ts` - Role-based locking
3. `useDailySheetActions.ts` - Copy logic + updates
4. `useDailySheetCalculations.ts` - Calculations with previousLoose
5. `useProductSync.ts` - Product sync with previousLoose init
6. `useMonthlySummary.ts` - NEW: Monthly aggregation

### UI Components
7. `DailySheet.tsx` - Monthly summary UI + lock buttons + previousLoose display

### Utilities
8. `dailySheetHelpers.tsx` - Display formatting (ml + bottles)

---

## Testing Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY.md for detailed changes
2. Review this QUICK_REFERENCE.md for workflows
3. Check browser console for errors
4. Verify localStorage data structure


---

## ✅ UPDATE: Soft Drinks & Monthly Summary (Task 2 Completed)

### Soft Drinks Bottle Tracking
- **Location**: Daily Sheet → "Cigarettes & Soft Drinks" table
- **Tracking**: Previous Bottles, Sold Bottles, New Bottles, Today Bottles
- **Copy Yesterday**: Closing bottles → Today previous bottles
- **Storage**: `dailySheet-softdrinks-{date}` in localStorage

### Monthly Summary Page
- **Location**: Sidebar → "Monthly Summary" (purple indicator)
- **Route**: `/monthly-summary`
- **Features**:
  - Month/Year selector
  - Monthly totals: Sales, Expenses, Profit, Locked Days
  - Daily breakdown table
  - Click any date to view daily sheet

### Separated Tables
- **Drinks Table**: Arrack, Whiskey, Vodka, Brandy, Beer, Wine
- **Cigarettes & Soft Drinks Table**: Cigarettes (packs/loose) + Soft Drinks (bottles)
- **Food Table**: Simple sold count only

### How to Add Soft Drinks
1. Go to Products page
2. Add new product with Category = "Soft Drinks"
3. Set Initial Bottles and Price Per Bottle
4. Product appears in "Cigarettes & Soft Drinks" table

### Build Status
- ✅ All TypeScript diagnostics: CLEAN
- ✅ Build: SUCCESS
- ✅ No errors or warnings

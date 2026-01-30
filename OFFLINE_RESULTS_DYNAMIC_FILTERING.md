# Offline Results - Dynamic Class/Batch Filtering

## Issue Fixed

Once a class was selected in the offline results form, users were unable to select another class. Classes and batches were hardcoded instead of being fetched dynamically from the database.

## Changes Made

### 1. Dynamic Data Fetching

- **Before**: CLASSES and BATCHES were hardcoded arrays
- **After**: Classes and batches are now fetched dynamically from the database based on actual students

### 2. Updated State Management

Added new state variables:

```typescript
const [classes, setClasses] = useState<string[]>([]);
const [batches, setBatches] = useState<string[]>([]);
const [availableBatches, setAvailableBatches] = useState<string[]>([]);
```

### 3. Enhanced loadStudents Function

```typescript
const loadStudents = async (classFilter?: string, batchFilter?: string) => {
  // Fetches from /api/teacher/students with optional filters
  // Extracts unique classes and batches from results
  // Updates state with dynamic options
};
```

### 4. Cascading Dropdown Behavior

- **Class Selection**:
  - Updates `selectedClass`
  - Resets `selectedBatch` to empty
  - Triggers student re-fetch for the selected class
  - Updates available batch options based on selected class

- **Batch Selection**:
  - Updates `selectedBatch`
  - Triggers student re-fetch for the selected class/batch combination

### 5. useEffect Dependencies

```typescript
// Reload when class or batch changes
useEffect(() => {
  if (selectedClass || selectedBatch) {
    loadStudents(selectedClass || undefined, selectedBatch || undefined);
  }
}, [selectedClass, selectedBatch, currentView]);

// Update available batches when class changes
useEffect(() => {
  if (selectedClass) {
    const classBatches = students
      .filter((s) => s.classLevel === selectedClass)
      .map((s) => s.batch)
      .filter(Boolean);
    setAvailableBatches([...new Set(classBatches)] as string[]);
  } else {
    setAvailableBatches(batches);
  }
}, [selectedClass, students, batches]);
```

### 6. Dropdown Component Updates

```typescript
<Dropdown
  label="Class"
  value={selectedClass}
  options={classes}  // Dynamic from DB
  onSelect={(value: string) => {
    setSelectedClass(value);
    setSelectedBatch(""); // Reset batch
  }}
  placeholder="Select Class"
/>

<Dropdown
  label="Batch"
  value={selectedBatch}
  options={["", ...availableBatches]}  // Dynamic based on class
  onSelect={setSelectedBatch}
  placeholder="All Batches (Optional)"
/>
```

### 7. State Reset on Navigation

Added `navigateToMenu()` function:

```typescript
const navigateToMenu = () => {
  resetCreateForm();
  setSelectedTest(null);
  setResultsData([]);
  setViewTest(null);
  setDropdownOpen(null);
  setCurrentView("menu");
  loadStudents(); // Reload all students without filters
};
```

### 8. Menu Navigation Updates

All menu buttons now reset relevant states before switching views:

- **Create Test**: Calls `resetCreateForm()` to clear all form fields
- **Enter Results**: Resets test and results data
- **View Results**: Resets view test state

## Benefits

### 1. Dynamic Data

- Classes and batches are always in sync with actual student data
- No need to manually update hardcoded arrays
- Automatically adapts to new classes/batches in the system

### 2. Better UX

- Users can freely change class/batch selections
- Cascading dropdowns show only relevant options
- Batch dropdown filters based on selected class
- Clean state on every navigation

### 3. Accurate Filtering

- Student list updates immediately when filters change
- Only shows students matching selected class/batch
- Prevents creating tests for non-existent combinations

### 4. Consistent with App Pattern

- Matches the behavior used in attendance, batches, and other features
- Uses the same `/api/teacher/students` endpoint with filters
- Follows React Native best practices for state management

## API Endpoints Used

### GET /api/teacher/students

Query parameters:

- `classLevel`: Filter by class (e.g., "Class 10")
- `batch`: Filter by batch (e.g., "Lakshya")

Response:

```typescript
{
  students: Student[],
  total?: number
}
// OR
Student[]
```

## Testing Checklist

- [ ] Select a class → Only batches from that class appear
- [ ] Change class selection → Previous selection clears, new batches load
- [ ] Select "All Batches" → Shows all students from selected class
- [ ] Navigate back to menu → All states reset
- [ ] Create new test → Students filtered correctly
- [ ] Switch between Create/Enter/View → No stale data

## Files Modified

- `pages/teachers/offline-results-new.tsx` (159 lines changed)
  - Removed hardcoded CLASSES and BATCHES constants
  - Added dynamic state management
  - Implemented cascading dropdown logic
  - Added proper state reset functions
  - Connected to teacher students API endpoint

## Related Components

This implementation follows the same pattern as:

- `components/teacher/StudentSelector.tsx`
- `pages/teachers/batches.tsx`
- `pages/teachers/offline-results.tsx` (old version)
- `lib/hooks/useStudents.ts`

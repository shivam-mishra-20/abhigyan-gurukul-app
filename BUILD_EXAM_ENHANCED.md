# Build Exam Enhanced - Implementation Guide

## Overview

Professional, modular exam creation flow with student assignment and optimized question loading.

## Features

### 1. **Modular Component Architecture**

- `StudentSelector` - Reusable student selection with filtering
- `FilterSelectionStep` - Professional filter selection interface
- `QuestionSelectionStep` - Optimized question display and selection
- `build-exam-enhanced.tsx` - Main orchestrator component

### 2. **Multi-Step Flow**

1. **Basic Info** - Title, class, duration
2. **Filters** - Subject and chapter selection
3. **Questions** - Browse and select questions with live filtering
4. **Students** - Assign to specific students or entire class
5. **Review** - Final review before saving

### 3. **Student Assignment**

- Select individual students with search and filters
- Option to assign to all students in a class
- Real-time selection count
- Class and batch filtering

### 4. **Optimized Question Loading**

- Parallel fetching for multiple chapters
- Efficient deduplication
- Smart filtering by difficulty and type
- Search functionality
- Expandable question preview with options and images

### 5. **Professional UI/UX**

- Progress indicator across steps
- Step navigation with back/next
- Visual feedback for selections
- Loading states
- Responsive design
- Dark mode support

## File Structure

```
abhigyan-gurukul-app/
├── app/(teacher)/
│   └── build-exam-enhanced.tsx          # Main flow orchestrator
├── components/teacher/
│   ├── StudentSelector.tsx              # Student selection component
│   ├── FilterSelectionStep.tsx          # Filter selection UI
│   └── QuestionSelectionStep.tsx        # Question display & selection
```

## Usage

### Navigate to Enhanced Build Exam

```typescript
// From teacher exams screen
router.push("/(teacher)/build-exam-enhanced");

// Edit existing exam
router.push(`/(teacher)/build-exam-enhanced?examId=${examId}`);
```

### Component Props

#### StudentSelector

```typescript
<StudentSelector
  selectedStudents={selectedStudents}
  onSelectionChange={setSelectedStudents}
  classFilter={selectedClass} // Optional: pre-filter by class
  batchFilter={batchFilter} // Optional: pre-filter by batch
/>
```

#### FilterSelectionStep

```typescript
<FilterSelectionStep
  selectedClass={selectedClass}
  selectedSubject={selectedSubject}
  selectedChapters={selectedChapters}
  onSubjectChange={setSelectedSubject}
  onChaptersChange={setSelectedChapters}
  onNext={handleNext}
/>
```

#### QuestionSelectionStep

```typescript
<QuestionSelectionStep
  selectedClass={selectedClass}
  selectedSubject={selectedSubject}
  selectedChapters={selectedChapters}
  selectedQuestions={selectedQuestions}
  onQuestionsChange={setSelectedQuestions}
  onBack={handleBack}
  onSave={handleNext}
/>
```

## API Endpoints Used

### Questions

- `GET /api/ai/questions/class/:class/filters` - Get available filters
- `GET /api/exams/questions/for-paper` - Fetch questions by filters

### Students

- `GET /api/teacher/students` - Get students with optional filters

### Exams

- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update existing exam
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/assign` - Assign exam to students

## Data Flow

### 1. Exam Creation

```
Basic Info → Filters → Questions → Students → Review → Save
```

### 2. Question Fetching

```
Select Chapters → Parallel Fetch → Deduplicate → Display with Filters
```

### 3. Student Assignment

```typescript
// Assign to specific students
{
  assignedTo: {
    users: ["userId1", "userId2", ...]
  }
}

// Assign to entire class
{
  assignedTo: {
    groups: ["Class 10"]
  }
}
```

## Performance Optimizations

### 1. Parallel Question Fetching

```typescript
const promises = selectedChapters.map((chapter) =>
  apiFetch(`/api/exams/questions/for-paper?...`)
);
const results = await Promise.all(promises);
```

### 2. Efficient Deduplication

```typescript
const unique = Array.from(
  new Map(allQuestions.map((q) => [q._id, q])).values()
);
```

### 3. Memoized Filtering

```typescript
const filteredQuestions = useMemo(() => {
  return questions.filter(q => /* filters */);
}, [questions, searchTerm, filterDifficulty, filterType]);
```

### 4. Lazy Image Loading

- Images loaded only when questions expanded
- Modal viewer for full-size images

## State Management

### Local State (per step)

- Form inputs (title, class, duration)
- Filter selections (subject, chapters)
- Question selections (question IDs array)
- Student selections (student IDs array)

### Persistent State

- Auto-saved to AsyncStorage (optional)
- Restored on component mount

## Error Handling

### User Feedback

- Alert dialogs for validation errors
- Toast notifications for API errors
- Loading states during async operations

### Validation

- Required fields checked before step progression
- Minimum selection requirements
- Data integrity checks before save

## Customization

### Theme Support

```typescript
const colors = getColors(isDark);
// All colors adapt to light/dark mode
```

### Filtering Options

Easily extend with additional filters:

```typescript
// Add difficulty filter
const [filterDifficulty, setFilterDifficulty] = useState("");

// Add topic filter
const [filterTopic, setFilterTopic] = useState("");
```

## Migration from Old Flow

### Replace old build-exam

```typescript
// Old
import BuildExam from "@/app/(teacher)/build-exam";

// New
import BuildExamEnhanced from "@/app/(teacher)/build-exam-enhanced";
```

### Update navigation

```typescript
// Old
router.push("/(teacher)/build-exam");

// New
router.push("/(teacher)/build-exam-enhanced");
```

## Testing Checklist

- [ ] Create new exam with basic info
- [ ] Select filters (subject & chapters)
- [ ] Load questions efficiently
- [ ] Filter questions by difficulty/type
- [ ] Search questions
- [ ] Expand/collapse question details
- [ ] View question images
- [ ] Select multiple questions
- [ ] Assign to specific students
- [ ] Assign to entire class
- [ ] Review before saving
- [ ] Save as draft
- [ ] Publish exam
- [ ] Edit existing exam
- [ ] Navigate back through steps
- [ ] Test with slow network
- [ ] Test with large question sets
- [ ] Test dark mode

## Future Enhancements

1. **Drag & Drop Ordering** - Reorder selected questions
2. **Bulk Actions** - Select all by difficulty/type
3. **Preview Mode** - Live preview of exam layout
4. **Templates** - Save filter combinations as templates
5. **Analytics** - Show question difficulty distribution
6. **Smart Suggestions** - AI-powered question recommendations
7. **Multi-Section Support** - Create multiple sections per exam
8. **Schedule Publishing** - Set publish date/time

## Support & Issues

For issues or questions about the build exam flow:

1. Check component props are correctly passed
2. Verify API endpoints are accessible
3. Check console for error logs
4. Ensure backend supports `assignedTo` in exam model

## Best Practices

1. **Always validate** before proceeding to next step
2. **Show loading states** during async operations
3. **Provide feedback** on user actions
4. **Handle errors gracefully** with user-friendly messages
5. **Keep components focused** on single responsibility
6. **Use memoization** for expensive computations
7. **Implement proper cleanup** in useEffect hooks

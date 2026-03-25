# UNADESK Text Annotation

A modern Angular 18+ single-page application for creating, managing, and annotating articles with rich text highlighting and color-coded annotations.

## Features

- **Article Management**: Create, read, update, and delete articles with localStorage persistence
- **Text Selection & Annotation**: Select any text in an article and add color-coded annotations with optional notes
- **Annotation Rendering**: Multiple overlapping annotations render with stacked box shadows for visual clarity
- **Real-time Sync**: Annotations automatically refresh when articles are modified
- **Toast Notifications**: User feedback for all CRUD operations and errors
- **Responsive Design**: Clean, intuitive UI that works on desktop and tablet

## Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify any source files.

### Running Tests

```bash
npm test                    # Run unit tests with Vitest
npm test:coverage          # Generate coverage report
npm test:e2e               # Run end-to-end tests with Playwright
npm test:e2e:ui            # Run e2e tests with UI
```

### Code Quality

```bash
npm run lint               # Check code style
npm run lint:fix           # Auto-fix style issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting
```

### Build

```bash
npm run build              # Build for production
npm run watch              # Watch mode build
```

## Project Structure

```
src/
├── app/                       # Application shell & routing
│   ├── app.component.*        # Root component with header
│   ├── app.routes.ts          # Route definitions
│   └── routes.constant.ts     # Route path constants
├── features/
│   ├── articles/              # Article CRUD feature
│   │   ├── article-form/      # Create/Edit form component
│   │   ├── article-list/      # List view component
│   │   └── article-viewer/    # Annotation viewer component
│   └── annotations/           # Annotation UI components
│       ├── annotation-tooltip/
│       └── annotation-color-picker/
├── services/
│   ├── article.service.ts     # Article CRUD logic
│   ├── annotation.service.ts  # Annotation management
│   └── toast.service.ts       # Toast notifications
├── lib/
│   ├── annotation-renderer.ts # Text segmentation logic
│   └── storage.ts             # localStorage utilities
├── types/
│   └── annotation.types.ts    # Shared TypeScript types
└── styles.scss                # Global styles
```

## Key Components

### Article Viewer (`article-viewer.component.ts`)

Handles the core annotation workflow:
- Text selection via mouse drag
- DOM-to-text-offset calculation for accurate position mapping
- Color picker for annotation metadata
- Tooltip for hovering over annotations
- Proper cleanup of selection state

**Technical Note**: Uses the DOM Range API with accurate offset calculation to map visual selections to text positions, accounting for DOM structure and rendered formatting.

### Annotation Renderer (`annotation-renderer.ts`)

Splits article text into segments based on annotation breakpoints, allowing multiple overlapping annotations per character:

```typescript
buildSegments(text: string, annotations: Annotation[]): TextSegment[]
```

Creates segments with precise intersection detection for correct rendering.

### Services

- **ArticleService**: CRUD operations with localStorage persistence
- **AnnotationService**: Manages annotations per article with RxJS observables
- **ToastService**: Centralized toast notifications with auto-dismiss

## Test Results

### Unit Tests ✅

```
Test Files: 4 passed (4)
Tests:      41 passed (41)
Duration:   909ms

Breakdown:
✓ ArticleService         - CRUD, persistence, cascade deletion (12 tests)
✓ AnnotationService      - Create, retrieve, list operations (17 tests)
✓ Storage Utility        - Read/write with error handling (5 tests)
✓ Annotation Renderer    - Text segmentation with overlaps (7 tests)
```

### E2E Tests ✅

Playwright tests cover:
- Article creation and navigation
- Text selection and annotation creation
- Color picker functionality
- Annotation dismissal on cancel

Run with: `npm run test:e2e:ui` for interactive testing


## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Tools

- **Framework**: Angular 18.1
- **Language**: TypeScript 5.7
- **Testing**: Vitest 4.1 + Playwright
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier 3.8
- **Git Hooks**: Husky 9.1

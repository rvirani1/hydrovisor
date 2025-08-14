# Testing Guide

This document provides comprehensive information about the testing setup and practices for the Hydrovisor project.

## Overview

The Hydrovisor project uses a robust testing strategy covering:

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions and workflows
- **Mocking**: External dependencies and browser APIs
- **Coverage**: Code coverage reporting and thresholds

## Test Stack

- **Test Runner**: Jest
- **React Testing**: React Testing Library
- **TypeScript**: ts-jest for TypeScript support
- **Environment**: jsdom for browser simulation
- **Mocking**: Jest mocks for external APIs

## Setup

### Dependencies

```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0", 
  "@testing-library/user-event": "^14.0.0",
  "jest": "^29.0.0",
  "@types/jest": "^29.0.0",
  "jest-environment-jsdom": "^29.0.0",
  "ts-jest": "^29.0.0"
}
```

### Configuration

**jest.config.js**:
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Test Categories

### 1. Utility Functions (`src/utils/__tests__/`)

Tests for pure functions and utility modules:

**Notifications** (`notifications.test.ts`):
- Permission handling
- Notification creation
- Browser compatibility
- Error cases

**Overlap Detection** (`overlapDetection.test.ts`):
- Geometric calculations
- IoU (Intersection over Union) algorithms
- Face landmark processing
- Drinking detection logic

### 2. State Management (`src/store/__tests__/`)

**Hydration Store** (`hydrationStore.test.ts`):
- State initialization
- Action dispatching
- Data persistence
- Time calculations
- Zustand store behavior

### 3. React Components (`src/components/__tests__/`)

**HydrationStats Component** (`HydrationStats.test.tsx`):
- Rendering with different props
- Time formatting
- Progress calculations
- Event display
- Conditional rendering

### 4. Custom Hooks (`src/hooks/__tests__/`)

**Drinking Detection Hook** (`useDrinkingDetection.test.ts`):
- Detection algorithms
- Debouncing logic
- Rate limiting
- State transitions
- External dependency integration

## Mocking Strategy

### Browser APIs

```typescript
// Camera/Media APIs
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve(mockStream)),
  },
});

// Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: jest.fn(() => ({
    close: jest.fn(),
    onclick: null,
  })),
});

// Canvas Context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  // ... other canvas methods
})) as any;
```

### External Libraries

```typescript
// Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// TensorFlow/MediaPipe (automatically mocked)
// Overlap detection utilities
jest.mock('../../utils/overlapDetection');
```

### Zustand Store

```typescript
// Store mocking for component tests
jest.mock('../../store/hydrationStore');
const mockUseHydrationStore = useHydrationStore as jest.MockedFunction<typeof useHydrationStore>;

// Mock return values
mockUseHydrationStore.mockReturnValue({
  hydrationEvents: [],
  getTimeSinceLastHydration: jest.fn().mockReturnValue(null),
  // ... other state
});
```

## Test Patterns

### 1. Component Testing

```typescript
describe('MyComponent', () => {
  const defaultProps = {
    prop1: 'value1',
    prop2: 'value2',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent {...defaultProps} />);
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockHandler = jest.fn();
    render(<MyComponent {...defaultProps} onAction={mockHandler} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
  });
});
```

### 2. Hook Testing

```typescript
describe('useMyHook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle state changes', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.someAction();
    });
    
    expect(result.current.someState).toBe(expectedValue);
  });
});
```

### 3. Store Testing

```typescript
describe('myStore', () => {
  beforeEach(() => {
    const { reset } = useMyStore.getState();
    act(() => {
      reset();
    });
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyStore());
    
    act(() => {
      result.current.someAction(payload);
    });
    
    expect(result.current.someState).toEqual(expectedState);
  });
});
```

## Coverage (Optional)

Coverage thresholds are not enforced in this project. Collect coverage when it provides value for a change or PR.

### Exclusions

If you do collect coverage, you may exclude files like:
- Type definitions (`*.d.ts`)
- Entry point (`main.tsx`)
- Vite environment (`vite-env.d.ts`)

### Coverage Reports

```bash
# Generate coverage report if desired
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Coverage Reporting

- **Local**: HTML reports in `coverage/` directory
- **CI**: Uploaded to Codecov for tracking
- **PR Checks**: Coverage deltas reported on pull requests

## Best Practices

### 1. Test Organization

- **Describe blocks**: Group related tests
- **Clear naming**: Descriptive test names
- **Setup/Teardown**: Proper cleanup between tests
- **Isolation**: Each test independent

### 2. Assertions

```typescript
// Good: Specific assertions
expect(result).toBe(expectedValue);
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(element).toBeInTheDocument();

// Avoid: Vague assertions
expect(result).toBeTruthy();
expect(mockFunction).toHaveBeenCalled();
```

### 3. Async Testing

```typescript
// Async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// User interactions
await user.click(button);
await user.type(input, 'text');
```

### 4. Error Testing

```typescript
// Test error cases
expect(() => {
  riskyFunction();
}).toThrow('Expected error message');

// Async errors
await expect(asyncFunction()).rejects.toThrow();
```

## Debugging Tests

### 1. Debug Output

```typescript
// Screen debug
screen.debug(); // Full DOM
screen.debug(element); // Specific element

// Console logging
console.log(result.current); // Hook state
console.log(screen.getByTestId('element')); // Element info
```

### 2. VS Code Integration

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 3. Test Filtering

```bash
# Run specific test file
npm test MyComponent.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle"

# Run only changed files
npm test -- --onlyChanged
```

## Common Issues

### 1. Timing Issues

```typescript
// Problem: Test finishes before async operation
// Solution: Use waitFor
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

### 2. Mock Cleanup

```typescript
// Problem: Mocks persist between tests
// Solution: Clear mocks in beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. DOM Cleanup

```typescript
// Problem: DOM state persists
// Solution: React Testing Library auto-cleanup
// Or manual cleanup if needed
afterEach(() => {
  cleanup();
});
```

## Future Improvements

### 1. Visual Testing

- **Storybook**: Component documentation and testing
- **Chromatic**: Visual regression testing
- **Percy**: Screenshot comparisons

### 2. E2E Testing

- **Playwright**: End-to-end browser testing
- **Cypress**: User journey testing
- **Integration**: Real camera/ML testing

### 3. Performance Testing

- **React DevTools Profiler**: Component performance
- **Lighthouse CI**: Performance metrics
- **Bundle Analysis**: Code splitting verification

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Coverage Reports](https://istanbul.js.org/docs/advanced/coverage-reports/)
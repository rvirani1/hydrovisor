# Hydrovisor 💧

Smart hydration tracking using AI-powered computer vision to detect when you're drinking and remind you to stay hydrated throughout the day.

## Features

- **Real-time Face Detection**: Uses TensorFlow.js and MediaPipe FaceMesh for accurate face tracking
- **Object Detection**: Powered by Roboflow to detect cups, bottles, and glasses
- **Smart Drinking Detection**: Combines face landmarks and object detection to identify when you're drinking
- **Hydration Reminders**: Customizable interval notifications to keep you hydrated
- **Session Tracking**: Persistent storage of your daily hydration events
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS and Framer Motion

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **State Management**: Zustand with persistence
- **AI/ML**: TensorFlow.js + MediaPipe + Roboflow
- **Testing**: Jest + React Testing Library
- **Build**: Vite
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A modern web browser with webcam support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hydrovisor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Testing

This project includes a comprehensive test suite covering utilities, components, hooks, and store logic.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Test Coverage

The test suite includes:

- **Utility Functions**: Notification handling, overlap detection algorithms
- **Zustand Store**: State management, hydration tracking, persistence
- **React Components**: UI components with proper mocking
- **Custom Hooks**: Detection logic, timing functions
- **Integration**: End-to-end workflows

Current coverage targets:
- **Statements**: 70%
- **Branches**: 70% 
- **Functions**: 70%
- **Lines**: 70%

### Test Structure

```
src/
├── utils/__tests__/           # Utility function tests
├── store/__tests__/           # Zustand store tests  
├── components/__tests__/      # React component tests
├── hooks/__tests__/           # Custom hook tests
└── setupTests.ts              # Jest configuration
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── HydrationStats.tsx
│   ├── WebcamFeed.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useFaceDetection.ts
│   ├── useObjectDetection.ts
│   └── ...
├── store/              # Zustand store
│   └── hydrationStore.ts
├── utils/              # Utility functions
│   ├── notifications.ts
│   └── overlapDetection.ts
└── types/              # TypeScript definitions
```

## Configuration

### Hydration Settings
- **Interval**: 1-120 minutes between reminders
- **Detection Sensitivity**: Adjustable overlap thresholds
- **Notification Preferences**: Browser notifications support

### AI Models
- **Face Detection**: MediaPipe FaceMesh for landmark detection
- **Object Detection**: Roboflow inference for cup/bottle recognition
- **Overlap Algorithm**: IoU calculation for drinking detection

## Development

### Code Style
- **TypeScript**: Strict mode with explicit types
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Tailwind**: Utility-first CSS

### Git Workflow
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development

### CI/CD Pipeline

GitHub Actions workflow automatically:
1. **Linting**: ESLint code quality checks
2. **Testing**: Jest test suite with coverage
3. **Building**: Vite production build
4. **Coverage**: Reports uploaded to Codecov

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

**Required Permissions:**
- Camera access for face detection
- Notification permissions for reminders

## Privacy

- **No Data Collection**: All processing happens locally
- **No Cloud Storage**: Data stays on your device
- **Camera Privacy**: Video never leaves your browser

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Before Submitting

- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Coverage maintained: `npm run test:coverage`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **MediaPipe**: Face detection technology
- **Roboflow**: Object detection platform
- **TensorFlow.js**: Machine learning in the browser
- **Tailwind CSS**: Utility-first CSS framework
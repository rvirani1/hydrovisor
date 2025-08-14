# 💧 Hydrovisor

Your AI-powered hydration companion that uses your webcam to detect real drinking moments — no manual logging required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Froboflow%2Fhydrovisor&project-name=hydrovisor&repository-name=hydrovisor&env=VITE_ROBOFLOW_PUBLISHABLE_KEY,VITE_ROBOFLOW_MODEL_NAME,VITE_ROBOFLOW_MODEL_VERSION,VITE_DETECTION_CLASSES)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Froboflow%2Fhydrovisor&env=VITE_ROBOFLOW_PUBLISHABLE_KEY,VITE_ROBOFLOW_MODEL_NAME,VITE_ROBOFLOW_MODEL_VERSION,VITE_DETECTION_CLASSES)

---

### Why Hydrovisor?
- 🎥 **Real-time monitoring**: Detects when you’re actually drinking via your webcam
- 🤖 **AI vision**: Face detection + object recognition (cup, glass, bottle)
- 📊 **Hands-free tracking**: Automatically logs timestamps for hydration events
- ⏱️ **Smart reminders**: Customizable interval alerts to stay on track
- ✨ **Polished UI**: Clean, responsive interface with real-time overlays

---

## How It Works
1. **Face Detection**: TensorFlow.js + MediaPipe FaceMesh to detect your primary face and keypoints
2. **Object Detection**: Roboflow InferenceJS to detect drink containers (`cup`, `glass`, `bottle` by default)
3. **Drinking Detection**: Combines both signals; logs an event only if drinking is sustained for ≥ 2 seconds (with 500ms stop debounce)
4. **Local Logging**: Events are stored locally in the browser using Zustand + persist

## Demo (Local)
```bash
npm install
npm run dev
# open http://localhost:5173
```
Grant camera permission and start tracking from the UI.

## One‑Click Deploy
- Vercel: configure the environment variables when prompted
- Render (Static Site): build command `npm run build`, publish directory `dist`

Required environment variables (Vite):
- `VITE_ROBOFLOW_PUBLISHABLE_KEY`
- `VITE_ROBOFLOW_MODEL_NAME`
- `VITE_ROBOFLOW_MODEL_VERSION`
- `VITE_DETECTION_CLASSES` (default: `cup,glass,bottle`)

## Configuration
- **Hydration Interval**: Set how often to be reminded (range 1–120 minutes; default 3 minutes in this demo)
- **Detection Classes**: Configure via `VITE_DETECTION_CLASSES`
- **Roboflow Model**: Provide key, model name, and version in the UI or via env vars

## Tech Stack
- **Frontend**: React 18 + TypeScript (Vite)
- **Styling**: TailwindCSS
- **State**: Zustand
- **CV**: TensorFlow.js, MediaPipe FaceMesh
- **Object Detection**: Roboflow InferenceJS

## Project Structure
```
src/
  components/
    WebcamFeed.tsx        # Camera feed + overlay
    HydrationStats.tsx    # Stats and progress
    SettingsModal.tsx     # Configuration & controls
    ui/                   # UI primitives (button, card, dialog, etc.)
  hooks/
    useFaceDetection.ts
    useObjectDetection.ts
    useDrinkingDetection.ts
    useHydrationReminder.ts
    useCanvasRenderer.ts
  store/
    hydrationStore.ts      # Zustand store and selectors
  utils/
    notifications.ts
    overlapDetection.ts
  constants.ts
```

## Privacy
- Processing happens locally in your browser
- No raw video is stored; object detections use Roboflow’s API
- Hydration events are stored locally and can be reset from the UI

## Contributing
We welcome contributions! Please follow these guidelines to keep things smooth.

### Pull Request Guidelines
- Keep PRs focused and small; separate unrelated changes
- Include a clear title and description with context and screenshots/GIFs when UI changes are involved
- Adhere to our code style:
  - TypeScript: explicit types, prefer interfaces, avoid `any`
  - React: functional components, hooks, `React.FC` typing
  - State: Zustand slices and selectors; avoid unnecessary re-renders
  - Styling: TailwindCSS utility classes only (no inline styles)
- Ensure detection logic remains performant (rAF loops, throttling, cleanup in effects)
- Update tests if you change logic; add tests for new utilities
- Accessibility: keyboard support, ARIA where appropriate

### PR Checklist
- [ ] Lint passes: `npm run lint`
- [ ] Builds locally: `npm run build`
- [ ] Types OK: no `any` or unsafe casts
- [ ] Tests updated/added where relevant
- [ ] Screenshots/GIFs for UI changes
- [ ] Docs updated (README or `docs/*`)

### Branching & Commits
- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…`
- Commit messages: short imperative subject + optional body (e.g., "feat: add drinking debounce to 500ms")

## Documentation
- Architecture details live in `docs/architecture.md`.

## Support & Links
- Roboflow: `https://roboflow.com`
- Docs: `https://docs.roboflow.com`
- Community: `https://discuss.roboflow.com`
- Issues: `https://github.com/roboflow/hydrovisor/issues`

## License
MIT
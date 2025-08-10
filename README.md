# 💧 Hydrovisor

**Your personal hydration tracking assistant powered by computer vision**

Hydrovisor is an intelligent web application that automatically tracks your hydration habits using your webcam and AI-powered object detection. It detects when you're drinking from cups, glasses, or bottles and maintains a log of your hydration events throughout the day.

![Roboflow Logo](https://roboflow.com/logo.svg)

*An open-source project by [Roboflow](https://roboflow.com)*

## Features

- 🎥 **Real-time webcam monitoring** - Uses your camera to detect drinking activities
- 🤖 **AI-powered detection** - Combines face detection and object recognition to identify when you're drinking
- 📊 **Hydration tracking** - Automatically logs drinking events with timestamps
- ⚙️ **Customizable intervals** - Set personalized hydration reminder intervals
- 📈 **Daily statistics** - View your hydration progress and patterns
- 🎯 **Multiple container types** - Detects cups, glasses, and bottles
- ✨ **Beautiful UI** - Clean, modern interface with real-time feedback

## How It Works

Hydrovisor uses a combination of computer vision techniques:

1. **Face Detection** - Uses TensorFlow.js and MediaPipe to detect when your face is visible
2. **Object Detection** - Integrates with Roboflow's inference API to detect drinking containers (cups, glasses, bottles)
3. **Drinking Detection** - Combines face and object detection to determine when you're actively drinking
4. **Event Logging** - Records hydration events when drinking is detected for more than 2 seconds

## Prerequisites

- Modern web browser with webcam access
- Node.js 18+ and npm
- Roboflow API key and model ID (for object detection)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/roboflow/hydrovisor.git
   cd hydrovisor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Configuration

### Setting up Object Detection

1. **Get a Roboflow API key**:
   - Sign up at [roboflow.com](https://roboflow.com)
   - Create a new project or use an existing one
   - Get your API key from the project settings

2. **Configure the model**:
   - In the app, enter your Roboflow API key
   - Enter your model ID (should detect cups, glasses, and bottles)
   - Click "Start Tracking" to begin monitoring

### Customization

- **Hydration Interval**: Set how often you want to be reminded to drink (default: 30 minutes)
- **Detection Sensitivity**: The app requires drinking to be detected for at least 2 seconds before logging an event

## Usage

1. **Grant camera permissions** when prompted by your browser
2. **Configure your Roboflow settings** in the sidebar
3. **Click "Start Tracking"** to begin monitoring
4. **Position yourself** so your face is visible in the camera feed
5. **Drink naturally** - the app will automatically detect and log your hydration events
6. **Monitor your progress** in the statistics panel

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Computer Vision**: TensorFlow.js, MediaPipe
- **Object Detection**: Roboflow Inference API
- **Build Tool**: Vite

### Project Structure

```
src/
├── components/
│   ├── WebcamFeed.tsx      # Camera feed and detection overlay
│   ├── HydrationStats.tsx   # Statistics and progress display
│   └── HydrationConfig.tsx  # Settings and configuration
├── hooks/
│   ├── useFaceDetection.ts     # TensorFlow.js face detection
│   ├── useObjectDetection.ts   # Roboflow object detection
│   └── useDrinkingDetection.ts # Combined drinking logic
└── store/
    └── hydrationStore.ts       # Zustand state management
```

## Contributing

We welcome contributions! This is an open-source project by Roboflow aimed at demonstrating practical computer vision applications.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy

- All processing happens locally in your browser
- No video data is stored or transmitted (except for object detection API calls)
- Hydration events are stored locally in your browser
- You can clear your data at any time using the reset functionality

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

- 📖 [Roboflow Documentation](https://docs.roboflow.com)
- 💬 [Roboflow Community](https://discuss.roboflow.com)
- 🐛 [Report Issues](https://github.com/roboflow/hydrovisor/issues)

## Acknowledgments

- Built with [Roboflow](https://roboflow.com) for object detection
- Uses [TensorFlow.js](https://www.tensorflow.org/js) for face detection
- Powered by [MediaPipe](https://mediapipe.dev) for face mesh detection

---

*Stay hydrated! 💧*
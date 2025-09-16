<div align="center">
  <img src="src/assets/logo.png" alt="Hydrovisor Logo" width="120" height="120">
  
  # Hydrovisor
  
  [![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-green)](https://github.com/roboflow/hydrovisor)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
  [![Powered by Roboflow](https://img.shields.io/badge/Powered%20by-Roboflow-7c3aed)](https://roboflow.com)
  
  **Your AI-powered hydration companion that uses your webcam to detect real drinking moments — no manual logging required.**
</div>

---

## ✨ Features

- 🎥 **Real-time Detection** - Automatically detects when you're drinking using webcam
- 🤖 **AI-Powered** - Face detection + object recognition (cups, bottles, glasses)
- 📊 **Smart Tracking** - Logs hydration events automatically
- ⏰ **Reminders** - Customizable intervals with sound notifications
- 🎨 **Visual Feedback** - Background pulses orange when drinking detected

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and grant camera permission.

## ⚙️ Configuration

### Environment Variables
```env
VITE_ROBOFLOW_PUBLISHABLE_KEY=your_key
VITE_ROBOFLOW_MODEL_NAME=your_model
VITE_DETECTION_CLASSES=cup,glass,bottle
```

### In-App Settings
- **Hydration Interval**: 1-60 minutes
- **Detection Model**: Choose between YOLO v8, RF-DETR Small, or RF-DETR Nano
- **Sound Notifications**: Toggle on/off

## 🛠️ Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TensorFlow.js** & **MediaPipe** for face detection
- **Roboflow InferenceJS** for object detection
- **Zustand** for state management
- **TailwindCSS** for styling

## 🔒 Privacy

- All processing happens locally in your browser
- No video is stored or transmitted
- Settings persist locally via localStorage

## 📝 License

MIT © [Roboflow](https://roboflow.com)
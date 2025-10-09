# 🍽 🤷 🥗 Let 'em cook!

A Next.js application that helps you discover recipes based on ingredients you have in your fridge and pantry. Powered by Groq's AI to generate creative recipe suggestions tailored to your available ingredients and dietary requirements.

<img src="iphone-screenshot.jpg" alt="Screenshot" width="300" />

## Features

- **Ingredient Management**: Add, edit, and remove ingredients with an intuitive interface
- **AI-Powered Recipes**: Get recipe suggestions using Groq's LLaMA 3.3 70B model
- **Custom Requirements**: Specify dietary restrictions, cuisine preferences, or other requirements
- **Persistent Storage**: Your ingredients and settings are saved locally in your browser
- **Progressive Web App**: Install the app on your mobile device or desktop for an app-like experience
- **Offline Support**: Service worker caches app resources for offline functionality
- **Clean Architecture**: Well-organized component structure for maintainability and reusability

## Getting Started

### Prerequisites

- [Deno](https://deno.com) runtime installed
- A [Groq API key](https://console.groq.com/keys) (free tier available)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Configuration

1. Click the settings icon (⚙️) in the top-right corner
2. Enter your Groq API key
3. Click "Save"

Your API key is stored locally in your browser and is used for all recipe generation requests.

### Development

Run the development server:

```bash
deno run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build

Build the application for production:

```bash
npm run build
npm run start
```

## How It Works

1. **Add Ingredients**: Enter items from your fridge and pantry
2. **Set Requirements** (optional): Specify dietary needs, cuisine type, cooking time, etc.
3. **Generate Recipes**: Click "Get Recipes" to receive AI-generated suggestions
4. **Get Inspired**: View 3 simple recipe ideas with descriptions

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Runtime**: Deno
- **Styling**: Tailwind CSS
- **AI Provider**: Groq (LLaMA 3.3 70B Versatile)
- **Language**: TypeScript
- **PWA**: next-pwa for Progressive Web App functionality

## Installing as PWA

### On Mobile (iOS/Android)

**iOS (Safari):**

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

**Android (Chrome):**

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" to confirm

### On Desktop

**Chrome/Edge:**

1. Open the app
2. Look for the install icon (+) in the address bar
3. Click "Install"

**Desktop PWA features:**

- Runs in its own window
- Appears in your application menu
- Works offline with cached content

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the component architecture and design patterns used in this project.

## PWA Documentation

For information about the Progressive Web App features and how to install the app on your device:

- See [PWA.md](./PWA.md) for comprehensive PWA documentation including:
  - Installation instructions for mobile and desktop
  - Service worker configuration
  - Caching strategies
  - Offline functionality
  - Troubleshooting guide

## API Documentation

For developers integrating with the API or wanting to understand the API capabilities:

- See [API.md](./API.md) for comprehensive API documentation including:
  - Authentication and rate limiting
  - Request/response formats
  - Error handling and codes
  - Validation rules
  - Security features
  - Code examples

## Deploy on Deno

Deploy this application to Deno Deploy:

1. Go to the [Deno Deploy dashboard](https://app.deno.com/)
2. Click "New Project"
3. Connect your GitHub repository
4. Deploy!

## License

This project is open source and available under the MIT License.

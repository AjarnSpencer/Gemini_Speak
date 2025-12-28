<div align="center">
  <img src="public/gemini-relay-logo.svg" alt="Gemini Speak Relay Logo" width="180" height="180" />
  
  # Gemini Speak Relay
  
  **High-Performance Real-Time Multilingual Communication**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Powered By](https://img.shields.io/badge/Powered%20By-Gemini%203%20Pro-purple)](https://ai.google.dev/)
  [![React](https://img.shields.io/badge/Built%20With-React%2019-cyan)](https://react.dev/)

  <p>
    <em>A professional-grade translation bridge that doesn't just translate words—it translates intent.</em>
  </p>
</div>

---

## 🚀 Overview

**Gemini Speak Relay** is a cutting-edge web application designed to facilitate seamless conversation between speakers of different languages. Powered by Google's **Gemini 3 Pro**, it goes beyond simple transcription by analyzing audio input to detect the speaker's emotional tone and synthesizing the translated output in a voice that matches the context.

The application features a strict **BYOK (Bring Your Own Key)** architecture, ensuring that your API usage remains private, secure, and under your control.

## ✨ Key Features

### 🎙️ Real-Time Vocal Translation
Speak naturally, and the app instantly transcribes, translates, and synthesizes speech in the target language. It supports a wide array of global languages with native-quality Text-to-Speech (TTS) output.

### 🎭 Sentiment & Tone Analysis
Unlike standard translators, Gemini Speak Relay displays the **Speech Sentiment** of every interaction. 
- **Visual Feedback:** Context-aware icons (Sun for joy, Storm clouds for sadness, Lightning for anger, Shields for professional tones) appear next to every message.
- **Tone Preservation:** The AI analyzes the audio input to determine if the speaker is being sarcastic, professional, angry, or happy, providing critical context to the recipient.

### 🔐 Security First (BYOK)
- **Zero Server Storage:** Your API keys are stored locally in your browser (LocalStorage or SessionStorage).
- **Direct Client-to-Google:** Data flows directly from your browser to Google's servers. No middleman servers read your conversations.

### 🔄 Turn-Based Relay UI
Designed for face-to-face or device-passing scenarios:
- **User A (Blue)** and **User B (Orange)** have distinct visual zones.
- One-button control simplifies the flow of conversation.
- "Hold-to-Speak" mechanics prevent accidental interruptions.

---

## 📖 How to Use

1.  **API Key Setup:**
    *   Launch the app.
    *   Click the **Key Icon** or the setup prompt.
    *   Enter your **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/)).
    *   Choose *Persistent* (saved for next time) or *Session* (cleared on close) storage.

2.  **Configure Languages:**
    *   Select the language for **User A** (e.g., English).
    *   Select the language for **User B** (e.g., Spanish).

3.  **Start Conversation:**
    *   **User A** holds the large microphone button and speaks.
    *   Release the button to finish.
    *   The app translates the audio, displays the text and **Sentiment Icon**, and automatically speaks the translation to User B.
    *   The app automatically switches control to **User B**.

4.  **Review History:**
    *   Scroll through the "Notebook" to see the full transcript.
    *   Click the **Play** icon next to any message to hear the translation again.

---

## 🛠️ Installation

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AjarnSpencer/gemini-speak-relay.git
    cd gemini-speak-relay
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

---

<div align="center">
  <p>Created with ❤️ by</p>
  <h3>Ajarn Spencer Littlewood</h3>
  <p>
    <a href="https://github.com/AjarnSpencer">GitHub Profile</a>
  </p>
</div>

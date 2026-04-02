<div align="center">

# 🌤️ Weather Atelier

### A modern weather information website built with React, Vite, and Tailwind CSS

[![React](https://img.shields.io/badge/React-19-0f172a?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-155e75?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-0891b2?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/Tanmay-Kudkar/Simple-Website/static.yml?label=GitHub%20Pages)](https://github.com/Tanmay-Kudkar/Simple-Website/actions/workflows/static.yml)

</div>

---

## ✨ Overview

Weather Atelier is a clean and stylish weather dashboard that helps users check live weather data for cities around the world.
It includes quick city search, current weather highlights, and a 5-day forecast in a responsive, mobile-friendly interface.

---

## 🚀 Live Demo

🔗 https://tanmay-kudkar.github.io/Simple-Website/

---

## 🌟 Features

- 🔎 Smart city search with suggestion dropdown
- 🌡️ Current weather details (temperature and feels-like)
- 💧 Humidity and 💨 wind speed metrics
- 🌅 Sunrise and 🌇 sunset timings
- 🗓️ 5-day forecast cards with weather labels
- ⚠️ Friendly popup notifications for invalid searches/errors
- 📱 Fully responsive UI for mobile and desktop
- ⚡ Fast loading and production builds with Vite

---

## 🧰 Tech Stack

| Category | Tools |
| --- | --- |
| Frontend | React 19 |
| Styling | Tailwind CSS 4 + custom CSS animations |
| Build Tool | Vite 8 |
| Linting | ESLint 9 |
| Weather Data | Open-Meteo APIs |
| Deployment | GitHub Pages via GitHub Actions |

---

## 📂 Project Structure

```text
.
├── .github/workflows/static.yml
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Tanmay-Kudkar/Simple-Website.git
cd Simple-Website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Run lint checks

```bash
npm run lint
```

---

## 🌍 Deployment (GitHub Pages)

This project is already configured for automatic deployment using:

- GitHub Actions workflow: `.github/workflows/static.yml`
- Deployment target: GitHub Pages

### Deploy steps

1. Push changes to `main` branch.
2. Open the **Actions** tab in GitHub.
3. Run or re-run **Deploy Vite site to Pages** workflow.
4. After successful build and deploy, open the Pages URL.

---

## 🔌 APIs Used

- 🌐 Open-Meteo Geocoding API (city search)
- 🌦️ Open-Meteo Forecast API (current + daily weather)

No API key is required.

---

## 🧠 Future Improvements

- 🌡️ Toggle between Celsius and Fahrenheit
- 📊 Hourly weather charts
- 📍 Save favorite cities
- 🌙 Theme switcher (light/dark)

---

## 👨‍💻 Author

Made with care by **Tanmay Kudkar**.

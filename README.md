<img title="a title" alt="Alt text" src="logo.svg">

A full-stack application (Go + React/Vite) for automated post-incident report (Postmortem) generation in PDF — with multilingual support (PT/EN), customizable corporate templates, and dynamic branding (header/footer via base64).

---

## Overview

**Postmortem Generator** allows the creation of technical and executive reports from a web form.  
It combines a **modern React frontend** with a **Go backend (GoFPDF + Gin)** to generate rich and standardized PDFs featuring:

* **Executive summary and impact**, with dynamic translation  
* **Incident overview** with dates, duration, and severity  
* **Detailed timeline** with notes and images  
* **Corrective/Preventive Actions (CAPA)** dynamically listed  
* **Lessons learned** and references  
* **Customizable header/footer** with base64 logos and images  

---

## 🛠 Project Structure

```
Postmortem_creator/
├── backend/              # Go (Golang) API
│   ├── main.go           # Main service (Gin + GoFPDF)
│   ├── locales.go        # Translations (PT/EN)
│   ├── fonts/            # Fonts used in PDF (DejaVuSans.ttf, etc.)
│   └── Dockerfile        # Backend image build
│
├── frontend/             # Web interface (React + Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   └── Index.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── IncidentOverview.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── ActionsTable.tsx
│   │   │   └── LessonsLearned.tsx
│   │   └── hooks/
│   │       └── useTranslation.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md             # This file
```

---

## ⚙️ Backend (Go)

### 🔧 Requirements

* [Go 1.23+](https://go.dev/dl/)
* [Git](https://git-scm.com/)
* DejaVuSans font installed (or placed in the `/fonts` folder)

### ▶️ Run locally

```bash
cd backend
go mod tidy
go run .
```

The backend runs by default at:  
**[http://localhost:8080](http://localhost:8080)**

Main endpoint:

```
POST /generate-postmortem-pdf
```

Expected JSON body:

```json
{
  "title": "Checkout API Failure",
  "creator": "Your name",
  "date": "2025-10-18",
  "severity": "SEV-2",
  "owners": "Application Team",
  "startTime": "02:22",
  "endTime": "23:34",
  "duration": "21h12m",
  "summary": "Degradation observed in Checkout APIs...",
  "impact": "37% of requests failed...",
  "rootCause": "Incorrect change in Redis TTL...",
  "actions": [...],
  "timeline": [...],
  "lessons": {...},
  "branding": {
    "header": "data:image/png;base64,...",
    "footer": "data:image/png;base64,..."
  },
  "lang": "en"
}
```

The PDF file is automatically generated in the `/output` folder.

---

## 🎨 Frontend (React + Vite)

### 🔧 Requirements

* [Node.js 20+](https://nodejs.org/)
* [pnpm](https://pnpm.io) or npm/yarn

### ▶️ Run locally

```bash
cd frontend
npm install
npm run dev
```

The web application runs at:  
**[http://localhost:5173](http://localhost:5173)**

---

## 🔗 Front ↔ Back Integration

The frontend sends the full JSON to:

```
POST http://localhost:8080/generate-postmortem-pdf
```

The backend returns the binary PDF, which is automatically downloaded by the browser.

---

## 🧰 Key Features

| Category              | Description                                         |
| ---------------------- | --------------------------------------------------- |
| 🌐 Translation         | **PT/EN** support via `locales.go`                 |
| 🧩 Modular layout      | Dynamic titles, timelines, and CAPAs               |
| 🧾 Customizable PDF    | Fonts, margins, colors, and logos                  |
| 📸 Image support       | Inline base64 (Timeline, Header, Footer)           |
| 📅 Auto duration       | Calculated from start and end times                |
| 🔒 Secure branding     | Header/Footer set via base64 in JSON               |
| 🎯 Responsiveness      | Fully reactive frontend                            |

---

## 🐳 Build with Docker

```bash
docker build -t postmortem-backend ./backend
docker run -p 8080:8080 postmortem-backend
```

Or use the frontend `Dockerfile` to build and serve the static app version.

---

## 🧠 PDF Generation Structure

The backend uses the [`gofpdf`](https://github.com/jung-kurt/gofpdf) library to compose the report:

* Header and footer with auto-resized images  
* Centered titles with highlight colors  
* Translated text according to `data.Lang`  
* Dividers and clear visual hierarchy  
* Styled timeline and dynamic action lists  
* Automatic pagination with numbering outside the footer  

---

## 🧪 Development & Contribution

1. Clone the repository  
2. Set backend URL (`http://localhost:8080`) in the frontend (`.env.local`)  
3. Run both services (`go run .` and `npm run dev`)  
4. Generate real postmortems through the web form  

---

## 🧾 License

Distributed under the MIT License.  
© 2025 Gustavo Pinheiro 🌲

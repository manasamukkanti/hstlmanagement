# HostelFlow - Hostel Management System

A full-stack hostel and dormitory management system built with **React**, **Node.js (Express)**, and a persistent local database.

---

## Prerequisites

Before running the application locally, make sure you have installed:
- [Node.js](https://nodejs.org/) (Version 18.x, 20.x, or higher)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [VS Code](https://code.visualstudio.com/)

---

## How to Run in Visual Studio Code

### 1. Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl+K Ctrl+O` on Windows/Linux, `Cmd+O` on macOS).
3. Select this project root folder and click **Open**.

---

### 2. Open the Integrated Terminal
- Press `` Ctrl + ` `` (Backtick) on Windows/Linux or `` Cmd + ` `` on macOS.
- Or select **Terminal** > **New Terminal** from the top menu bar.

---

### 3. Install Dependencies
Run the following command in the terminal to install all required packages:
```bash
npm install
```

---

### 4. Create the Environment File (Optional)
Copy `.env.example` to `.env`:
```bash
# On macOS / Linux:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```
*(Default settings run immediately without any extra configuration).*

---

### 5. Start the Application
Run the development server:
```bash
npm run dev
```

You will see output in the terminal:
```
[HostelFlow Server] running on http://0.0.0.0:3000 (development)
```

---

### 6. View the App in Your Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## Project Structure

```
├── data/                    # Persistent JSON database (auto-seeded)
│   └── hostel_database.json
├── server/
│   └── db.ts                # Database engine & atomic transaction helper
├── server.ts                # Express backend + Vite middleware server
├── src/
│   ├── assets/              # Generated visual assets
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── DashboardView.tsx
│   │   ├── RoomsView.tsx
│   │   ├── ResidentsView.tsx
│   │   ├── FeesView.tsx
│   │   ├── MaintenanceView.tsx
│   │   ├── VisitorsView.tsx
│   │   ├── MessView.tsx
│   │   ├── NoticesView.tsx
│   │   ├── InvoiceReceiptModal.tsx
│   │   ├── NewAdmissionModal.tsx
│   │   └── AllocateBedModal.tsx
│   ├── services/
│   │   └── api.ts           # Frontend REST client
│   ├── types/
│   │   └── hostel.ts        # TypeScript definitions
│   ├── App.tsx              # Main application coordinator
│   └── main.tsx             # React DOM entry point
├── package.json
└── tsconfig.json
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts full-stack Express server + React client on port 3000 |
| `npm run build` | Builds production frontend bundles into `dist/` |
| `npm run start` | Runs the production Node.js server |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## Recommended VS Code Extensions

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)

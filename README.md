# Kachra Bazar — Smart Municipal Waste Management Platform
> **Pilot City: Bhopal, Madhya Pradesh**  
> *Final-Year Major Project | Sagar Institute of Research & Technology - Excellence (SIRTE), Bhopal*  
> **Theme:** Clean & Green Technology | **Category:** Software  

---

## 👥 Student Engineering Team
* **Sourabh Patel** (Project Lead & Full-Stack Architecture)
* **Vishal Dhakad** (Backend Systems, GeoJSON & Socket Architecture)
* **Rehman Khan** (Frontend UI/UX, Leaflet Maps & Responsive Design)
* **Zeeshan Ashraf** (Database Design, Eco-Points Ledger & Verification Engine)

**Institute:** SIRTE, Sagar Group of Institutions, Bhopal, Madhya Pradesh  
**Academic Year:** 2025–2026

---

## 🌆 Problem Context & Real-World Pilot (Bhopal)

Waste management in Indian urban centers faces acute logistical bottlenecks:
1. **One-Way Communication:** Citizens have zero visibility into daily municipal vehicle schedules, leading to uncollected waste and roadside dumping.
2. **Fixed Unoptimized Routes:** Sanitation workers operate along rigid phone-call schedules; citizen on-demand requests fail to reach them in time.
3. **Absence of Real-Time Municipal Oversight:** Civic authorities rely on lagging monthly reports rather than live GIS telemetry.
4. **Roadside Dump Hotspots:** Illegal garbage accumulation sites expand unnoticed until a formal public grievance escalates.

### Grounded Urban Statistics
* **India (National):** Generates **~1.7 lakh tonnes** of municipal solid waste per day (*CPCB Annual Report 2021-22 via CAG Audit*); while ~92% is collected, scientific segregation and processing lag substantially behind.
* **Bhopal (Pilot City):** Generates **~850 tonnes** of solid municipal garbage daily.
* **Bhopal Municipal Corporation (BMC):** Operates **469 door-to-door GPS-tracked collection vehicles** across 85 administrative wards. Bhopal achieved the prestigious **5th rank nationally in Swachh Survekshan 2023**.

### The Solution: "Kachra Bazar"
* **"Kachra"** = Waste, **"Bazar"** = Marketplace.
* **Core Philosophy:** Waste has intrinsic economic and environmental value. When citizens segregate waste at source (Wet, Dry, Recyclable, E-Waste, Hazardous), they earn verified **Eco-Points** credited to an immutable digital ledger.
* Points are redeemed in the **Rewards Bazar** for tangible civic perks: electricity bill discounts (MPEB), water tax rebates, home segregation bins, and local business vouchers.

---

## 🚀 Key Features by User Role

### 1. 🧑‍🤝‍🧑 Citizen Portal
* **Draggable Map Pin Pickups:** Schedule door-to-door waste collection with OpenStreetMap coordinates, waste categorization, and preferred time slots.
* **Live Fleet Tracking:** Watch assigned BMC collection vehicles move in real-time on an interactive Leaflet map with live route polyline, speed, and dynamically calculated ETA.
* **Automated 500m Proximity Alerts:** Web push toast & notification sound as the municipal truck approaches within 500 meters of the citizen's residence.
* **Verified Eco-Points Ledger:** Points are strictly awarded **only upon sanitation worker verification** at the doorstep (+20 for full segregation, +10 for partial, 0 for none).
* **"Your Worth" Impact Dashboard:** Visualizes total kg of segregated waste, estimated $CO_2$ kilograms mitigated ($1.25\text{ kg } CO_2\text{ per kg waste}$), active pickup streaks, and citizen tier (Bronze $\rightarrow$ Silver $\rightarrow$ Gold $\rightarrow$ Platinum).
* **Rewards Bazar:** Atomic redemption of points for discount vouchers with unique alphanumeric codes (`KB-VOUC-XXXX-XXX`).
* **Dump Hotspot Reporter:** Snap geo-tagged photos of roadside garbage dumps with severity tags; receive +30 bonus points once municipal workers clear the site.

### 2. 👷 Worker Portal (Mobile First)
* **Today's Route & Stop Sequence:** Ordered collection stops for assigned Bhopal wards (e.g., MP Nagar, Kolar Road, Arera Colony, TT Nagar, Hoshangabad Road).
* **Step-by-Step Workflow:** One-tap status updates (`Start Route` $\rightarrow$ `Arrived` $\rightarrow$ `Collected`).
* **Doorstep Segregation Verification Sheet:** Inspect waste quality (Correct / Partial / None), upload proof photo, add notes, and trigger atomic point dispatch to citizen.
* **Field Incident Reporting:** Alert municipal authorities regarding road blockages, vehicle tire punctures, or overflowing community bins.
* **Dump Clearance Action:** Navigate to citizen-reported dump hotspots, upload "after-clearance" proof photo, and close the incident.

### 3. 🛡️ Admin & Municipal Command Center
* **Live City Fleet Map:** Multi-vehicle GIS command dashboard tracking all operating collection trucks across Bhopal wards simultaneously with ward boundary overlays.
* **Live Analytics Suite (Recharts):**
  - 14-day daily pickup collection trends.
  - Segregation compliance rate across wards.
  - Waste category distribution (Wet, Dry, Recyclable, E-Waste, Hazardous).
  - Worker performance and citizen satisfaction ratings.
* **Route & Vehicle Dispatcher:** Configure routes, assign drivers to vehicles, and schedule municipal collection shifts.
* **Civic Broadcast System:** Post urgent ward-specific or city-wide hygiene notices with real-time WebSocket push notifications to citizen dashboards.
* **One-Click CSV Data Export:** Export pickups, dump incidents, worker performance records, and reward redemptions for administrative reporting.

---

## 🛠️ Complete Technical Architecture

### Frontend
* **Core:** React 18 + Vite
* **Styling:** Tailwind CSS (Deep Civic Green `#14532D`, Saffron `#F28C28`, Mint `#EAF4EC`, Dark Mode support)
* **Routing:** React Router v6 (Role-Based Protected Routes: `citizen`, `worker`, `admin`)
* **GIS & Mapping:** React Leaflet + OpenStreetMap TileLayer (**Zero paid API keys required**)
* **Data Visualization:** Recharts (Responsive bar, line, and pie charts)
* **State Management:** Zustand (Session persistence, dark/light theme store)
* **Real-time Engine:** Socket.io-client
* **UI Feedback:** `react-hot-toast` & `lucide-react` icons

### Backend
* **Runtime:** Node.js (ES Modules, `"type": "module"`) + Express.js
* **Database:** MongoDB with Mongoose (GeoJSON `Point` coordinates, indexed with `2dsphere`)
* **Authentication:** JWT Access Tokens stored securely in `httpOnly` cookies (`SameSite=Lax`)
* **Security:** `helmet`, `cors`, `express-rate-limit`, `bcryptjs` password hashing
* **File Uploads:** Local `/uploads` static file server via `multer` (zero cloud lock-in; optional Cloudinary support)
* **Vehicle Simulator:** Built-in kinematic GPS simulator (`SIMULATE_VEHICLES=true`) that interpolates collection trucks along Bhopal street coordinates and computes proximity to pending pickups.
* **Automated Cron Jobs:** `node-cron` for periodic vehicle health checks and streak maintenance.

---

## 📁 Repository Structure

```
Kachara_bazar/
├── package.json             # Root monorepo configuration (concurrently, test & seed scripts)
├── README.md                # Project documentation & presentation guide
├── client/                  # React 18 + Vite Frontend
│   ├── package.json
│   ├── vite.config.js       # Proxies /api, /uploads, /socket.io to backend (port 5000)
│   ├── tailwind.config.js   # Civic green & saffron design tokens
│   ├── index.html           # Leaflet CSS & Google Fonts (Poppins & Inter)
│   └── src/
│       ├── api/             # Axios client with credentials & interceptors
│       ├── components/      # Common (Maps, Counter, Timeline, Modals) & Layout (Navbar, Sidebar, BottomNav)
│       ├── pages/           # Public, Citizen, Worker, and Admin views
│       ├── services/        # Socket.io client service
│       ├── store/           # Zustand Auth & Theme stores
│       └── utils/           # Leaflet SVG icons & distance formulas
└── server/                  # Node.js + Express Backend
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── config/          # Database (with in-memory fallback) & Eco-rules config
    │   ├── controllers/     # Auth, Pickups, Dumps, Vehicles, Routes, Analytics, Rewards, etc.
    │   ├── middleware/      # JWT auth, RBAC guard, Multer upload
    │   ├── models/          # 12 Mongoose Schemas (User, Ward, Vehicle, PickupRequest, etc.)
    │   ├── routes/          # Express REST API routes
    │   ├── seed/            # Bhopal dataset generator (8 wards, 120+ historical records)
    │   ├── services/        # Points ledger, Socket.io gateway, Kinematic GPS simulator
    │   ├── tests/           # Supertest integration tests (11/11 passing)
    │   └── server.js        # Express application entrypoint
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Node.js** v18+ installed
* **MongoDB** installed and running on port 27017 (or provide a remote MongoDB Atlas URI)

### 2. Clone & Install Dependencies
Run from the root project directory:
```bash
npm install
```
*(This automatically installs dependencies across both `/client` and `/server` workspaces).*

### 3. Environment Configuration
The repository includes pre-configured `.env` files for immediate localhost execution:
* **`server/.env`**:
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://127.0.0.1:27017/kachra_bazar
  JWT_SECRET=kachra_bazar_super_secure_jwt_secret_key_bhopal_2026
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  SIMULATE_VEHICLES=true
  ```

### 4. Seed the Database
Populate 8 realistic Bhopal wards, municipal vehicles, active routes, 120+ historical pickups, dump hotspots, and catalog rewards:
```bash
npm run seed
```

### 5. Launch Application
Start both Backend and Frontend concurrently with a single command:
```bash
npm run dev
```
* **Frontend:** Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Backend API:** Running on [http://localhost:5000](http://localhost:5000).

### 6. Run Automated Integration Tests
Verify end-to-end API integrity, role-based access control, atomic points crediting, and coupon issuance:
```bash
npm test --prefix server
```
*(All 11 Supertest integration tests execute and pass with zero open handles).*

---

## 🔑 Demo Login Credentials (All Passwords: `Demo@1234`)

| Role | Email | Password | Pre-configured Context |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@kachrabazar.in` | `Demo@1234` | Full access to all 8 wards, city GIS map, and analytics |
| **Sanitation Worker** | `worker1@kachrabazar.in` | `Demo@1234` | Assigned to Ward 10 (MP Nagar Zone 1), Vehicle MP04-G-1101 |
| **Civic Citizen** | `citizen@kachrabazar.in` | `Demo@1234` | Resident of MP Nagar with active points and pending requests |

*(Quick-fill demo buttons are also provided on the [Login Screen](http://localhost:5173/login) for instant one-click login during viva presentations).*

---

## 🎬 8-Stage Step-by-Step Viva Presentation Walkthrough

Follow this scripted workflow during project evaluation to demonstrate all features:

### Stage 1: Public Landing & Transparency Heatmap
1. Open [http://localhost:5173](http://localhost:5173).
2. Highlight the headline: *"Segregate. Track. Earn. Recycle."*
3. Showcase the verified government statistics strip (CPCB & BMC Bhopal figures).
4. Scroll to the **Public Dump Hotspot Map** demonstrating citizen-reported roadside accumulations.
5. Point out the **About the Project & Team** section highlighting SIRTE Bhopal.

### Stage 2: Citizen Login & Dashboard
1. Click **Login** and press the **"Demo Citizen"** quick-fill button.
2. View the **Citizen Dashboard** displaying current Eco-Balance, daily streak, and level badge.
3. Review the **"Your Worth"** card showing kilograms of waste diverted and CO2 emissions mitigated.

### Stage 3: Requesting a Door-to-Door Pickup
1. Click **"Request Pickup"** in the sidebar.
2. Select waste category: **Dry Recyclables** (or E-Waste).
3. Interact with the **Leaflet Map Picker**: click on any Bhopal street or drag the pin.
4. Select a preferred pickup slot (e.g., Morning 07:00 AM – 10:00 AM) and submit.
5. Notice the new request appears instantly with a visual **Status Timeline** set to `pending`.

### Stage 4: Admin Live GIS Command & Dispatch
1. Open an Incognito window (or log out) and log in as **Admin** (`admin@kachrabazar.in`).
2. Navigate to **"Live City Fleet Map"**: observe the simulated collection vehicles moving along their Bhopal street routes in real-time.
3. Open **"Pickup Requests"**: view the newly submitted citizen request.
4. Click **"Assign"**, select Worker **Ramesh Kumar** and Vehicle **MP04-G-1101**. The status changes to `assigned`.

### Stage 5: Live Vehicle Movement & Proximity Alert
1. Switch back to the Citizen window and navigate to **"Live Truck Tracking"**.
2. Watch the assigned municipal vehicle move towards the citizen's pin in real time via Socket.io.
3. As the truck enters within 500 meters, a **real-time Proximity Toast notification** triggers on the screen: *"Municipal Vehicle MP04-G-1101 is arriving soon!"*

### Stage 6: Worker Doorstep Verification & Points Crediting
1. Log in as **Worker** (`worker1@kachrabazar.in`).
2. Navigate to **"Today's Route & Stops"**.
3. Locate the stop, click **"Arrived"**, then click **"Collected"**.
4. The **Verification Modal** opens: select **"Correct Segregation (100% Segregated)"** and click **"Verify & Credit Points"**.
5. Switch to the Citizen tab: see the live **Eco-Counter animate upwards by +20 points** with a celebratory sound/toast!

### Stage 7: Redeeming Rewards in the "Bazar"
1. As Citizen, navigate to the **"Rewards Bazar"**.
2. Browse utility discounts (e.g., ₹100 Electricity Rebate, 3-Bin Home Composting Kit, Reusable Cloth Bags).
3. Click **"Redeem"**: the system atomically deducts points and generates an authentic coupon code (e.g., `KB-VOUC-8921-X9K`).
4. The redemption appears under "My Coupons" and in the admin fulfillment ledger.

### Stage 8: Dump Hotspot Reporting & Resolution
1. As Citizen, navigate to **"Report Dump Hotspot"**.
2. Drop a pin on an uncollected garbage site, mark severity as **"High"**, and submit.
3. As Admin, view the new red pin on **"Dump Hotspots"** and dispatch Worker Ramesh.
4. As Worker, open **"Dump Clearances"**, submit an "after-clearance" confirmation.
5. The reporting citizen immediately receives **+30 bonus eco-points** for civic vigilance!

---

## 🛡️ Security, Validation & Eco-Points Integrity

* **Zero Premature Crediting:** Points cannot be minted or credited upon request creation; they are exclusively generated when a field worker submits a verified inspection report.
* **Double-Crediting Guard:** `EcoPointTransaction` uses a strict compound index on `{ user: 1, refId: 1, type: 1 }` to mathematically guarantee no duplicate points can be awarded for the same pickup.
* **HTTP-Only Cookies:** JWT tokens are insulated from Cross-Site Scripting (XSS) via `httpOnly` flags with `SameSite=Lax`.
* **Zero Cost Spatial Querying:** All geospatial calculations leverage MongoDB native `$nearSphere` queries on `2dsphere` indexed coordinates.

---

## 🔮 Limitations & Future Scope

While Kachra Bazar is a fully functioning production-grade prototype for Bhopal, several enhancements can be integrated into subsequent versions:
1. **Edge AI Waste Classification:** Integration of mobile TensorFlow Lite / Gemini Vision to automatically classify waste types and verify segregation purity from citizen photos.
2. **IoT Smart Bin Telemetry:** Integration of ultrasonic bin-fill level sensors using LoRaWAN / MQTT protocols for automated municipal bin overflow dispatching.
3. **SMS & USSD Fallback:** SMS gateway integration (e.g., Twilio / Gupshup) for non-smartphone users and sanitation workers without data connectivity.
4. **Multi-Lingual Localization:** Full Hindi localization (मानक हिंदी) alongside English to ensure accessibility across diverse civic demographics in Madhya Pradesh.
5. **Government Grievance Integration:** Bidirectional API synchronization with the national *Swachhata-MoHUA* app and CM Helpline (181).

---

## 📜 License & Academic Disclaimer
Developed as a Major Project for Bachelor of Technology (B.Tech) in Computer Science & Engineering at **SIRTE, Bhopal**. For academic presentation, demonstration, and research evaluation purposes.

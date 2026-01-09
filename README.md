# 🌊 FALSON – SimVerse Simulation

**Global Water Pollution Impact Simulator**

SimVerse is an interactive **3D Digital Twin** application designed to visualize and analyze the impact of human activity on global water resources. It combines geospatial data, algorithmic modeling, and AI-driven insights to help users understand water pollution dynamics.

## 🚀 Key Features

### 🌍 Interactive 3D Globe
*   **CesiumJS Integration**: High-fidelity 3D globe with infinite zoom.
*   **Smart Biome Detection**: Automatically identifies Urban, Rural, Desert, and Ocean environments based on latitude/longitude.
*   **Realistic Population**: Simulates population density (e.g., millions in major hubs vs. zero in oceans).

### 💧 Real-Time Simulation
*   **Water Pollution Index (WPI)**: Instantly calculates pollution levels (0.0 - 1.0 scale) based on:
    *   **Sewage Discharge**: Untreated vs. Treated waste.
    *   **Industrial Activity**: Chemical, Textile, or Heavy Industry density.
    *   **Population Pressure**: Impact of urbanization on water tables.
*   **Time Projection**: Visualize how 20 years of sustained pollution degrades water quality.

### 🤖 AI Mitigation Engine
*   **Smart Recommendations**: The system analyzes the *dominant* pollution cause and suggests specific solutions:
    *   *Sewage Problems* → "Construct Wetlands", "Retrofit STPs".
    *   *Industrial Problems* → "Zero Liquid Discharge (ZLD)", "Heavy Metal Precipitation".
    *   *Critical Zones* → "Immediate Evacuation", "Boil-Water Advisories".

### 🌐 Real-World Data Integration
*   **OpenStreetMap (OSM) Layer**: Toggle "Use Real Industrial Data" to query the **Overpass API** for actual industrial facilities and wastewater plants near selected locations.
*   **Hybrid Model**: Uses synthetic data for instant feedback + real API data for ground-truth verification.

### 📊 Professional Reporting
*   **One-Click PDF Reports**: Generates a comprehensive "Environmental Impact Report" including:
    *   Location Metadata & Classification.
    *   Static snapshots of Analysis Graphs (Bar, Line, Scatter).
    *   AI-generated Mitigation Plan.
    *   Project Summary Tables.

---

## 🛠️ Tech Stack

*   **Frontend**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Geospatial**: [CesiumJS](https://cesium.com/) / [Resium](https://resium.darwineducation.com/)
*   **Visualization**: [Plotly.js](https://plotly.com/javascript/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Styling**: Custom CSS Modules (Glassmorphism Design System)

---

## 🚦 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 👨‍💻 Developed By

**Team FALSON**
*   **Shubham Sharma** (marksrv047@gmail.com)
*   **Somnath Singh** (singhsomnath2006@gmail.com)
*   *Applied AI and Data Science | IIT Jodhpur*

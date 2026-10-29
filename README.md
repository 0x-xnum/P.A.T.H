# Project P.A.T.H.
## Polar Artemis Telemetry & Horizon-Planner

A client-side mission-planning interface for evaluating solar power generation potential and Direct-to-Earth (DTE) communication visibility across candidate landing sites in the lunar South Pole. Developed for the NASA International Space Apps Challenge.

---

## 1. Problem Statement

Landing operations at the lunar South Pole present unique operational constraints not encountered during equatorial missions:

* **Grazing Solar Angles:** Because the Moon's obliquity to the ecliptic is only approximately 1.54°, the Sun perpetually traces low trajectories along the horizon. Local topography (crater rims, ridges, and massifs) casts elongated shadows across low-lying terrain, creating severe thermal sinks (< 100 K) and terminating photovoltaic generation.
* **Direct-to-Earth Line-of-Sight:** Without an active polar orbital relay constellation, real-time telemetry and astronaut communications depend entirely on uninterrupted direct line-of-sight to NASA's Deep Space Network (DSN) ground stations on Earth. Lunar libration and local horizon masks intermittently occlude Earth visibility.

Existing mission analysis tools (such as broad-spectrum SPICE toolkits) require high computational overhead and steep learning curves. Project P.A.T.H. provides an accessible, high-performance web dashboard allowing engineers, mission planners, and educators to rapidly screen landing dates and candidate regions against these constraints.

---

## 2. Core Capabilities

* **Target Region Parameterization:** Ingests topographic coordinates for the 13 designated NASA Artemis III candidate landing regions, including Shackleton rim, Haworth, Faustini rim, and Malapert Mountain.
* **Horizon Elevation Engine:** Computes real-time topocentric elevation and azimuth coordinates for both the Sun and Earth relative to a local tangent plane at any selected lunar surface site.
* **Temporal Scrutiny Interface:** Enables users to sweep across arbitrary mission dates throughout 2026 and 2027 to observe orbital diurnal progressions.
* **Window Classification Logic:**
  * **Optimal Landing Window:** Concurrently meets thresholds for solar photovoltaic viability ($\theta_{\text{Sun}} > \theta_{\text{horizon}}$) and direct Earth link line-of-sight ($\theta_{\text{Earth}} > \theta_{\text{horizon}}$).
  * **Degraded Power Warning:** Earth link present, but solar incidence is sub-threshold or shadowed.
  * **Communication Blackout:** Local terrain blocks Earth view, requiring store-and-forward or halting critical operations.

---

## 3. Mathematical and Astrodynamics Formulation

Calculations are computed locally within the client execution environment using standard astrodynamic transformations:

### 3.1 Coordinate Transformations
Positions are transformed from the Moon Mean Earth/Polar Axis (ME) reference frame to a topocentric North-East-Up (NEU) local horizon coordinate frame centered at landing site coordinates $(\phi, \lambda)$:

$$\mathbf{r}_{\text{topo}} = \mathbf{R}_z(\lambda) \mathbf{R}_y(90^\circ - \phi) (\mathbf{r}_{\text{body}} - \mathbf{r}_{\text{site}})$$

### 3.2 Elevation and Azimuth Angles
The local elevation angle $\theta_{\text{elev}}$ and azimuth $\alpha_{\text{az}}$ are calculated via:

$$\sin(\theta_{\text{elev}}) = \frac{\mathbf{r}_{\text{topo}} \cdot \hat{\mathbf{u}}_z}{\|\mathbf{r}_{\text{topo}}\|}$$

$$\alpha_{\text{az}} = \text{atan2}\left(\mathbf{r}_{\text{topo}} \cdot \hat{\mathbf{u}}_y, \mathbf{r}_{\text{topo}} \cdot \hat{\mathbf{u}}_x\right)$$

Where $\hat{\mathbf{u}}_z$ corresponds to the local zenith vector normal to the reference lunar spheroid ($R_M = 1737.4\text{ km}$).

### 3.3 Solar Power Assessment
Photovoltaic efficiency for vertical surface arrays (characteristic of polar lander configurations) is derived from the incidence angle $\beta$:

$$P_{\text{rel}} = \max\left(0, \cos(\beta)\right) \cdot \Phi(\theta_{\text{Sun}} - \theta_{\text{mask}})$$

Where $\Phi$ represents the Heaviside step function evaluating whether the solar vector clears the local horizon mask $\theta_{\text{mask}}$.

---

## 4. System Architecture and Implementation

* **Runtime:** React 18 / TypeScript
* **Build System:** Vite
* **Styling & Layout:** Tailwind CSS
* **Rendering Pipeline:** HTML5 Canvas (2D topocentric polar projection radar)
* **Backend Requirements:** None. The calculation engine is written entirely in vanilla JavaScript/TypeScript with no remote server dependencies, eliminating API rate limits and token overhead.

---

## 5. Local Setup and Development

### Prerequisites
* Node.js version 18.0.0 or higher
* npm version 9.0.0 or higher

### Installation
```bash
git clone https://github.com/0x-xnum/P.A.T.H.git
cd P.A.T.H
npm install
```

### Running Locally
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 6. Project Roadmap

* [x] Formulation of topocentric horizon transformation algorithm.
* [x] Integration of Artemis III landing site coordinate database.
* [ ] Implementation of high-resolution LOLA horizon profile masks.
* [ ] Integration of Earth-Moon-Sun ephemeris lookup tables for 2026-2028.
* [ ] Multi-site comparative side-by-side analysis view.
* [ ] Export mission timeline metrics to CSV and JSON formats.

---

## 7. NASA Data Sources and References

1. **NASA Solar System Treks (Moon Trek):**  
   Web Map Tile Service (WMTS) specifications and polar projections.  
   https://trek.nasa.gov/moon/
2. **NASA Lunar Reconnaissance Orbiter (LRO):**  
   * Lunar Orbiter Laser Altimeter (LOLA) Digital Elevation Model (DEM) polar data products.  
   * Lunar Reconnaissance Orbiter Camera (LROC) South Pole high-resolution mosaics.  
   https://www.lroc.asu.edu/
3. **NASA Artemis III Candidate Landing Regions:**  
   Official announcements and coordinate criteria for lunar South Pole candidate landing zones.  
   * Primary Release: https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/  
   * Refined Candidate Regions: https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/
4. **JPL Horizons Ephemeris System:**  
   Benchmark planetary ephemeris tables (DE440/DE441) used for mathematical validation of lunar topocentric vectors.  
   https://ssd.jpl.nasa.gov/horizons/
5. **Standards and Reference Frames:**  
   IAU/IAG Working Group on Cartographic Coordinates and Rotational Elements (Lunar coordinate system definitions).

---

## 8. License

This repository is licensed under the [MIT License](LICENSE).

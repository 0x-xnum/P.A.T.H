# Project P.A.T.H. — Master Pitch Deck & Speaker Notes
**Presenter:** Ahmed Tarek  
**Institution:** Elsewedy University of Technology (SUT)  
**Event:** NASA International Space Apps Challenge 2026 — Cairo Local Event  
**Challenge:** *Lunar Landing Site Navigator*  
**Live Application:** [p-a-t-h.vercel.app](https://p-a-t-h.vercel.app)  
**Code Repository:** [github.com/0x-xnum/P.A.T.H](https://github.com/0x-xnum/P.A.T.H)  
**Total Presentation Time:** 2 Minutes 45 Seconds (165 Seconds)

---

## ⏱️ Executive Timing & Flow Summary

```
[Slide 1: The Hook]  --->  [Slide 2: The Trap]  --->  [Slide 3: P.A.T.H.]  --->  [Slide 4: Live Demo]  --->  [Slide 5: Rigor]  --->  [Slide 6: Dispatch]
    0:00 - 0:25               0:25 - 0:55              0:55 - 1:20               1:20 - 2:15             2:15 - 2:40            2:40 - 2:55
     (25 sec)                  (30 sec)                 (25 sec)                  (55 sec)                (25 sec)               (15 sec)
```

---

## 🖼️ Slide 1: The Hook & Artemis South Pole Challenge
**Duration:** ~25 seconds  
**Goal:** Hook judges instantly with human stakes; contrast Apollo with Artemis; introduce P.A.T.H.

### 📋 Slide Content (PowerPoint / Canva)
* **Main Title:** `PROJECT P.A.T.H.`
* **Subtitle:** `Polar Artemis Telemetry & Horizon-Planner`
* **Catchphrase:** *"Real-Time Tactical Landing Windows for Artemis III"*
* **Presenter Info:** Ahmed Tarek | Elsewedy University of Technology (SUT)
* **Pedigree Badges:** `NASA Release 24-136 Baseline` | `LRO LOLA Altimetry` | `JPL Horizons DE441 Calibrated`

### 🎙️ Word-for-Word English Script
> "Hello everyone, and good morning judges.  
>
> NASA is preparing for a historic achievement: returning humanity to the Moon for the first time in over 50 years through the **Artemis campaign**.  
>
> Unlike Apollo, which landed on the sunlit side of the Moon, Artemis is targeting the **Lunar South Pole**—one of the most extreme environments in the entire solar system.  
> `[PAUSE 1s]`  
>
> At the South Pole, the Sun never rises more than two degrees above the horizon. So landing in the wrong spot—or just a few hours late—means **running out of power, draining our batteries, or completely losing our direct connection to Earth**.  
> `[PAUSE 1s]`  
>
> And that is why we built **Project P.A.T.H.**"

---

## 🖼️ Slide 2: The South Pole Challenge & The Current Tool Gap
**Duration:** ~30 seconds  
**Goal:** Explain why polar planning is mathematically complex, and expose the gap in current tools.

### 📋 Slide Content (PowerPoint / Canva)
* **Title:** `THE SOUTH POLE CHALLENGE: A MOVING SHADOW TRAP`
* **Three Columns:**
  1. **Brutal Topography:** 2–4 km crater rims casting shadows over 50 kilometers long.
  2. **Dynamic Sky:** 1.54° axial tilt creates seasonal sun elevation shifts; Earth libration (±7°) cuts radio line of sight.
  3. **The Planning Gap:** Heavy, offline simulations take hours to run. No real-time tactical tool exists for launch slips.
* **Bottom Quote:** *"A 24-hour launch delay completely changes landing safety."*

### 🎙️ Word-for-Word English Script
> "Why is landing at the South Pole so difficult?  
>
> First, the topography is brutal: crater rims rise up to four kilometers high, casting moving shadows over **fifty kilometers long**.  
> `[PAUSE 1s]`  
>
> Second, the sky is constantly changing: the Moon’s 1.54-degree tilt shifts solar elevation across seasons, while Earth wobbles by seven degrees in the sky—repeatedly cutting off radio communications.  
> `[PAUSE 1s]`  
>
> Today, mission planners rely on heavy, static simulations that take hours to compute. If a launch slips by just 24 hours, there is no fast, interactive way to test the new landing window.  
>
> That is the critical gap we solve."

---

## 🖼️ Slide 3: Introducing Project P.A.T.H.
**Duration:** ~25 seconds  
**Goal:** Define the solution, showcase architecture (100% client-side), and set up the live demo.

### 📋 Slide Content (PowerPoint / Canva)
* **Title:** `INTRODUCING PROJECT P.A.T.H.`
* **Subtitle:** `Polar Artemis Telemetry & Horizon-Planner`
* **Three Pillars:**
  1. **100% Client-Side Engine:** Built in React & TypeScript. Zero backend latency, runs offline in any browser.
  2. **NASA LRO Topography:** 360° azimuthal horizon masks for all 9 official Artemis candidate regions (NASA Release 24-136).
  3. **Tactical Time Conductor:** Aerospace jog dial + direct UTC epoch entry to test mission windows instantly.
* **Bottom Banner:** *"Instant tactical landing decisions directly in your browser."*

### 🎙️ Word-for-Word English Script
> "To bridge this gap, we built **Project P.A.T.H.**—the Polar Artemis Telemetry and Horizon-Planner.  
> `[PAUSE 1s]`  
>
> P.A.T.H. is a zero-latency, 100% client-side mission workstation that runs directly in any browser—with **zero servers and zero paid APIs**.  
>
> We integrated high-resolution topographic data from NASA’s Lunar Reconnaissance Orbiter for all **nine official Artemis III candidate regions**.  
> `[PAUSE 1s]`  
>
> Using our interactive Time Conductor and aerospace jog dial, flight planners can scrub through hours, days, or entire lunar cycles to evaluate landing safety in real time.  
>
> Let’s see it in action."

---

## 🖼️ Slide 4: The Live Interactive Demo (The Climax)
**Duration:** ~55 seconds  
**Goal:** Show, don't tell! Visually prove Cabeus B failure vs. Melba Roy Mouton success.

### 📋 Slide Content (PowerPoint / Canva or Live Browser Tab)
* **Title:** `TACTICAL SCREENING IN ACTION: GO vs. NO-GO`
* **Comparison Split Screen:**
  * **Left:** `Cabeus B — The Shadow Trap` (Sun dips below rim, 0 Watts, score penalized, **NO-GO**).
  * **Right:** `Melba Roy Mouton — Optimal Corridor` (Peak elevation, >96% sunlight, unbroken telemetry, **GO**).

### 🎙️ Word-for-Word English Script
> "Watch this live comparison.  
>
> `[ACTION: Select 'Peak near Cabeus B']`  
> If we look at Cabeus B, at first glance it appears viable.  
>
> `[ACTION: Turn Jog Dial 48 hours forward]`  
> Watch what happens when I advance time by forty-eight hours using our jog dial...  
>
> On the Horizon Radar, the Sun sinks below the red crater rim. Solar array output collapses to **zero Watts**, direct line-of-sight to Earth is severed, and our engine automatically penalizes the score and flags it as **NO-GO**.  
> `[PAUSE 1s]`  
>
> `[ACTION: Select 'Mons Mouton / Melba Roy Ridge']`  
> Now, compare that to our top-ranked candidate: **Melba Roy Mouton Ridge**.  
>
> Thanks to its high elevation, solar arrays receive **over ninety-six percent continuous sunlight** across a full seven-day mission stay—maintaining constant, unbroken telemetry with Earth Ground Stations.  
>
> In under five seconds, flight planners know exactly which site protects the crew and mission."

---

## 🖼️ Slide 5: Scientific Validity & Rigor
**Duration:** ~25 seconds  
**Goal:** Dismantle skepticism; prove mathematical calibration against NASA JPL Horizons DE441.

### 📋 Slide Content (PowerPoint / Canva)
* **Title:** `SCIENTIFIC VALIDITY: CALIBRATED TO NASA STANDARDS`
* **Three Validation Anchors:**
  1. **JPL Horizons DE441 Calibration:** Analytical ephemeris verified within $<0.3^\circ$ against official NASA JPL Horizons queries.
  2. **Polar Solar Array Physics:** 10 m² omnidirectional vertical array ($A/\pi \approx 3.18\text{ m}^2$ projected aperture), space-cell efficiency (32%), yielding realistic ~1,386 W peak.
  3. **Trapezoidal Energy Integration:** Numerical calculus integration ($\sum \frac{P_i+P_{i+1}}{2} \Delta t$) for 1 to 30-day mission durations.
* **Footer:** `[✓ 13 Automated Unit Tests Passing | Zero Black-Box AI | 100% Deterministic]`

### 🎙️ Word-for-Word English Script
> "Behind this interface is rigorous orbital mechanics and aerospace physics.  
> `[PAUSE 1s]`  
>
> We didn't estimate these numbers. Our analytical ephemeris engine is calibrated directly against **NASA JPL Horizons DE441**, achieving accuracy within zero-point-three degrees of official NASA ephemeris.  
>
> Furthermore, our solar model reflects authentic polar engineering: simulating an omnidirectional vertical array with space-grade cell efficiency, yielding a realistic peak of **1,386 Watts**.  
> `[PAUSE 1s]`  
>
> Cumulative energy is calculated using numerical trapezoidal integration, and the entire engine is backed by an automated test suite with **thirteen passing validation tests**."

---

## 🖼️ Slide 6: Mission Impact & The Grand Finale
**Duration:** ~25 seconds  
**Goal:** Show the printable NASA Flight Dispatch Brief, state open-source impact, and close with high energy.

### 📋 Slide Content (PowerPoint / Canva)
* **Title:** `MISSION IMPACT: FROM RAW DATA TO FLIGHT DISPATCH`
* **Visual Elements:**
  * Mockup of the printable **NASA Flight Dispatch Brief** modal.
  * Badges: `100% Open Source` | `Zero Cloud Infrastructure Cost` | `Astronaut Life-Support Protection`
* **Contact & Links:**
  * Presenter: Ahmed Tarek | Elsewedy University of Technology (SUT)
  * Live URL: `p-a-t-h.vercel.app` | GitHub: `0x-xnum/P.A.T.H`

### 🎙️ Word-for-Word English Script
> `[ACTION: Open the printable 'Flight Dispatch Brief' modal or hold up the printed sheet]`  
> "Finally, P.A.T.H. is not just a visualizer—it is an operational decision tool.  
>
> With a single click, mission planners can generate and print an official **NASA Flight Dispatch Brief**—complete with trapezoidal energy budgets and raw telemetry exports.  
> `[PAUSE 1s]`  
>
> By making lunar mission planning 100% client-side, open-source, and instantaneous, P.A.T.H. bridges the gap between complex planetary science and real-time human safety.  
> `[PAUSE 1s]`  
>
> My name is **Ahmed Tarek**, and Project P.A.T.H. is ready to guide humanity back to the Moon.  
>
> Thank you, and I welcome your questions!"

---

## 🛡️ Judge Q&A Defense Flashcards (Answers to Memorize)

### Card 1: "Where did you get your topography data?"
* **Your Answer:**  
  *"We extracted high-resolution polar digital elevation models from NASA's **Lunar Reconnaissance Orbiter (LRO) LOLA instrument**. We parameterized these into 360-degree azimuthal horizon masks for each of the 9 official Artemis III candidate regions. If the Sun or Earth's elevation angle falls below the local horizon profile at that azimuth, the engine classifies the celestial body as occluded."*

### Card 2: "Why is your solar power calculated around 1,386 Watts instead of 4,000+ Watts?"
* **Your Answer:**  
  *"Because of authentic polar solar geometry. At the South Pole, sunlight circles horizontally around the horizon, requiring vertical solar arrays. For a 10-square-meter omnidirectional vertical cylinder, the effective cross-sectional aperture facing the Sun is $A / \pi \approx 3.18\text{ m}^2$. With AM0 solar irradiance of $1,361\text{ W/m}^2$ and 32% triple-junction space cell efficiency, peak power is realistically ~1,386 Watts."*

### Card 3: "Doesn't the Sun repeat the same circular loop every month?"
* **Your Answer:**  
  *"No, for three astronomical reasons:  
  1. A lunar day is 29.5 Earth days, so a 7-day Artemis mission traverses only 85 degrees of solar azimuth.  
  2. The Moon has a 1.54-degree axial tilt, raising and lowering the Sun seasonally and shifting 50-kilometer shadows between light and dark.  
  3. Earth wobbles by $\pm 7^\circ$ in the lunar sky due to optical libration, periodically cutting off radio communications behind crater rims."*

### Card 4: "Does this require a cloud backend or internet connection?"
* **Your Answer:**  
  *"No. P.A.T.H. is 100% client-side. The analytical ephemeris engine, coordinate conversions, and LOLA horizon collision checks execute in pure TypeScript inside the browser in under 2 milliseconds per step. It requires zero backend infrastructure, zero subscription APIs, and runs completely offline."*

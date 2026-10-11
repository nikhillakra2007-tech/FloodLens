# FloodLens

**Differential Urban Hydrological Intelligence for Catchment-Scale Failure Diagnosis**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791.svg?style=flat&logo=postgresql)](https://postgis.net)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20Bedrock%20%7C%20AppRunner-FF9900.svg?style=flat&logo=amazon-aws)](https://aws.amazon.com)
[![Tests](https://img.shields.io/badge/Tests-97%20Pytest%20%7C%2071%20Vitest-success.svg?style=flat)](https://github.com/nikhillakra2007-tech/FloodLens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> *"Why did your street flood when the next ward didn't?"*

Conventional flood maps show static water depths after disaster strikes. **FloodLens** diagnoses the underlying physical failure mechanism by pairing inundated catchments with resilient twin wards across elevation gradients, stormwater drain conduits, and impervious surface fractions.

---

## 📌 GitHub Repository Metadata

**Short Description (About Section):**
```text
Causal hydrological intelligence platform diagnosing urban flood failure mechanisms across differential twin catchments (Greater Chennai Corporation).
```

**Topics:**
`hydrology` `flood-risk` `causal-dag` `urban-resilience` `postgis` `fastapi` `nextjs` `aws-bedrock` `chennai`

---

## 🏛️ System Architecture

FloodLens operates as a decoupled hydrological pipeline combining geospatial telemetry, deterministic causal DAG synthesis, and bounded counterfactual simulations.

```mermaid
flowchart TD
    subgraph DataSources["1. Multi-Spectral Telemetry & GIS Ingestion"]
        A1["IMD Radar & Station Precip\n(2015, 2021, 2023 Michaung)"]
        A2["GCC Stormwater Network (SWD)\n(Conduits, Outfalls, Sump Nodes)"]
        A3["Copernicus DEM GLO-30\n(Elevation & HAND Micro-Slopes)"]
        A4["ESA WorldCover 10m\n(Impervious Built-Up Classification)"]
    end

    subgraph AWSCloud["2. AWS Ingestion & Spatial Core"]
        B1["AWS S3 Bucket\n(Raw Telemetry & GeoTIFFs)"]
        B2["RDS PostgreSQL + PostGIS\n(Spatial Indices, ST_DWithin, Intersections)"]
        B3["FastAPI Diagnostic Engine\n(Topographic Similarity & Twin Selection)"]
    end

    subgraph CausalEngine["3. Causal Inference & Defensibility Engine"]
        C1["5-Step Audit Pipeline\n(Deterministic Confound Removal)"]
        C2["Empirical Recurrence Verification\n(Multi-Event Recurrence Test)"]
        C3["Defensibility Gate Check\n(FACT · SUPPORTED · HYPOTHESIS)"]
        C4["Amazon Bedrock (Claude 3.5 Sonnet)\n(Executive Synthesis & Provable Defensibility)"]
    end

    subgraph WebExperience["4. Executive Frontend (Next.js 14)"]
        D1["Interactive Leaflet Basemap\n(GCC Ward Grid & Inundation Points)"]
        D2["Causal Mechanism DAG\n(Hierarchical HD Flow & Node Tracer)"]
        D3["Bounded Counterfactual Lab\n(Rational Peak Runoff Delta Proxy)"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> C2 --> C3
    C3 --> C4
    C3 --> D1
    C4 --> D2
    C1 --> D3
```

---

## 📸 Product Walkthrough

### 1. Editorial Geospatial Landing Page
A clean editorial interface establishing the differential causal thesis, eliminating generic flood depth heatmaps in favor of twin catchment comparisons.

![Editorial Landing Page](docs/images/01_landing_hero.png)

---

### 2. Deterministic 5-Step Diagnostic Setup
Users choose a flooded catchment and receive automatically calibrated benchmark twin wards with identical storm precipitation forcing, eliminating the rainfall confounder.

![5-Step Investigation Wizard](docs/images/02_investigation_wizard.png)

---

### 3. Defensibility & Audit Assessment
Every finding passes strict legal and scientific defensibility gates. Satellite proxy limitations and historical survey temporal gaps are transparently flagged.

![Defensibility Audit Assessment](docs/images/03_defensibility_verdict.png)

---

### 4. Causal Mechanism Ranking & Interactive Inspector
Identifies and ranks the verified non-zero physical drivers: Runoff Concentration, Conduit Surcharging, Outfall Backwater Stagnation, or Topographic Depression.

![Causal Mechanism Ranking](docs/images/04_causal_mechanisms_dag.png)

---

### 5. High-Definition Causal DAG (Zero-Overlap Flow)
A full-screen modal with deep backdrop blur displaying the entire physical propagation chain from rainfall forcing to flood observation with complete spatial clarity.

![High-Definition Causal DAG](docs/images/06_full_visual_graph_modal.png)

---

### 6. Bounded Counterfactual Simulation Lab
Simulates municipal engineering interventions (increasing effective conduit capacity, reducing upstream imperviousness) to estimate relative peak discharge reduction.

![Counterfactual Simulation Lab](docs/images/05_counterfactual_simulation.png)

---

## ⚡ Causal Methodology: The Twin Catchment Thesis

```mermaid
graph LR
    subgraph LocationA["Inundated Catchment (Location A)"]
        R1["Storm Rainfall (390mm)"] --> S1["Micro-Depression Sink (-1.4m)"]
        S1 --> B1["Conduit Silt Bottleneck"]
        B1 --> F1["Severe Inundation (1.2m)"]
    end

    subgraph LocationB["Resilient Twin (Location B)"]
        R2["Storm Rainfall (390mm)"] --> S2["Continuous Natural Fall (+2.1m)"]
        S2 --> B2["Unobstructed Outfall"]
        B2 --> F2["No Surface Ponding (<0.05m)"]
    end

    R1 -.->|"Rainfall Confound Eliminated (±2%)"| R2
```

1. **Confound Elimination**: If two wards receive statistically identical precipitation (e.g. 390mm during Cyclone Michaung), rainfall volume cannot be the root cause of differential flooding.
2. **Topographic Alignment**: Matches wards on digital elevation models (Copernicus DEM GLO-30), HAND index, and slope aspect.
3. **Physical Isolation**: Isolates conduit capacity bottlenecks, outfall backwater curves, and impervious built-up ratios.
4. **Defensibility Classification**:
   - **FACT**: Empirically measured gauge precipitation, verified field inundation marks.
   - **SUPPORTED**: Topographic flow accumulation, 10m ESA satellite land-cover proxies.
   - **HYPOTHESIS**: Unmetered conduit sedimentation, tidal backwater head loss.

---

## ☁️ AWS Cloud Infrastructure

FloodLens uses an infrastructure-as-code CloudFormation stack (`infra/floodlens-stack.yaml`):

| AWS Service | Architecture Role |
| :--- | :--- |
| **Amazon S3** | Versioned data lake for IMD rainfall records, GCC stormwater shapefiles, and DEM rasters. |
| **Amazon Bedrock** | Claude 3.5 Sonnet for automated municipal audit report and evidence synthesis. |
| **AWS App Runner** | Managed containerized FastAPI backend deployment with automatic scaling. |
| **Amazon RDS (PostGIS)** | Spatial database executing geometry queries (`ST_DWithin`, `ST_Intersects`). |
| **AWS CloudWatch** | Structured logging, latency metrics, and API health monitoring. |

---

## 🧪 Verification & Test Suite

The repository maintains an automated, regression-free test suite:

- **Backend (Pytest)**: `97 passed`
  - Unit tests for rational runoff proxies, HAND elevation calculations, and defensibility gates.
  - Contract & multi-event recurrence tests (2015, 2021, and 2023 Cyclone Michaung data).
- **Frontend (Vitest)**: `71 passed`
  - React Testing Library coverage for Causal DAG, Flood Map, and Counterfactual forms.
  - TypeScript strict typecheck: `tsc --noEmit` passed with 0 errors.

---

## 🚀 Quickstart

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ with PostGIS extension (or Docker)

### 1. Database Setup
```bash
docker compose up -d db
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python ../scripts/seed_demo.py
python -m uvicorn app.main:app --port 8000
```
*API Swagger documentation available at: `http://localhost:8000/docs`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web application available at: `http://localhost:3000`*

### 4. Running Test Suites
```bash
# Run backend test suite
cd backend && pytest -q

# Run frontend test suite
cd frontend && npm run test:run
```

---

## 📜 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

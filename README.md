# FloodLens

**Differential Urban Hydrological Intelligence for Defensible Flood Attribution**

🔗 **[floodlens-app.vercel.app](https://floodlens-app.vercel.app)** · ⚡ **[Live Auth Gateway & Instant Demo](https://floodlens-app.vercel.app/auth)** · [![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) · [![Tests](https://img.shields.io/badge/Tests-203%20Passed-emerald.svg)](https://github.com/nikhillakra2007-tech/FloodLens) · [![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python&logoColor=white)](https://python.org) · [![Next.js](https://img.shields.io/badge/Next.js-14-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org) · [![AWS Serverless](https://img.shields.io/badge/AWS-Lambda%20%7C%20Bedrock%20%7C%20S3-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com)

> *"Why did your street flood when the next ward didn't?"*

Conventional flood maps show static water depths after disaster strikes, treating flooding as an inevitable natural consequence. **FloodLens** is a differential urban hydrological intelligence system that diagnoses the physical root cause of flooding. By pairing inundated catchments with resilient twin wards across elevation gradients, stormwater drain (SWD) conduits, and impervious surface fractions, FloodLens isolates structural drainage choke points from extreme cloudburst forcing.

---

## 🌐 Live Deployments & Key Application Routes

| Environment / Route | Direct Production URL | Functional Description |
| :--- | :--- | :--- |
| **Production Web App** | [https://floodlens-app.vercel.app](https://floodlens-app.vercel.app) | Complete Next.js 14 hydrological diagnosis platform (Main Branch) |
| **Preview Deployment** | [https://frontend-ecs788bip-nikhillakra2007-9371s-projects.vercel.app](https://frontend-ecs788bip-nikhillakra2007-9371s-projects.vercel.app) | Isolated Vercel Preview for `fix/technical-access-ui-ux` |
| **Authentication Gateway** | [https://floodlens-app.vercel.app/auth](https://floodlens-app.vercel.app/auth) | Google OAuth, Indian Phone (+91) OTP, and Instant Demo Access |
| **Feature Hub (Authenticated)** | [https://floodlens-app.vercel.app/hub](https://floodlens-app.vercel.app/hub) | Role-tailored resident portal and engineering workspace catalog |
| **Diagnostic Catchment Console** | [https://floodlens-app.vercel.app/investigations/new](https://floodlens-app.vercel.app/investigations/new) | Interactive catchment selection matrix & pipeline trigger (Verified Original Technical Destination) |
| **Profile & Role Settings** | [https://floodlens-app.vercel.app/settings](https://floodlens-app.vercel.app/settings) | Enforced read-only authorization role, Indian contact mobile validation, monitored ward, and notification settings |
| **Differential Twin Simulator** | [https://floodlens-app.vercel.app/simulator](https://floodlens-app.vercel.app/simulator) | Calibrated comparative urban twin scenario workbench |
| **Causal DAG & Flowchart** | [https://floodlens-app.vercel.app/flowchart](https://floodlens-app.vercel.app/flowchart) | Interactive physical propagation network with real-time sliders |
| **Subsurface Conduit Anatomy** | [https://floodlens-app.vercel.app/infrastructure](https://floodlens-app.vercel.app/infrastructure) | 3D subterranean cross-section & sediment obstruction viewer |

### 🌊 Master Repair & Feature Implementations
1. **Verified Technical Destination Restored**: Traced Git history confirming the original "Run Ward Diagnosis" destination is `/investigations/new`. The landing page CTA now cleanly routes to `/auth`, where **Enter Technical Demo** directly loads the original technical console with zero redirect loops.
2. **Scroll-Aware Features Section Navigation**: The Features section navigation bar on the landing page renders at the top in its resting state, hides smoothly on scroll-down (>8px hysteresis threshold), and reveals cleanly on scroll-up without covering page headers or layout jumps.
3. **Strict Role Separation (Citizen vs. Technical)**: Interactive cross-mode switching has been eliminated from settings, dropdown menus, and client requests. Role status is displayed as an informational read-only badge. Demo accounts are persona-locked; unauthorized route access redirects with context.
4. **Profile & Role Settings Lifecycle**: Fully integrated `/settings` and `/onboarding` with loading states, double-submission protection, Indian phone (+91) regex validation, monitored Chennai catchment selection, and honest local/remote persistence feedback.
5. **Polished 5-Stage Hydrological Vector Diagram**: Replaced rough left-side auth visuals with a peer-review-grade SVG illustrating: *1. Rainfall Forcing (390mm Michaung) → 2. Catchment Runoff (Q=CIA) → 3. Drainage Network (SWD Culvert) → 4. Hydraulic Bottleneck (+1.03m dy/dx Backwater) → 5. Flood Risk Output (Ponding)* with an integrated scientific legend.
6. **Zero Horizontal Overflow at 100% Zoom**: Refined flexbox child constraints (`min-w-0 flex-1`, text wrapping, responsive tabs `min-w-[115px] sm:min-w-0`, overflow-safe user menus `max-w-[calc(100vw-2rem)]`) across 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px viewports.
7. **Map Overlap & Elevation Fixes**: Dedicated telemetry status bars beneath satellite cards, responsive bounding on hero badges (`max-w-[85%]`), and responsive mobile-collapsed map legend to prevent marker or control collisions.

### ⚡ Public Landing Page to Technical Access Journey
1. **Public Landing Page (`/`)**: Clean, public-facing interface with prominent **Sign In** action directing visitors to `/auth` without exposing personal credentials, user names, or avatars.
2. **Authentication Gateway (`/auth`)**: Compact scientific entry gateway with a custom hydrological visual and zero blocking provider warnings for demo access.
3. **Technical Access / Instant Demo**: One click on **Enter Technical Demo** logs in as Dr. K. Senthil Nathan (Technical Mode) and routes directly into the original technical website: the **Diagnostic Catchment Console (`/investigations/new`)**, triggering the 5-stage causal inference pipeline and the 5-Tab Investigation Lab.
4. **Citizen Demo**: Resident observer persona (Priya Ramanathan) routing to the localized community risk portal.

---

## 👥 Dual Experience Architecture: Technical Mode vs. Citizen Mode

FloodLens serves two critical stakeholders with tailored interfaces while maintaining a single, unified analytical truth:

```mermaid
flowchart TD
    User["Authenticated User Session"] --> ModeSwitch{"Experience Mode"}
    
    ModeSwitch -->|"Citizen Mode (Residents & Public)"| Cit["Citizen Experience\n• Plain-Language Diagnosis\n• Ward Status & Risk Advisory\n• Household Safety Precautions\n• GCC Emergency Helpline (1913)\n• Non-Intimidating Community Map"]
    
    ModeSwitch -->|"Technical Mode (Engineers & Planners)"| Tech["Technical Engineering Workspace\n• Full Hydro-Mechanics Formulary\n• Manning Surcharge Calculations\n• Rational Peak Runoff (Q = CIA)\n• Gradually Varied Flow (GVF dy/dx)\n• 5-Tab Comprehensive Investigation Lab\n• Bounded Counterfactual Simulator"]
    
    Cit -.->|"Strict Role Separation Enforced (Cross-Mode Switching Disabled)"| Tech
```

### A. Technical Mode (Hydrological Engineering Workspace)
Engineered for municipal civil engineers, disaster response coordinators, urban planners, and hackathon evaluators who require defensible physical evidence:
- **Mathematical Formulary Strip**: Exposes exact hydrodynamic calculations ($Q_{peak} = C \cdot I \cdot A$, Manning's gravity capacity, backwater differential grade line).
- **5-Tab Comprehensive Investigation Lab**:
  1. *Simulation Lab*: Bounded counterfactual parameter sliders (desilting percentage, conduit diameter enlargement, impervious reduction).
  2. *Causal DAG & Ranking*: Directed acyclic graph isolating causal weights from meteorological noise.
  3. *Geospatial Basemap*: Monitored catchment polygons, inundation hotspots, and SWD grid layers.
  4. *Evidence Registry*: Diagrammatic audit trail categorizing `FACT` (sensor/DEM observations), `SUPPORTED` (calibrated models), and `CAUSAL HYPOTHESIS` (counterfactual derivations).
  5. *Defensibility Audit*: Historical validation against prior Chennai cyclonic events (2015, 2021, 2023) and regulatory gate checks.

### B. Citizen Mode (Calm, Actionable Resident Portal)
Engineered for Chennai residents, ward council members, and community observers who need immediate clarity without intimidating equations:
- **Plain-Language Causality**: Clear explanations of why water accumulated (e.g. *"Stormwater backed up from downstream canals into the local bowl-like elevation depression; neighbor ward stayed dry due to steeper natural slope"*).
- **Localized Ward Risk Status**: Specific to their ward (Velachery Ward 178, Anna Nagar Ward 102, T. Nagar Ward 104, Adyar Ward 103).
- **Immediate Resident Actions**: Actionable guidelines (elevate ground-floor appliances >30cm, avoid low-lying canal underpasses, park on designated elevated ramps).
- **Verified Civil Emergency Helplines**: GCC Disaster Management `1913`, TNEB Power Outage & Emergency `94987 94987`, Police/Disaster `112`.
- **On-Demand Engineering Unlock**: A single button allows residents to view underlying equations and technical simulations whenever desired.

---

## 🎨 UI/UX Redesign & Responsive Architecture

The platform underwent a comprehensive redesign to eliminate generic SaaS aesthetics and deliver a peer-review-grade geospatial intelligence workspace:
1. **Restrained Technical Typography**: Inter font pairing for razor-sharp headings and narrative readability; JetBrains Mono for coordinates, hydraulic parameters, and numerical telemetry.
2. **Elimination of Map Overlap Defects**: Moved floating telemetry chips into dedicated, responsive status rows beneath map/satellite visual cards, preventing content collisions across all screen widths.
3. **Analytical Surface Treatments**: Introduced directional elevation shadows (`0 4px 20px -2px rgba(45,35,26,0.06)`), distinct failure vs. resilience indicator rails, and tinted data modules.
4. **Mobile Responsiveness (320px – 1440px+)**:
   - Zero unintended document horizontal scrolling.
   - Contained horizontal panning for wide technical diagrams (`min-w-[1200px]`).
   - Accessible navigation slide drawer with body scroll locking and backdrop blur.
   - Mobile-optimized inputs (`text-base sm:text-sm`) preventing iOS auto-zoom on focus.

---

## 📑 Table of Contents

- [Live Deployments & Key Application Routes](#-live-deployments--key-application-routes)
- [Dual Experience Architecture: Technical Mode vs. Citizen Mode](#-dual-experience-architecture-technical-mode-vs-citizen-mode)
- [UI/UX Redesign & Responsive Architecture](#-uiux-redesign--responsive-architecture)
- [Visual Platform Tour](#-visual-platform-tour)
- [How It Works: The Twin Catchment Thesis](#-how-it-works-the-twin-catchment-thesis)
- [System Architecture](#️-system-architecture)
- [AWS Cloud Infrastructure & Services](#-aws-cloud-infrastructure--services)
- [Hydrological Science & Causal Inference](#-hydrological-science--causal-inference)
- [Repository Organization](#-repository-organization)
- [Test Suite & Verification](#-test-suite--verification)
- [Local Development Quickstart](#-local-development-quickstart)
- [Automated Cloud Deployment](#-automated-cloud-deployment)
- [Environment Configuration](#-environment-configuration)
- [License & Scientific Data Sources](#-license--scientific-data-sources)

---

## 📸 Visual Platform Tour

### 1. Chennai Catchment Topography & Differential Intelligence Hero
An editorial diagnostic interface pairing adjacent urban basins across Greater Chennai Corporation (GCC) to isolate structural drainage choke points from extreme cloudburst forcing.

![Editorial Landing Page & Catchment Topography](docs/images/01_landing_hero.png)

---

### 2. Physical Infrastructure Cross-Section (Flooding Block vs. Resilient Twin)
Interactive 3D cross-section demonstrating the subterranean mechanism: identical precipitation causes Block A to flood via conduit silt buildup and catch basin backwater, while Block B discharges smoothly through unobstructed invert slope.

![Physical Infrastructure Cross-Section](docs/images/02_infrastructure_cross_section.png)

---

### 3. Chennai Catchment Causal Flowchart & Real-Time Parameter Simulation
Interactive Directed Acyclic Graph (DAG) with real-time hydraulic parameter controls (Rainfall depth, Conduit silt %, Pipe invert slope, Canal tide stage MSL, and Impervious cover) computing runoff intake, discharge capacity, and backwater head in real time.

![Causal Flowchart & Hydraulic Controls](docs/images/03_causal_flowchart.png)

---

### 4. High-Definition Causal DAG Interaction Graph
Complete physical propagation chain from meteorological precipitation forcing to street inundation. Clean hierarchical topology with unclustered node pills, directed momentum vectors, and strict evidence confidence tags (`FACT` · `SUPPORTED` · `CAUSAL HYPOTHESIS`).

![High-Definition Causal DAG Interaction Graph](docs/images/04_causal_mechanisms_dag.png)

---

## 🌊 How It Works: The Twin Catchment Thesis

To prove whether street flooding was caused by severe weather or infrastructural failure, FloodLens matches each flooded ward against an unflooded control ward with equivalent meteorological forcing:

```mermaid
flowchart LR
    A["⛈️ Extreme Rainfall Event\n(e.g., Cyclone Michaung 420mm)"] --> B["Ward A (Flooded Catchment)\n84% Impervious · 55% Silt Choke"]
    A --> C["Ward B (Resilient Twin Control)\n65% Impervious · Functional Outfall"]
    
    B --> D["Underground Conduit Surcharge\nBackwater Pressure (+1.03m Head)"]
    C --> E["Unobstructed Gravity Outfall\nSmooth Canal Discharge (1.5% Slope)"]
    
    D --> F["💥 Local Inundation (75cm)\nAttribution: Infrastructure Failure"]
    E --> G["✅ Dry Streets (0cm)\nProof: Rain Alone Was Not The Cause"]
```

When two adjacent catchments receive the exact same 400mm+ precipitation pulse during a cyclonic event, yet one experiences severe standing inundation while the other stays dry, **meteorology cannot be the primary explanatory variable**. FloodLens quantifies the exact physical discrepancy across:
- **Slope & Topography**: Elevation delta and natural basin fall.
- **Hydraulic Conduit Capacity**: Manning's flow capacity minus silt and debris accumulation.
- **Surface Imperviousness**: Runoff coefficient scaling due to urbanization.
- **Tailwater Choke Points**: High-tide canal backwater and blocked outfalls.

---

## 🏛️ System Architecture

FloodLens combines multi-source geospatial GIS ingestion, deterministic hydrological modeling, and a cloud-native serverless architecture:

```mermaid
flowchart TD
    subgraph Ingestion["1. Multi-Source Ingestion & Spatial Indices"]
        I1["IMD Radar & Rain Gauge Network"]
        I2["GCC Stormwater Conduits & Outfalls"]
        I3["Copernicus DEM GLO-30 Elevation Grid"]
        I4["ESA WorldCover 10m Impervious Class"]
    end

    subgraph AWS_Cloud["2. AWS Cloud Infrastructure"]
        S1["Amazon S3\n(GeoTIFFs, Manifests, Datasets)"]
        S2["Amazon ECR\n(FastAPI Docker Container)"]
        S3["AWS Lambda + Web Adapter (LWA)\n(2048MB Serverless Microservice)"]
        S4["AWS Lambda Function URL\n(Public HTTPS, Low Latency, CORS)"]
        S5["Amazon Bedrock\n(Claude 3.5 Sonnet Causal Synthesis)"]
        S6["Amazon CloudWatch\n(Execution Logs & Telemetry)"]
    end

    subgraph Engine["3. Hydrological Inference & Audit Core"]
        E1["Twin Catchment Selection Engine"]
        E2["Manning & Rational Hydraulic Calculator"]
        E3["Gradually Varied Flow Backwater Model"]
        E4["Defensibility Gate Check (FACT · SUPPORTED · HYPOTHESIS)"]
    end

    subgraph Frontend["4. Presentation Layer (Next.js 14)"]
        F1["Interactive GCC Basemap & Geospatial Hotspots"]
        F2["Subterranean Infrastructure 3D Cross-Section"]
        F3["Real-Time Hydraulic Parameter Simulator"]
        F4["High-Definition Causal DAG Visualizer"]
    end

    I1 & I2 & I3 & I4 --> S1
    S1 --> S3
    S2 --> S3
    S3 <--> S5
    S3 --> S6
    S3 --> S4
    S4 --> F1 & F2 & F3 & F4
    S3 --> E1 --> E2 --> E3 --> E4
```

---

## ☁️ AWS Cloud Infrastructure & Services

FloodLens is engineered with an enterprise-grade, cost-effective, and highly scalable **AWS serverless architecture**. Every component adheres to the AWS Well-Architected Framework, emphasizing security, operational excellence, and scientific reproducibility.

### AWS Architecture Overview

| AWS Service | Architectural Role | Technical Specifications & Sizing |
| :--- | :--- | :--- |
| **Amazon Bedrock** | GenAI Hydrological Reasoning & Defensibility Audit | Anthropic Claude 3.5 Sonnet (`apac.anthropic.claude-3-5-sonnet-20241022-v2:0`) via `bedrock-runtime` Converse API |
| **AWS Lambda** | Serverless Container Compute Engine | Python 3.12 container via **AWS Lambda Web Adapter (LWA)**, 2048 MB RAM, 120s timeout |
| **AWS Lambda Function URL** | High-Performance Public HTTPS Gateway | Direct invocation endpoint with native CORS; eliminates API Gateway latency and surcharge |
| **Amazon S3** | Scientific Data Lake & Manifest Store | Private encrypted bucket (`AES256`), bucket versioning, public access blocked, deterministic SHA-256 integrity metadata |
| **Amazon ECR** | Container Image Registry | Private image repository (`floodlens-backend`) with image scanning enabled (`scanOnPush=true`) |
| **AWS IAM** | Principle of Least Privilege Access Control | Execution role scoped strictly to S3 read/write, Bedrock Converse invocation, and CloudWatch basic logging |
| **Amazon CloudWatch** | Observability, Audit Logs & Metrics | Centralized structured JSON logging, execution performance tracking, and error telemetry |
| **Amazon RDS (Optional)** | Spatial PostGIS Engine | PostgreSQL 16 + PostGIS 3.4 for spatial indexing and topological vector queries |
| **AWS CloudFormation** | Infrastructure as Code (IaC) | Declarative single-command infrastructure template ([infra/floodlens-stack.yaml](file:///c:/Users/nikhi/OneDrive/Desktop/coding/AWSxENVIRONMENT/infra/floodlens-stack.yaml)) |

---

### Detailed AWS Services Breakdown

#### 1. Amazon Bedrock (Scientific Evidence Synthesis & Defensibility Gate)
- **Role**: Powers the causal investigation agent that translates mathematical hydraulic outputs into courtroom-grade attribution reports.
- **Model**: Anthropic Claude 3.5 Sonnet (`apac.anthropic.claude-3-5-sonnet-20241022-v2:0` in `ap-south-1` Mumbai / APAC inference profile).
- **Execution**: The agent invokes Bedrock through the Converse API (`boto3.client('bedrock-runtime')`).
- **Defensibility Guardrails**: Bedrock outputs are strictly audited by the application's sanitization pipeline:
  - Validates output structure against strict schema constraints (`validate_agent_output`).
  - Flags unsupported assertions into an explicit `unknowns` register.
  - Enforces three-tier evidentiary taxonomy: `FACT` (measured gauge/survey data), `SUPPORTED` (calibrated hydrological models), and `CAUSAL HYPOTHESIS` (counterfactual assertions).

#### 2. AWS Lambda with AWS Lambda Web Adapter (LWA)
- **Role**: Runs the containerized FastAPI backend without managing EC2 instances, ECS clusters, or load balancers.
- **Integration**: Leverages the official AWS Lambda Web Adapter (`public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4`), enabling unmodified ASGI FastAPI apps to run directly on Lambda.
- **Performance**: Provisioned with 2048 MB memory, allocating sufficient CPU power for real-time spatial calculations and rapid sub-second warm response times.

#### 3. AWS Lambda Function URL
- **Role**: Provides direct public HTTPS endpoints to the backend API (`https://<url-id>.lambda-url.<region>.on.aws/`).
- **Benefits**:
  - Eliminates the cost, operational complexity, and 29-second payload timeouts of AWS API Gateway.
  - Native CORS headers preconfigured in CloudFormation to allow seamless communication with Vercel and AWS Amplify frontends.

#### 4. Amazon S3 (Hydrological Data Lake)
- **Role**: Houses spatial layers, digital elevation models, drainage networks, and historical flood incident logs.
- **Folder Structure**:
  - `raw/`: Untouched IMD rainfall logs, Copernicus DEM GLO-30 GeoTIFFs, and GCC SWD shapefiles.
  - `processed/`: Standardized GeoJSON layers, normalized elevation grids, and topology graphs.
  - `manifests/`: Phase 2 & 3 catchment pairing manifests and event benchmarks.
  - `derived/`: Precomputed Manning discharge capacities and backwater depth profiles.
- **Integrity**: Every file uploaded via [scripts/sync_s3.py](file:///c:/Users/nikhi/OneDrive/Desktop/coding/AWSxENVIRONMENT/scripts/sync_s3.py) includes a computed SHA-256 hash in its S3 Object Metadata for scientific verification.

#### 5. AWS IAM Security & Least Privilege
The Lambda execution role ([infra/floodlens-stack.yaml](file:///c:/Users/nikhi/OneDrive/Desktop/coding/AWSxENVIRONMENT/infra/floodlens-stack.yaml)) strictly limits permissions to:
- `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` scoped exclusively to the project's data bucket.
- `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `bedrock:Converse`.
- Standard AWS Lambda basic execution logging (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`).

---

### Hybrid Operating Model: Cloud vs. Local

FloodLens is built with a seamless dual-backend runtime architecture. Developers and auditors can run the entire system 100% offline or fully connected to AWS:

| Operating Mode | Environment Variable | Storage Layer | LLM Causal Agent | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Local / Offline** | `AGENT_MODE=local` | Local directory (`data/`) | Deterministic Rule-Based Causal Engine | Local dev, unit testing, offline demos, zero AWS costs |
| **AWS Cloud (Production)** | `AGENT_MODE=bedrock` | Amazon S3 Bucket | Amazon Bedrock (Claude 3.5 Sonnet) | Production deployment, scalable public API, automated audits |

Switching modes requires only toggling `AGENT_MODE` in `.env` — zero code changes required.

---

### Automated AWS Deployment Pipeline

FloodLens includes battle-tested, zero-friction deployment scripts for both Windows PowerShell and Linux/macOS bash:

```mermaid
flowchart LR
    Step1["1. Verify IAM & AWS CLI\n(aws sts get-caller-identity)"] --> Step2["2. Ensure Amazon ECR Repo\n(floodlens-backend)"]
    Step2 --> Step3["3. Docker Build & Push\n(FastAPI + Lambda Adapter)"]
    Step3 --> Step4["4. Deploy CloudFormation\n(infra/floodlens-stack.yaml)"]
    Step4 --> Step5["5. Sync Datasets to S3\n(scripts/sync_s3.py + SHA-256)"]
    Step5 --> Step6["🚀 Live HTTPS API\n(Lambda Function URL)"]
```

#### Running the Pipeline

- **Linux / macOS**:
  ```bash
  # Pre-flight check without creating resources:
  ./deploy.sh ap-south-1 floodlens-production --dry-run

  # Full automated deployment:
  ./deploy.sh ap-south-1 floodlens-production
  ```

- **Windows PowerShell**:
  ```powershell
  # Pre-flight check without creating resources:
  .\deploy.ps1 -Region ap-south-1 -StackName floodlens-production -DryRun

  # Full automated deployment:
  .\deploy.ps1 -Region ap-south-1 -StackName floodlens-production
  ```

---

## 🔬 Hydrological Science & Causal Inference

FloodLens grounds all attribution in classical fluid dynamics and physical hydrology:

### 1. Rational Runoff Peak Rate
$$Q_{peak} = C \cdot I \cdot A$$
- $C$: Weighted runoff coefficient calculated from ESA WorldCover impervious fractions (paved roads: $0.85-0.90$, bare earth/parks: $0.20-0.35$).
- $I$: Rainfall intensity derived from IMD radar / rain-gauge timeseries ($mm/hr$).
- $A$: Catchment contributing area ($m^2$).

### 2. Manning's Gravity Conduit Capacity
$$Q_{capacity} = \frac{1}{n} \cdot A \cdot R_h^{2/3} \cdot S_0^{1/2}$$
- $n$: Roughness coefficient ($n = 0.015$ clean concrete, $n = 0.035$ heavily silted).
- $R_h$: Hydraulic radius ($A / P$).
- $S_0$: Conduit invert bed slope.

### 3. Backwater & Surcharge Calculation
When tailwater elevation at canal outfalls exceeds the pipe crown, or siltation exceeds $40\%$, gravity discharge collapses. FloodLens solves the gradually varied flow equation step-by-step to compute the resulting hydraulic grade line (HGL) surcharge head spilling into streets.

---

## 📁 Repository Organization

```
FloodLens/
├── backend/                       # Python 3.12 FastAPI Serverless Backend
│   ├── alembic/                   # Database schema migrations
│   ├── app/
│   │   ├── agent/                 # Bedrock & local causal reasoning agents
│   │   │   ├── core/              # Bedrock Converse API invocation & fallback
│   │   │   ├── guardrails/        # Defensibility validation & output sanitization
│   │   │   └── prompts/           # Hydraulic audit system prompts
│   │   ├── api/v1/                # REST endpoints (health, twins, simulation, audit)
│   │   ├── core/                  # Pydantic v2 application settings & configs
│   │   ├── models/                # SQLAlchemy & GeoAlchemy2 spatial ORM models
│   │   ├── schemas/               # Strict Pydantic input/output schemas
│   │   └── services/
│   │       ├── aws/               # Amazon S3 & storage abstraction service
│   │       └── geospatial/        # Rational method, Manning equation & backwater
│   ├── tests/                     # 97 Pytest test suites (unit, integration, contract, adversarial)
│   ├── Dockerfile                 # Multi-stage image with AWS Lambda Web Adapter
│   └── requirements.txt           # Python dependencies (FastAPI, boto3, GeoAlchemy2, Shapely)
│
├── frontend/                      # Next.js 14 App Router Presentation Layer
│   ├── app/                       # Routes (Landing hero, investigation, counterfactuals)
│   ├── components/                # Modular React & Tailwind components
│   │   ├── investigation/         # Catchment comparison panels, 3D cross-section
│   │   └── ui/                    # Reusable visual primitives & SVG DAG nodes
│   ├── lib/                       # API clients, types, and hydraulic math helpers
│   └── tests/                     # 71 Vitest frontend component & logic tests
│
├── infra/                         # Infrastructure as Code
│   └── floodlens-stack.yaml       # AWS CloudFormation template (Lambda, S3, IAM, URL)
│
├── scripts/                       # DevOps, Ingestion & Automation Utilities
│   ├── sync_s3.py                 # S3 dataset synchronization with SHA-256 verification
│   ├── ingest_chennai.py          # Chennai geospatial and SWD pipeline ingestion
│   ├── seed_demo.py               # Deterministic seed data for local and staging
│   └── validate_data.py           # Scientific integrity check for GeoJSON & DEMs
│
├── data/                          # Scientific Datasets & Manifests (Local Fallback)
│   ├── raw/                       # Raw IMD rainfall logs, Copernicus DEMs, GCC SWD
│   ├── processed/                 # GeoJSON catchments and normalized elevation grids
│   └── manifests/                 # Twin catchment pair definitions and ground truth
│
├── docs/                          # Comprehensive Scientific & System Documentation
│   ├── architecture/              # High-level architecture and data flows
│   ├── deployment/                # AWS deployment instructions and cloud topologies
│   └── images/                    # Platform screenshots and UI visual assets
│
├── deploy.ps1                     # Windows PowerShell one-command AWS deployment pipeline
├── deploy.sh                      # Linux/macOS bash one-command AWS deployment pipeline
├── docker-compose.yml             # Local PostgreSQL 16 + PostGIS 3.4 development environment
├── Makefile                       # Developer shortcuts (install, test, migrate, run)
└── README.md                      # Project documentation and architectural guide
```

---

## 🧪 Test Suite & Verification

FloodLens maintains an uncompromising verification posture, covering numerical hydrology formulas, API contracts, adversarial edge cases, and accessibility:

- **Backend (Pytest)**: **97 passed tests**
  - Physical unit tests: Topographic similarity matching, Manning pipe capacity under siltation, backwater head propagation.
  - API & Contract tests: Schema compliance, pagination, and error handling.
  - Adversarial guardrail tests: Prompt injection resistance, missing data fallback, ungrounded hypothesis mitigation.
- **Frontend (Vitest)**: **106 passed tests** across 21 test suites
  - Complete authentication test coverage: Compact scientific gateway layout, instant 1-click Technical Demo access (`Dr. K. Senthil Nathan`), Citizen Mode toggle (`Priya Ramanathan`), Google OAuth initialization, Indian Mobile (+91) OTP validation, PIN auto-advance, and contextual missing-provider fallback.
  - Component mechanics, accessible ARIA labels, parameter slider reactivity, counterfactual recalculation.
- **Type Safety**: 100% strict TypeScript compilation with zero errors across all static and dynamic routes.
- **Flake Rate**: 0.00% across consecutive CI test executions.

Run the test suites locally:
```bash
# Backend tests
pytest backend/tests -v

# Frontend tests
cd frontend && npm run test:run
```

---

## 💻 Local Development Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.12+ (or 3.11+)
- Docker & Docker Compose (for local PostGIS database)
- AWS CLI v2 (optional, only needed for AWS sync or deployment)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/nikhillakra2007-tech/FloodLens.git
cd FloodLens
cp .env.example backend/.env
```

### 2. Start Local Database (PostGIS)
```bash
docker compose up -d db
```

### 3. Backend Setup
```bash
cd backend
python -m venv .venv

# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

pip install -r requirements.txt
alembic upgrade head
python ../scripts/seed_demo.py

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Automated Cloud Deployment

Deploy the entire FloodLens cloud infrastructure in a single command using your preferred shell:

### Option A: Linux / macOS
```bash
chmod +x deploy.sh
./deploy.sh ap-south-1 floodlens-production
```

### Option B: Windows PowerShell
```powershell
.\deploy.ps1 -Region ap-south-1 -StackName floodlens-production
```

### What the deployment pipeline does automatically:
1. Validates AWS CLI credentials and active IAM identity.
2. Creates or checks the Amazon ECR repository (`floodlens-backend`).
3. Builds the production Docker image with the AWS Lambda Web Adapter.
4. Pushes the container image to Amazon ECR.
5. Deploys the CloudFormation stack ([infra/floodlens-stack.yaml](file:///c:/Users/nikhi/OneDrive/Desktop/coding/AWSxENVIRONMENT/infra/floodlens-stack.yaml)), provisioning the S3 Bucket, IAM Role, Lambda Function, and Function URL.
6. Synchronizes raw datasets, manifests, and GeoJSON files to the private S3 bucket with computed SHA-256 integrity checksums.
7. Outputs the public HTTPS backend API URL and health check endpoint.

---

## ⚙️ Environment Configuration

| Variable | Description | Default / Example | Required in AWS? |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL + PostGIS connection string | `postgresql+psycopg2://postgres:postgres@localhost:5432/floodlens` | Yes (RDS endpoint) |
| `AWS_REGION` | Target AWS deployment region | `ap-south-1` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key (optional if using IAM role) | `AKIA...` | Optional (IAM Role preferred) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (optional if using IAM role) | `wJalr...` | Optional (IAM Role preferred) |
| `BEDROCK_MODEL_ID` | Amazon Bedrock Foundation Model ID | `apac.anthropic.claude-3-5-sonnet-20241022-v2:0` | Yes (when `AGENT_MODE=bedrock`) |
| `S3_BUCKET` | S3 Data Lake bucket name | `floodlens-data-chennai` | Yes |
| `CORS_ORIGINS` | Allowed origins for web client | `https://floodlens-app.vercel.app,http://localhost:3000` | Yes |
| `AGENT_MODE` | Hydrological causal agent mode | `local` (offline) or `bedrock` (cloud) | No (defaults to `local`) |
| `LOG_LEVEL` | Python logging severity level | `INFO` | No |

---

## 📜 License & Scientific Data Sources

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Scientific Data Provenance
- **Rainfall & Radar Telemetry**: India Meteorological Department (IMD) Chennai Doppler Weather Radar (DWR) & Automatic Weather Station (AWS) records.
- **Digital Elevation Model (DEM)**: Copernicus DEM GLO-30 (30-meter European Space Agency elevation grid).
- **Land Cover & Impervious Fractions**: ESA WorldCover 10m Land Classification dataset.
- **Stormwater Drain (SWD) Network**: Greater Chennai Corporation (GCC) open stormwater asset registry.

# Data Sources

## Primary Sources

### GCC Stormwater Drainage Survey
- **Provider:** Greater Chennai Corporation
- **Contents:** ~10,308 drain segments, 197 wards, drain types (SWD, side drains, open drains, macro, micro)
- **Attributes:** street name, ward, zone, drain type, open/closed, depth, width, length, material, condition status, cover
- **Year:** 2023
- **License:** Open Government Data
- **Trust level:** official
- **Notes:** Static survey data

### reclaimchennai/chennai-swd
- **Provider:** Community research project
- **Caveats:** ~107 wards covered, some geometry inferred, connections inferred, subcatchment parameters are defaults, flood records are observations not depth surfaces
- **Trust level:** research

### IMD Rainfall Data
- **Provider:** India Meteorological Department
- **Resolution:** Station-level daily/hourly
- **Trust level:** official

### NASA GPM IMERG
- **Provider:** NASA
- **Resolution:** 0.1 degree, half-hourly
- **Trust level:** research
- **Notes:** Do NOT claim street-level rainfall precision from IMERG

### Copernicus DEM GLO-30
- **Provider:** European Space Agency / Copernicus
- **Resolution:** 30m global
- **Trust level:** research

### ESA WorldCover 10m
- **Provider:** ESA WorldCover project
- **Resolution:** 10m
- **License:** CC-BY-4.0
- **Trust level:** research

## Demo Dataset

The demo data in this repository is entirely synthetic and labeled "Research/demo dataset". It does NOT represent real flood events or real drain conditions. It exists solely to demonstrate the investigation workflow.

## Data Hierarchy (Strongest to Weakest Evidence)

1. Official survey data (GCC)
2. Official rainfall stations (IMD)
3. Research datasets (IMERG, Copernicus, ESA)
4. Community/reclaimchennai data
5. Inferred geometry (always flagged with `is_inferred = true`)

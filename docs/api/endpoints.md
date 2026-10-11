# API Endpoints

Base URL: `/api/v1`

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |

## Locations

| Method | Path | Description |
|--------|------|-------------|
| GET | /locations/places | List all places |
| GET | /locations/places/{id} | Get place by ID |
| GET | /locations/places/{id}/features | Get terrain + landcover features |
| GET | /locations/places/{id}/comparables?top_k=5 | Find comparable locations |
| POST | /locations/places/{id}/compute-features | Trigger feature computation |
| POST | /locations/compare?place_a_id={}&place_b_id={} | Compare two places |
| GET | /locations/flood-events | List flood events |
| GET | /locations/flood-events/{id} | Get flood event detail |
| GET | /locations/flood-observations?event_id={} | List flood observations |
| GET | /locations/rainfall/{place_id} | Rainfall for a place |

## Investigations

| Method | Path | Description |
|--------|------|-------------|
| POST | /investigations/comparisons?place_a_id={}&place_b_id={} | Create comparison |
| POST | /investigations?comparison_id={} | Run investigation |
| GET | /investigations/{id} | Get investigation detail |
| GET | /investigations/{id}/evidence | Get evidence items |
| GET | /investigations/{id}/graph | Get mechanism graph |
| GET | /investigations/{id}/history | Get historical validation |
| POST | /investigations/{id}/counterfactual | Run counterfactual scenario |

## Map

| Method | Path | Description |
|--------|------|-------------|
| GET | /map/drains?lon={}&lat={}&radius_m={} | Drainage segments near point |
| GET | /map/flood-observations?lon={}&lat={}&radius_m={} | Flood observations near point |
| GET | /map/terrain?lon={}&lat={} | Terrain info for point |

## Response Format

All responses use Pydantic schemas. Errors return:

```json
{
  "detail": "Error description"
}
```

Request IDs are returned in the `X-Request-ID` response header.

import requests

places = requests.get('http://127.0.0.1:8000/api/v1/locations/places').json()
print("Found places:", len(places))
if len(places) >= 2:
    p1 = places[0]['id']
    p2 = places[1]['id']
    comp = requests.post(f'http://127.0.0.1:8000/api/v1/investigations/comparisons?place_a_id={p1}&place_b_id={p2}').json()
    print("Comparison created:", comp['id'])
    inv = requests.post(f'http://127.0.0.1:8000/api/v1/investigations?comparison_id={comp["id"]}').json()
    print("LIVE_INVESTIGATION_ID:", inv['id'])

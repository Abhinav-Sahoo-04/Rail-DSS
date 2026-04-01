import http.client
import json
from datetime import datetime, timedelta
import urllib.parse
from .trainType import get_train_type
from .trainSort import allocate_platforms

def get_train_arrange():
    interval=2
    conn = http.client.HTTPSConnection("rail-info-api-india1.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "869bd9d639msh64555a909fd6d88p187bcejsn9df4ef4d0bf1",
        'x-rapidapi-host': "rail-info-api-india1.p.rapidapi.com",
        'Content-Type': "application/json"
    }

    # Current time and +1 hour window
    now = datetime.now()
    one_hour_later = now + timedelta(hours=interval)

    # Format with timezone offset (+05:30 for IST)
    fmt = "%Y-%m-%dT%H:%M:%S%z"
    # Attach IST offset manually
    ist_offset = "+05:30"
    from_str = now.strftime("%Y-%m-%dT%H:%M:%S") + ist_offset
    to_str = one_hour_later.strftime("%Y-%m-%dT%H:%M:%S") + ist_offset

    # URL encode the parameters
    from_enc = urllib.parse.quote(from_str)
    to_enc = urllib.parse.quote(to_str)

    endpoint = f"/v1/stations/CTC/arrivals?from={from_enc}&to={to_enc}&limit=50"

    conn.request("GET", endpoint, headers=headers)
    res = conn.getresponse()
    data = res.read()

    json_data = json.loads(data.decode("utf-8"))
    # print(json_data)

    trains = []
    for train in json_data.get("data", []):
        train_no = train.get("train_no")
        train_name = train.get("train_name")
        arrival_time = train.get("arrival_time")
        departure_time = train.get("departure_time")
        train_type = get_train_type(train_no)

        trains.append({
            "train_no": train_no,
            "train_name": train_name,
            "arrival_time": arrival_time,
            "departure_time": departure_time,
            "train_type": train_type
        })

    final_data= allocate_platforms(trains)




    return final_data

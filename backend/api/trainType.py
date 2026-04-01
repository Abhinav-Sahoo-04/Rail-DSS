import http.client
import json

def get_train_type(train_no):
    conn = http.client.HTTPSConnection("rail-info-api-india1.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "869bd9d639msh64555a909fd6d88p187bcejsn9df4ef4d0bf1",
        'x-rapidapi-host': "rail-info-api-india1.p.rapidapi.com",
        'Content-Type': "application/json"
    }

    conn.request("GET", f"/v1/trains/{train_no}", headers=headers)

    res = conn.getresponse()
    data = res.read()

    # Decode bytes to string and parse JSON
    train_info = json.loads(data.decode("utf-8"))

    # Inspect the structure once to see what keys are available
    # print(train_info)

    # Safely extract train type
    train_type = train_info.get("data", {}).get("train_type", "Unknown")
    # print("Train Type:", train_type)

    return train_type



import http.client
import json

def get_live_train_status(train_number):
    start_day=1
    conn = http.client.HTTPSConnection("irctc-api2.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "869bd9d639msh64555a909fd6d88p187bcejsn9df4ef4d0bf1",
        'x-rapidapi-host': "irctc-api2.p.rapidapi.com",
        'Content-Type': "application/json"
    }

    endpoint = f"/liveTrain?trainNumber={train_number}&startDay={start_day}"
    conn.request("GET", endpoint, headers=headers)

    res = conn.getresponse()
    data = res.read()

    try:
        parsed = json.loads(data.decode("utf-8"))  # convert to dict
        return str(parsed["data"]["delay"])        # return delay as string
    except Exception as e:
        print("Error parsing response:", e)
        return None




import json
with open('./bench-results.json', 'r') as f:
    all = json.loads(f.read())

all_v8_ser = 0
all_json_ser = 0
all_agon_ser = 0

all_v8_deser = 0
all_json_deser = 0
all_agon_deser = 0

size_v8 = 0
size_json = 0
size_agon = 0
for obj in all:
    all_v8_ser += all[obj]['V8']['serialize']['time']
    all_json_ser += all[obj]['json']['serialize']['time']
    all_agon_ser += all[obj]['gon']['serialize']['time']

    all_v8_deser += all[obj]['V8']['deserialize']['time']
    all_json_deser += all[obj]['json']['deserialize']['time']
    all_agon_deser += all[obj]['gon']['deserialize']['time']

    size_v8 += all[obj]['V8']['serialize']['bytes']
    size_json += all[obj]['json']['serialize']['bytes']
    size_agon += all[obj]['gon']['serialize']['bytes']

    break

print(f"{round((all_json_ser/15), 4)} {round((all_json_deser/15), 4)} {round((all_v8_ser/15), 4)} {round((all_v8_deser/15), 4)} {round((all_agon_ser/15), 4)} {round((all_agon_deser/15), 4)}")
print(f"{round((size_json/15), 4)} {round((size_v8/15), 4)} {round((size_agon/15), 4)}")

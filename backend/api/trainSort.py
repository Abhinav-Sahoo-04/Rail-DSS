"""
Rail DSS — Platform Allocation (Clean API Function)
=====================================================
Single callable function: allocate_platforms(data, simulate_time)
Returns a clean dict with only essential fields.

Author  : Abhinav Sahoo (Rail DSS Project)
Module  : core/allocator.py
"""
import json

from datetime import datetime

RESERVATION_WINDOW_MINUTES = 300
PLATFORM_BUFFER_MINUTES    = 3
TOTAL_PLATFORMS            = 4

TRAIN_TYPE_SCORE = {
    "vande_bharat" : 100,
    "rajdhani"     : 95,
    "shatabdi"     : 90,
    "duronto"      : 85,
    "ac_express"   : 80,
    "superfast"    : 75,
    "special"      : 65,
    "express"      : 55,
    "intercity"    : 45,
    "passenger"    : 30,
    "demu"         : 25,
    "memu"         : 20,
    "freight"      : 10,
    "other"        : 40,
}

WEIGHTS = {"train_type": 0.60, "halt_time": 0.25, "arrival": 0.15}


# ── Internal helpers ───────────────────────────────────────────

def _to_min(t: str) -> int:
    if not t:
        return 0          # treat missing time as midnight; adjust default as needed
    p = t.split(":")
    return int(p[0]) * 60 + int(p[1])

def _halt(arr: str, dep: str) -> int:
    if not arr or not dep:
        return 0
    return max(0, _to_min(dep) - _to_min(arr))

def _norm(v, lo, hi):
    return 1.0 if hi == lo else (v - lo) / (hi - lo)

def _score(train: dict, pool: list) -> float:
    arrivals = [_to_min(t["arrival_time"]) for t in pool]
    halts    = [_halt(t["arrival_time"], t["departure_time"]) for t in pool]
    type_raw = TRAIN_TYPE_SCORE.get(train["train_type"].lower(), 40)
    h        = _halt(train["arrival_time"], train["departure_time"])
    return round(
        WEIGHTS["train_type"] * _norm(type_raw,              min(TRAIN_TYPE_SCORE.values()), max(TRAIN_TYPE_SCORE.values())) * 100 +
        WEIGHTS["halt_time"]  * (1 - _norm(h,                min(halts),    max(halts)))    * 100 +
        WEIGHTS["arrival"]    * (1 - _norm(_to_min(train["arrival_time"]), min(arrivals), max(arrivals))) * 100,
        2
    )

def _clean(train: dict, extra: dict) -> dict:
    arr = train.get("arrival_time") or ""
    dep = train.get("departure_time") or ""
    return {
        "train_no"       : train.get("train_no", ""),
        "train_name"     : train.get("train_name", ""),
        "arrival_time"   : arr[:5] if arr else None,
        "departure_time" : dep[:5] if dep else None,
        "train_type"     : train.get("train_type", "other"),
        **extra
    }


# ── Main function ──────────────────────────────────────────────

def allocate_platforms(data: list[dict], simulate_time: str = None) -> dict:
    # Strip out any records missing critical time fields
    data = [
        t for t in data
        if t.get("arrival_time") and t.get("departure_time")
    ]

    if not data:
        return {
            "current_time" : simulate_time or datetime.now().strftime("%H:%M"),
            "active"       : [],
            "reserve"      : [],
            "pending"      : [],
            "departed"     : [],
            "conflicts"    : [],
        }

    now = _to_min(simulate_time) if simulate_time else datetime.now().hour * 60 + datetime.now().minute
    current_time_str = simulate_time or datetime.now().strftime("%H:%M")

    # ── Step 1: classify by time status ───────────────────────
    classified = []
    for t in data:
        arr     = _to_min(t["arrival_time"])
        dep     = _to_min(t["departure_time"])
        free_at = dep + PLATFORM_BUFFER_MINUTES
        eta     = arr - now

        if now > free_at:
            status = "departed"
        elif now >= arr:
            status = "active"
        elif eta <= RESERVATION_WINDOW_MINUTES:
            status = "reserve"
        else:
            status = "pending"

        classified.append({**t, "_arr": arr, "_dep": dep, "_free_at": free_at, "_eta": eta, "_status": status})

    # ── Step 1b: cap reserve at 5 — overflow goes to pending ──
    RESERVE_CAP = 5
    reserve_pool = [t for t in classified if t["_status"] == "reserve"]
    reserve_pool.sort(key=lambda t: t["_eta"])           # closest ETA first

    for t in reserve_pool[RESERVE_CAP:]:                 # beyond top-5 → pending
        t["_status"] = "pending"

    # ── Step 2: score and sort candidates (active + reserve) ──
    candidates = [t for t in classified if t["_status"] in ("active", "reserve")]
    pending    = [t for t in classified if t["_status"] == "pending"]
    departed   = [t for t in classified if t["_status"] == "departed"]

    # ... rest of the function unchanged

    if candidates:
        for t in candidates:
            t["_score"] = _score(t, candidates)
        candidates.sort(key=lambda t: (-t["_score"], t["_arr"]))

    # ── Step 3: assign platforms greedily ─────────────────────
    platform_free = {p: 0 for p in range(1, TOTAL_PLATFORMS + 1)}
    active, reserve, conflicts = [], [], []

    for rank, t in enumerate(candidates, start=1):
        best_pf = None
        for pf_id, free_at in platform_free.items():
            if free_at <= t["_arr"]:
                if best_pf is None or platform_free[pf_id] < platform_free[best_pf]:
                    best_pf = pf_id

        if best_pf:
            platform_free[best_pf] = t["_free_at"]
            conflict = False
            platform = best_pf
        else:
            conflict = True
            platform = None

        record = _clean(t, {
            "platform"       : platform,
            "priority_rank"  : rank,
            "priority_score" : t["_score"],
            "eta_minutes"    : t["_eta"],
            "conflict"       : conflict,
        })

        if conflict:
            conflicts.append(record)

        if t["_status"] == "active":
            active.append(record)
        else:
            reserve.append(record)

    # ── Step 4: build clean pending / departed lists ───────────
    pending_clean = [
        _clean(t, {"eta_minutes": t["_eta"]})
        for t in pending
    ]
    departed_clean = [
        _clean(t, {"departed_min_ago": abs(t["_eta"])})
        for t in departed
    ]

    return {
        "current_time" : current_time_str,
        "active"       : active,
        "reserve"      : reserve,
        "pending"      : pending_clean,
        "departed"     : departed_clean,
        "conflicts"    : conflicts,
    }


# ── Quick test ─────────────────────────────────────────────────

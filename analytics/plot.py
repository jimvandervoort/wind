"""
Reads vision_history.jsonl and live_history.jsonl, and for each spot where
both kite count and wind data exist, plots a graph with:
  - X-axis: date
  - Left Y-axis: max wind speed (knots)
  - Right Y-axis: max kite count
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

import matplotlib.pyplot as plt
import matplotlib.dates as mdates

DIR = Path(__file__).parent

# Only consider records between these hours (local time, 24h format).
# Records outside this window are ignored for both wind and kite data.
DAYTIME_START_HOUR = 7  # inclusive
DAYTIME_END_HOUR = 20  # exclusive


def read_jsonl(path):
    lines = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    lines.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return lines


def parse_datetime(dt_str):
    return datetime.fromisoformat(dt_str)


def is_daytime(dt):
    return DAYTIME_START_HOUR <= dt.hour < DAYTIME_END_HOUR


def gather_kite_counts(records):
    """Returns {spot: {date: max_count}}"""
    data = defaultdict(lambda: defaultdict(int))
    for rec in records:
        spot = rec.get("spot")
        count = rec.get("count")
        dt = rec.get("datetime")
        if spot is None or count is None or dt is None:
            continue
        dt_parsed = parse_datetime(dt)
        if not is_daytime(dt_parsed):
            continue
        day = dt_parsed.date()
        data[spot][day] = max(data[spot][day], count)
    return data


def gather_wind_speeds(records):
    """Returns {station: {date: max_high_knots}}"""
    data = defaultdict(lambda: defaultdict(float))
    for rec in records:
        dt = rec.get("datetime")
        if dt is None:
            continue
        dt_parsed = parse_datetime(dt)
        if not is_daytime(dt_parsed):
            continue
        day = dt_parsed.date()
        for key, val in rec.items():
            if key == "datetime" or not isinstance(val, dict):
                continue
            high = val.get("high")
            if high is not None:
                data[key][day] = max(data[key][day], float(high))
    return data


def plot_spot(spot, kite_by_day, wind_by_day, out_dir):
    common_days = sorted(set(kite_by_day.keys()) & set(wind_by_day.keys()))
    if not common_days:
        return

    dates = common_days
    wind = [wind_by_day[d] for d in dates]
    kites = [kite_by_day[d] for d in dates]

    import numpy as np

    fig, ax = plt.subplots(figsize=(12, 5))

    x = np.arange(len(dates))
    bar_width = 0.35

    bars_wind = ax.bar(
        x - bar_width / 2, wind, bar_width, color="#5b9bd5", label="Wind (knots)"
    )
    bars_kites = ax.bar(
        x + bar_width / 2, kites, bar_width, color="#e74c3c", label="Kite count"
    )

    ax.bar_label(bars_wind, fmt="%.0f", padding=2, fontsize=7)
    ax.bar_label(bars_kites, fmt="%d", padding=2, fontsize=7)

    ax.set_xlabel("Date")
    ax.set_ylabel("Value")
    ax.set_ylim(bottom=0)
    ax.set_xticks(x)
    ax.set_xticklabels([d.strftime("%b %d") for d in dates], rotation=45, ha="right")
    ax.legend(loc="upper left")

    plt.title(f"{spot} — Wind Speed vs Kite Count")
    plt.tight_layout()

    out_path = out_dir / f"{spot}.png"
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    print(f"Wrote {out_path}")


def main():
    vision_path = DIR / "vision_history.jsonl"
    live_path = DIR / "live_history.jsonl"

    if not vision_path.exists():
        print(f"Missing {vision_path}")
        return
    if not live_path.exists():
        print(f"Missing {live_path}")
        return

    kite_data = gather_kite_counts(read_jsonl(vision_path))
    wind_data = gather_wind_speeds(read_jsonl(live_path))

    common_spots = set(kite_data.keys()) & set(wind_data.keys())
    if not common_spots:
        print("No spots with both kite and wind data found.")
        print(f"  Kite spots: {sorted(kite_data.keys())}")
        print(f"  Wind stations: {sorted(wind_data.keys())}")
        return

    out_dir = DIR / "plots"
    out_dir.mkdir(exist_ok=True)

    for spot in sorted(common_spots):
        plot_spot(spot, kite_data[spot], wind_data[spot], out_dir)


if __name__ == "__main__":
    main()

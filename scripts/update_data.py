#!/usr/bin/env python3
"""
Update src/data.js topic statuses from a skills JSON snapshot.

Usage:
    python scripts/update_data.py '<skills_json>'

The skills_json argument must be a JSON string with the same shape as INIT:
    {"T1": [{"id": "...", "topics": [{"t": "...", "s": "have|learn|todo"}, ...], ...}], ...}

For each topic, the script matches on the topic text ("t") and replaces the
status ("s") value in-place. Topic texts are assumed to be unique across the file.
"""
import json
import re
import sys
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "src" / "data.js"
VALID_STATUSES = {"have", "learn", "todo"}


def build_topic_map(skills: dict) -> dict[str, str]:
    """Return {topic_text: status} for every topic in the skills snapshot."""
    result = {}
    for tier_skills in skills.values():
        for skill in tier_skills:
            for topic in skill.get("topics", []):
                t, s = topic.get("t", ""), topic.get("s", "")
                if t and s in VALID_STATUSES:
                    result[t] = s
    return result


def update_data_js(topic_map: dict[str, str]) -> int:
    """Regex-replace status values in src/data.js. Returns number of replacements."""
    source = DATA_FILE.read_text(encoding="utf-8")
    changes = 0

    for topic_text, new_status in topic_map.items():
        # Match: {t:"<exact topic text>",s:"<any status>"}
        pattern = r'(\{t:"' + re.escape(topic_text) + r'",s:")([^"]+)(")'
        replacement = rf'\g<1>{new_status}\g<3>'
        new_source, n = re.subn(pattern, replacement, source)
        if n:
            source = new_source
            changes += n
        else:
            print(f"  WARN: no match for topic '{topic_text}'", file=sys.stderr)

    DATA_FILE.write_text(source, encoding="utf-8")
    return changes


def main():
    if len(sys.argv) < 2:
        print("Usage: update_data.py '<skills_json>'", file=sys.stderr)
        sys.exit(1)

    raw = sys.argv[1]
    try:
        skills = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"ERROR: invalid JSON — {e}", file=sys.stderr)
        sys.exit(1)

    topic_map = build_topic_map(skills)
    if not topic_map:
        print("ERROR: no valid topics found in JSON input.", file=sys.stderr)
        sys.exit(1)

    print(f"Updating {len(topic_map)} topics in {DATA_FILE} …")
    changes = update_data_js(topic_map)
    print(f"Done — {changes} replacements made.")


if __name__ == "__main__":
    main()

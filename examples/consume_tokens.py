"""Read portable design decisions with only Python's standard library."""
import json
from pathlib import Path


def load_tokens(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("version") != 1 or data.get("colorSpace") != "srgb":
        raise ValueError("Unsupported Cieo token contract")
    return data["tokens"]


if __name__ == "__main__":
    source = Path(__file__).resolve().parents[1] / "design/generated/default.portable.json"
    tokens = load_tokens(source)
    print(tokens["color-accent"]["$value"]["hex"])
    print(tokens["space-2"]["$value"])  # Keep the unit, rather than assuming device pixels.

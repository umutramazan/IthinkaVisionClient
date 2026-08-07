from __future__ import annotations

import os
import sys
from urllib.error import URLError
from urllib.request import urlopen


def check(path: str) -> None:
    port = os.environ.get("APP_PORT", "8000")
    with urlopen(f"http://127.0.0.1:{port}{path}", timeout=3) as response:
        if response.status != 200:
            raise RuntimeError(f"{path} HTTP {response.status} dondurdu")


try:
    check("/health/live")
    check("/health/ready")
except (OSError, RuntimeError, URLError) as error:
    print(f"Healthcheck basarisiz: {error}", file=sys.stderr)
    raise SystemExit(1) from error

import hashlib
from pathlib import Path


def compute_sha256(file_path: str | Path) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def file_size_bytes(file_path: str | Path) -> int:
    return Path(file_path).stat().st_size

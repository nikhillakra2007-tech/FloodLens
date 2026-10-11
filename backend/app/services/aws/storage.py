"""AWS S3 and local-compatible object storage service.

Provides a unified interface for storing raw, processed, manifest, and derived
data artifacts. Works with AWS S3 when configured, or transparently falls back
to local directory structure when running locally or in test environments.
"""

import hashlib
import json
import logging
import os
from pathlib import Path
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class StorageService:
    """Unified storage interface supporting both local filesystem and AWS S3."""

    def __init__(self, base_dir: Path | str | None = None):
        self.settings = get_settings()
        self.bucket_name = self.settings.s3_bucket
        self.region = self.settings.aws_region
        self.base_dir = Path(base_dir or Path(__file__).resolve().parent.parent.parent.parent.parent / "data")
        self._s3_client = None

        # Standard object hierarchy prefixes
        self.prefixes = {
            "raw": "raw",
            "processed": "processed",
            "manifests": "manifests",
            "derived": "derived",
        }

        # Initialize directories locally
        for prefix in self.prefixes.values():
            (self.base_dir / prefix).mkdir(parents=True, exist_ok=True)

    @property
    def s3_client(self):
        """Lazy-load S3 client if AWS credentials are provided."""
        if self._s3_client is None:
            if self.settings.aws_access_key_id and self.settings.aws_secret_access_key:
                try:
                    import boto3
                    self._s3_client = boto3.client(
                        "s3",
                        region_name=self.region,
                        aws_access_key_id=self.settings.aws_access_key_id,
                        aws_secret_access_key=self.settings.aws_secret_access_key,
                    )
                except Exception as e:
                    logger.warning("Failed to initialize boto3 S3 client: %s. Using local storage.", e)
            else:
                logger.debug("AWS credentials not configured. Using local storage.")
        return self._s3_client

    @property
    def is_aws_enabled(self) -> bool:
        return self.s3_client is not None

    def compute_sha256(self, file_path: Path | str) -> str:
        """Compute SHA-256 checksum of a file."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    def store_file(
        self,
        local_path: Path | str,
        category: str,
        destination_name: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Store a file in object storage (S3 or local directory)."""
        src = Path(local_path)
        if not src.exists():
            raise FileNotFoundError(f"Source file not found: {src}")

        dest_name = destination_name or src.name
        rel_key = f"{self.prefixes.get(category, category)}/{dest_name}"
        sha256 = self.compute_sha256(src)
        file_size = src.stat().st_size

        result = {
            "key": rel_key,
            "category": category,
            "filename": dest_name,
            "sha256": sha256,
            "file_size_bytes": file_size,
            "storage_backend": "s3" if self.is_aws_enabled else "local",
            "uri": f"s3://{self.bucket_name}/{rel_key}" if self.is_aws_enabled else f"file:///{self.base_dir / rel_key}".replace("\\", "/"),
            "metadata": metadata or {},
        }

        # Local persistence
        local_dest = self.base_dir / rel_key
        local_dest.parent.mkdir(parents=True, exist_ok=True)
        if src.resolve() != local_dest.resolve():
            import shutil
            shutil.copy2(src, local_dest)

        # S3 upload if enabled
        if self.is_aws_enabled:
            try:
                extra_args = {}
                if metadata:
                    extra_args["Metadata"] = metadata
                self.s3_client.upload_file(str(src), self.bucket_name, rel_key, ExtraArgs=extra_args or None)
                logger.info("Uploaded to S3: s3://%s/%s", self.bucket_name, rel_key)
            except Exception as e:
                logger.error("Failed to upload to S3: %s", e)
                result["s3_error"] = str(e)

        return result

    def store_json(
        self,
        data: dict[str, Any] | list[Any],
        category: str,
        destination_name: str,
        metadata: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Store a JSON structure directly."""
        rel_key = f"{self.prefixes.get(category, category)}/{destination_name}"
        local_dest = self.base_dir / rel_key
        local_dest.parent.mkdir(parents=True, exist_ok=True)

        content = json.dumps(data, indent=2, default=str)
        with open(local_dest, "w", encoding="utf-8") as f:
            f.write(content)

        return self.store_file(local_dest, category, destination_name, metadata)

    def get_manifest_path(self, manifest_name: str) -> Path:
        return self.base_dir / "manifests" / manifest_name


# Singleton instance
storage_service = StorageService()

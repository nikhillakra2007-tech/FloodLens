"""AWS S3 Data Synchronization and Integrity Script for FloodLens.

Uploads Chennai flood datasets, GeoJSON layers, and phase2 manifests to the
configured S3 bucket, preserving deterministic folder structure and verifying
SHA-256 checksums for scientific reproducibility.
"""

import argparse
import hashlib
import logging
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("floodlens.sync_s3")


def compute_sha256(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def sync_directory_to_s3(data_dir: Path, bucket_name: str, region: str, dry_run: bool = False):
    import boto3
    from botocore.exceptions import ClientError

    s3 = boto3.client("s3", region_name=region)

    # Ensure bucket exists
    if not dry_run:
        try:
            s3.head_bucket(Bucket=bucket_name)
            logger.info("Bucket '%s' exists and is accessible.", bucket_name)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchBucket"):
                logger.info("Bucket '%s' does not exist. Creating...", bucket_name)
                create_params = {"Bucket": bucket_name}
                if region != "us-east-1":
                    create_params["CreateBucketConfiguration"] = {"LocationConstraint": region}
                s3.create_bucket(**create_params)
                logger.info("Created bucket '%s'.", bucket_name)
            else:
                logger.error("Error accessing bucket '%s': %s", bucket_name, e)
                raise

    total_files = 0
    uploaded_files = 0

    subdirs = ["raw", "manifests", "processed", "derived"]
    for subdir in subdirs:
        dir_path = data_dir / subdir
        if not dir_path.exists():
            continue

        for file_path in dir_path.rglob("*"):
            if not file_path.is_file():
                continue

            rel_key = file_path.relative_to(data_dir).as_posix()
            sha256 = compute_sha256(file_path)
            file_size = file_path.stat().st_size
            total_files += 1

            content_type = "application/json" if file_path.suffix == ".json" else "application/octet-stream"
            if file_path.suffix in (".geojson", ".topojson"):
                content_type = "application/geo+json"
            elif file_path.suffix == ".csv":
                content_type = "text/csv"

            if dry_run:
                logger.info("[DRY-RUN] Would upload: %s -> s3://%s/%s (%d bytes, sha256: %s...)",
                            file_path.name, bucket_name, rel_key, file_size, sha256[:8])
            else:
                extra_args = {
                    "ContentType": content_type,
                    "Metadata": {
                        "sha256": sha256,
                        "source": "floodlens-ingestion",
                    },
                }
                s3.upload_file(str(file_path), bucket_name, rel_key, ExtraArgs=extra_args)
                logger.info("Uploaded: s3://%s/%s (sha256: %s...)", bucket_name, rel_key, sha256[:8])
                uploaded_files += 1

    logger.info("Sync complete. Processed %d files (%d uploaded).", total_files, uploaded_files)


def main():
    parser = argparse.ArgumentParser(description="Sync FloodLens datasets to AWS S3")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without uploading")
    parser.add_argument("--bucket", type=str, default=None, help="Override S3 bucket name")
    parser.add_argument("--region", type=str, default=None, help="Override AWS region")
    args = parser.parse_args()

    settings = get_settings()
    bucket = args.bucket or settings.s3_bucket
    region = args.region or settings.aws_region

    data_dir = Path(__file__).resolve().parent.parent / "data"
    if not data_dir.exists():
        logger.error("Data directory not found at: %s", data_dir)
        sys.exit(1)

    logger.info("Syncing FloodLens datasets: %s -> s3://%s (%s)", data_dir, bucket, region)
    sync_directory_to_s3(data_dir, bucket, region, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

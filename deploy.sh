#!/usr/bin/env bash
set -euo pipefail

REGION="${1:-ap-south-1}"
STACK_NAME="${2:-floodlens-production}"
DRY_RUN="${3:-false}"

echo "=========================================================="
echo " FloodLens - Automated AWS Cloud Deployment Pipeline     "
echo "=========================================================="
echo "Target Region: $REGION"
echo "Stack Name:    $STACK_NAME"

# 1. Check AWS credentials
echo -e "\n[Step 1/5] Verifying AWS credentials..."
CALLER_IDENTITY=$(aws sts get-caller-identity --output json)
ACCOUNT_ID=$(echo "$CALLER_IDENTITY" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
echo " Authenticated Account: $ACCOUNT_ID"

PYTHON_BIN=$(command -v python3 || command -v python || echo "python")

if [ "$DRY_RUN" = "true" ] || [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "\n[Step 2/5] (Dry-Run) Simulating S3 dataset sync..."
    "$PYTHON_BIN" scripts/sync_s3.py --dry-run --region "$REGION"
    echo -e "\n[Step 3/5] (Dry-Run) Validating CloudFormation template..."
    aws cloudformation validate-template --template-body file://infra/floodlens-stack.yaml --region "$REGION"
    echo -e "\n[Dry-Run Succeeded] All templates and scripts validated cleanly."
    exit 0
fi

# 2. Ensure ECR repository exists
REPO_NAME="floodlens-backend"
echo -e "\n[Step 2/5] Checking Amazon ECR repository: $REPO_NAME..."
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"

if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo " Creating private ECR repository: $REPO_NAME"
    aws ecr create-repository --repository-name "$REPO_NAME" --region "$REGION" --image-scanning-configuration scanOnPush=true > /dev/null
fi

# 3. Build & Push Docker image
echo -e "\n[Step 3/5] Building and pushing backend Docker image..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

IMAGE_TAG="$ECR_URI:latest"
docker build -t "$IMAGE_TAG" ./backend
docker push "$IMAGE_TAG"

# 4. Deploy CloudFormation Stack
echo -e "\n[Step 4/5] Deploying CloudFormation infrastructure stack: $STACK_NAME..."
CURRENT_STATUS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].StackStatus" --output text 2>/dev/null || true)
if [ "$CURRENT_STATUS" = "ROLLBACK_COMPLETE" ]; then
    echo " Detected stack in ROLLBACK_COMPLETE. Deleting previous failed stack before clean recreate..."
    aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
    aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$REGION"
fi

aws cloudformation deploy \
    --template-file infra/floodlens-stack.yaml \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides ImageUri="$IMAGE_TAG" \
    --region "$REGION"

# Ensure Function URL invoke permission is present
aws lambda add-permission \
    --function-name "floodlens-backend-prod" \
    --statement-id AllowPublicInvokeViaFunctionUrl \
    --action lambda:InvokeFunction \
    --principal "*" \
    --invoked-via-function-url \
    --region "$REGION" 2>/dev/null || true

# Get outputs
BACKEND_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='BackendUrl'].OutputValue" --output text)
BACKEND_URL="${BACKEND_URL%/}"
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)

# 5. Sync S3 datasets
echo -e "\n[Step 5/5] Syncing Chennai scientific datasets to S3 bucket: $BUCKET_NAME..."
"$PYTHON_BIN" scripts/sync_s3.py --bucket "$BUCKET_NAME" --region "$REGION"

echo "=========================================================="
echo " FloodLens AWS Deployment Successful!                     "
echo "=========================================================="
echo "Backend API URL:     $BACKEND_URL"
echo "Backend Health Path: $BACKEND_URL/api/v1/health"
echo "S3 Data Bucket:      s3://$BUCKET_NAME"
echo ""
echo "Next Step: Configure Frontend Vercel / Environment:"
echo "Update NEXT_PUBLIC_API_BASE_URL to: $BACKEND_URL/api/v1"
echo "3. Deploy!"

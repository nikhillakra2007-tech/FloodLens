<#
.SYNOPSIS
    FloodLens - One-Command Automated AWS Deployment Script (Windows PowerShell)

.DESCRIPTION
    Deploys FloodLens to AWS with complete safety controls:
    1. Validates AWS CLI credentials & active IAM identity
    2. Builds & pushes backend container to Amazon ECR
    3. Deploys CloudFormation stack (App Runner, S3, IAM Roles, Bedrock, CloudWatch)
    4. Syncs scientific datasets and GeoJSON manifests to private S3 bucket
    5. Displays live health endpoint and frontend Amplify setup instructions

.PARAMETER Region
    AWS region (defaults to ap-south-1)

.PARAMETER StackName
    CloudFormation stack name (defaults to floodlens-production)

.PARAMETER DryRun
    Simulates deployment checks without provisioning cloud resources
#>

[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "floodlens-production",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " FloodLens - Automated AWS Cloud Deployment Pipeline     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Region: $Region" -ForegroundColor Yellow
Write-Host "Stack Name:    $StackName" -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "[DRY-RUN MODE ENABLED] No live resources will be created." -ForegroundColor Magenta
}

# 1. Check AWS CLI and credentials
Write-Host "`n[Step 1/5] Verifying AWS credentials..." -ForegroundColor Green
try {
    $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host " Authenticated as Account: $($callerIdentity.Account)" -ForegroundColor DarkGreen
    Write-Host " IAM Principal ARN:       $($callerIdentity.Arn)" -ForegroundColor DarkGreen
} catch {
    Write-Host "❌ AWS CLI is not configured or credentials have expired." -ForegroundColor Red
    Write-Host "   Run 'aws configure' or set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY." -ForegroundColor Yellow
    exit 1
}

if ($DryRun) {
    Write-Host "`n[Step 2/5] (Dry-Run) Simulating S3 dataset synchronization..." -ForegroundColor Green
    python scripts/sync_s3.py --dry-run --region $Region
    Write-Host "`n[Step 3/5] (Dry-Run) Validating CloudFormation template..." -ForegroundColor Green
    aws cloudformation validate-template --template-body file://infra/floodlens-stack.yaml --region $Region
    Write-Host "`n[Dry-Run Succeeded] All templates and scripts validated cleanly." -ForegroundColor Cyan
    exit 0
}

# 2. Ensure ECR Repository exists
$repoName = "floodlens-backend"
Write-Host "`n[Step 2/5] Checking Amazon ECR repository: $repoName..." -ForegroundColor Green
$ecrUri = "$($callerIdentity.Account).dkr.ecr.$Region.amazonaws.com/$repoName"

$repoExists = $false
try {
    aws ecr describe-repositories --repository-names $repoName --region $Region --output json 2>$null | Out-Null
    $repoExists = $true
} catch {
    $repoExists = $false
}

if (-not $repoExists) {
    Write-Host " Creating private ECR repository: $repoName" -ForegroundColor Yellow
    aws ecr create-repository --repository-name $repoName --region $Region --image-scanning-configuration scanOnPush=true | Out-Null
}

# 3. Build, Tag, and Push Docker image
Write-Host "`n[Step 3/5] Building and pushing backend Docker image..." -ForegroundColor Green
$loginPassword = aws ecr get-login-password --region $Region
$loginPassword | docker login --username AWS --password-stdin "$($callerIdentity.Account).dkr.ecr.$Region.amazonaws.com"

$imageTag = "$ecrUri`:latest"
Write-Host " Building Docker image: $imageTag" -ForegroundColor Yellow
docker build -t $imageTag ./backend

Write-Host " Pushing Docker image to Amazon ECR..." -ForegroundColor Yellow
docker push $imageTag

# 4. Deploy CloudFormation Stack
Write-Host "`n[Step 4/5] Deploying CloudFormation infrastructure stack: $StackName..." -ForegroundColor Green
aws cloudformation deploy `
    --template-file infra/floodlens-stack.yaml `
    --stack-name $StackName `
    --capabilities CAPABILITY_NAMED_IAM `
    --parameter-overrides ImageUri=$imageTag `
    --region $Region

# Fetch outputs
$outputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs" --output json | ConvertFrom-Json
$backendUrl = ($outputs | Where-Object { $_.OutputKey -eq "AppRunnerServiceUrl" }).OutputValue
$bucketName = ($outputs | Where-Object { $_.OutputKey -eq "S3BucketName" }).OutputValue

# 5. Sync S3 datasets and manifests
Write-Host "`n[Step 5/5] Syncing Chennai scientific datasets to S3 bucket: $bucketName..." -ForegroundColor Green
python scripts/sync_s3.py --bucket $bucketName --region $Region

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " FloodLens AWS Deployment Successful!                     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Backend API URL:     $backendUrl" -ForegroundColor Cyan
Write-Host "Backend Health Path: $backendUrl/api/v1/health" -ForegroundColor Cyan
Write-Host "S3 Data Bucket:      s3://$bucketName" -ForegroundColor Cyan

Write-Host "`nNext Step: Frontend AWS Amplify Deployment:" -ForegroundColor Yellow
Write-Host "1. In AWS Amplify Console, connect your Git repository."
Write-Host "2. Add the environment variable:"
Write-Host "   NEXT_PUBLIC_API_BASE_URL = $backendUrl/api/v1"
Write-Host "3. Click Save and Deploy!" -ForegroundColor DarkGreen

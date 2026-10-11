# AWS Deployment

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Amplify                        │
│              Frontend (Next.js)                  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│               App Runner                         │
│           Backend (FastAPI)                       │
├──────────┬──────────┬──────────┬────────────────┤
│   S3     │ Bedrock  │Strands   │  CloudWatch    │
│  Datasets│   LLM    │  Agent   │    Logs        │
└──────────┴────┬─────┴──────────┴────────────────┘
                │
┌───────────────▼────────────────────────────────┐
│          RDS PostgreSQL + PostGIS               │
│           Application Database                  │
└────────────────────────────────────────────────┘
```

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg2://user:pass@rds-endpoint:5432/floodlens
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
S3_BUCKET=floodlens-data
CORS_ORIGINS=https://your-amplify-domain.amplifyapp.com
AGENT_MODE=bedrock
LOG_LEVEL=INFO
```

## Deployment Steps

### 1. RDS PostgreSQL + PostGIS
- Create RDS instance (PostgreSQL 16)
- Enable PostGIS extension
- Run migrations: `cd backend && alembic upgrade head`
- Seed: `python scripts/seed_demo.py`

### 2. S3 Bucket
- Create bucket: `floodlens-data`
- Upload datasets: `aws s3 sync data/raw s3://floodlens-data/raw/`

### 3. App Runner (Backend)
- Build Docker image from `backend/Dockerfile`
- Push to ECR
- Create App Runner service with environment variables

### 4. Amplify (Frontend)
- Connect repository
- Set `NEXT_PUBLIC_API_URL` to App Runner endpoint
- Deploy

### 5. Bedrock + Strands
- Enable Bedrock model access in AWS Console
- Set `AGENT_MODE=bedrock`
- Agent uses boto3 credentials from IAM role

### 6. CloudWatch
- App Runner logs automatically streamed
- Custom metrics for investigation duration

## Local Development Without AWS

Set `AGENT_MODE=local` (default). All core functionality works locally with deterministic local agent. AWS integration activates when `AGENT_MODE=bedrock` and credentials are present.

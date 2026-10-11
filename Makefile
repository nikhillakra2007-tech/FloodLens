.PHONY: install db-up db-down migrate seed ingest test run-backend run-frontend

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

db-up:
	docker compose up -d db

db-down:
	docker compose down

migrate:
	cd backend && alembic upgrade head

seed:
	python scripts/seed_demo.py

ingest:
	python scripts/ingest_chennai.py

test:
	pytest backend/tests -v

run-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

#!/bin/bash

# Script to run e2e tests in Docker environment

# Ensure containers are stopped afterward even if something fails
function cleanup {
  echo "Cleaning up test containers..."
  docker-compose -f docker-compose.test.yml down
}

# Register the cleanup function to run on exit
trap cleanup EXIT

# Build and start the test containers
echo "Starting test environment..."
docker-compose -f docker-compose.test.yml build
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Check if tests passed
EXIT_CODE=$?

# Exit with the same code as the test container
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ E2E tests passed!"
else
  echo "❌ E2E tests failed!"
  exit $EXIT_CODE
fi

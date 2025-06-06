#!/bin/bash
# Script to build the Docker image for linux/amd64

IMAGE_NAME="d424-capstone-app"

echo "Building Docker image $IMAGE_NAME for platform linux/amd64..."
docker build --platform linux/amd64 -t "$IMAGE_NAME" .

echo "Docker image $IMAGE_NAME built successfully." 
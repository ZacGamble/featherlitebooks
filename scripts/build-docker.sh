#!/bin/bash
# Script to build the Docker image for linux/amd64

IMAGE_NAME="featherlitebooks-linux-amd64"

echo "Building Docker image $IMAGE_NAME for platform linux/amd64..."
docker build --platform linux/amd64 -t "$IMAGE_NAME" .

echo "Docker image $IMAGE_NAME built successfully." 
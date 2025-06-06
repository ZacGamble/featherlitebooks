#!/bin/bash
# Script to tag the Docker image and push it to Google Container Registry (GCR)

LOCAL_IMAGE_NAME="d424-capstone-app"
PROJECT_ID="featherlitebooks"
GCR_HOSTNAME="us.gcr.io"
IMAGE_TAG="latest"

GCR_IMAGE_PATH="$GCR_HOSTNAME/$PROJECT_ID/$LOCAL_IMAGE_NAME:$IMAGE_TAG"

echo "Tagging Docker image $LOCAL_IMAGE_NAME for GCR as $GCR_IMAGE_PATH..."
docker tag "$LOCAL_IMAGE_NAME" "$GCR_IMAGE_PATH"

echo "Pushing Docker image $GCR_IMAGE_PATH to GCR..."
# Ensure you have authenticated Docker with GCR: gcloud auth configure-docker $GCR_HOSTNAME --quiet
docker push "$GCR_IMAGE_PATH"

echo "Docker image $GCR_IMAGE_PATH pushed successfully to GCR." 
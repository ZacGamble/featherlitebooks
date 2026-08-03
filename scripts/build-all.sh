#!/bin/bash
# This script builds and pushes the application to Google Cloud Registry,
# and then deploys the new image to Google Cloud Run.
# 'set -e' ensures the script will exit immediately if any command fails.
set -e

# --- Configuration ---
IMAGE_NAME="featherlitebooks-linux-amd64"
PROJECT_ID="featherlitebooks"
GCR_HOSTNAME="us.gcr.io"
IMAGE_TAG="latest"
GCR_IMAGE_PATH="$GCR_HOSTNAME/$PROJECT_ID/$IMAGE_NAME:$IMAGE_TAG"
SERVICE_NAME="featherlitebooks"
REGION="us-west1"

# --- Step 1: Build the Expo Web Application ---
echo "Building Expo web application..."
npx expo export -p web
echo "Expo web build complete. Output is in the dist/ directory."

# --- Step 2: Build a fresh Docker Image ---
echo "Building fresh Docker image '$IMAGE_NAME' for platform linux/amd64..."
# --no-cache is used to ensure the latest code from the 'dist' directory is included.
docker build --no-cache --platform linux/amd64 -t "$IMAGE_NAME" .
echo "Docker image '$IMAGE_NAME' built successfully."

# --- Step 3: Tag and Push Docker Image to GCR ---
echo "Tagging Docker image '$IMAGE_NAME' for GCR as '$GCR_IMAGE_PATH'..."
docker tag "$IMAGE_NAME" "$GCR_IMAGE_PATH"

echo "Pushing Docker image '$GCR_IMAGE_PATH' to GCR..."
# Note: Ensure you have authenticated Docker with GCR first:
# gcloud auth configure-docker $GCR_HOSTNAME --quiet
docker push "$GCR_IMAGE_PATH"
echo "Docker image pushed successfully to GCR."

# --- Step 4: Deploy to Google Cloud Run ---
echo "Deploying service '$SERVICE_NAME' with image '$GCR_IMAGE_PATH'..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$GCR_IMAGE_PATH" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --project="$PROJECT_ID" \
    --update-secrets=EXPO_PUBLIC_SUPABASE_URL=supabase-url:latest,EXPO_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key:latest \
    --quiet

echo "Deployment complete."
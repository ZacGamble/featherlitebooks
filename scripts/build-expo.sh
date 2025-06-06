#!/bin/bash
# Script to build the Expo web application

echo "Building Expo web application..."
npx expo export -p web

echo "Expo web build complete. Output is in the dist/ directory." 
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the build output (dist directory)
COPY dist/ ./dist/

# Install a simple HTTP server
RUN npm install -g serve

# Expose port (serve defaults to 3000)
EXPOSE 8080

# Command to run the app
CMD ["serve", "-s", "dist", "-l", "8080"] 
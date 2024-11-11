# Stage 1: Build
FROM node:18 AS build
# Set the working directory
WORKDIR /app
# Copy the package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install
# Copy the rest of the files and build the app
COPY . .
RUN npm run build
# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
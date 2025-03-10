# Build Stage
ARG NODE_VERSION=18.16.0
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production
# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf
# Copy the built application from the build stage
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;" ]
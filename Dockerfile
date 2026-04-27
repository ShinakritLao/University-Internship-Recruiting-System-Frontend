# Multi-stage build for Vite + React frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY yarn.lock* ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

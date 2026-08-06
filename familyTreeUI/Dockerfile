# Dockerfile in familytree/frontend

FROM node:22-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM registry.redhat.io/rhel9/nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

FROM nginx:stable-alpine-slim

RUN sed -i '1idaemon off;' /etc/nginx/nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy your built application files into the NGINX serving directory
ADD dist/ /app

# The base image handles the standard SPA routing config
EXPOSE 80
CMD ["nginx"]

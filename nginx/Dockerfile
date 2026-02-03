# ============================================
# Nginx reverse proxy for production
# - Serves frontend static files
# - Proxies /api requests to backend
# ============================================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY templates/ /etc/nginx/templates/

# Create directory for frontend files
RUN mkdir -p /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

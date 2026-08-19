#!/bin/bash

# VPS Setup Script for AI Agents Trading Enterprise
# Target OS: Ubuntu 22.04 LTS

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting VPS Hardening & Software Installation...${NC}"

# 1. Update System
echo -e "${GREEN}Updating package lists...${NC}"
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Core Dependencies
echo -e "${GREEN}Installing Docker, Docker Compose, Nginx, and Certbot...${NC}"
sudo apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    curl \
    git

# 3. Configure Firewall (UFW)
echo -e "${GREEN}Configuring UFW Firewall...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
echo "y" | sudo ufw enable

# 4. Docker Setup
echo -e "${GREEN}Configuring Docker...${NC}"
sudo systemctl enable docker
sudo systemctl start docker
# Allow running docker without sudo for the current user
sudo usermod -aG docker $USER

# 5. Nginx Basic Setup
echo -e "${GREEN}Configuring Nginx...${NC}"
sudo systemctl enable nginx
sudo systemctl start nginx

# 6. SSL Automation (Certbot)
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "SSL Setup: To finalize HTTPS, please run the following command:"
echo -e "${GREEN}sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com${NC}"
echo -e "The auto-renewal timer is already installed by the certbot package."
echo -e "${BLUE}--------------------------------------------------${NC}"

echo -e "${BLUE}VPS Setup Complete!${NC}"
echo -e "Please log out and log back in for Docker group changes to take effect."
echo -e "Next steps:"
echo -e "1. Update /etc/nginx/conf.d/enterprise.conf with your domain."
echo -e "2. Run the Certbot command shown above."
echo -e "3. Deploy your application using docker-compose."

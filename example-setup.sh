#!/bin/bash

# Update and install necessary packages
sudo apt update
sudo apt install -y curl build-essential

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo apt-key add -
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Create a new user
sudo useradd -m -s /bin/bash queueue-api

# Set up the Rust project
cd $HOME
git clone https://github.com/oeb25/queueue.git queueue
cd $HOME/queueue
source $HOME/.cargo/env
cargo build --release

# Copy to the user queueue-api's home
sudo cp $HOME/server /home/queueue-api/server

# Or, copy from a local build
# cargo zigbuild --target x86_64-unknown-linux-gnu --release
# scp target/x86_64-unknown-linux-gnu/release/server root@<ip>:server

# Create a systemd service file
sudo tee /etc/systemd/system/queueue-api.service > /dev/null <<EOL
[Unit]
Description=Queueue API Service
After=network.target

[Service]
User=queueue-api
ExecStart=/home/queueue-api/server
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable queueue-api.service
sudo systemctl start queueue-api.service

# Configure Caddy
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOL
https://queueue-api.bvng.dk {
    reverse_proxy localhost:8081
}
EOL

# Restart Caddy to apply the new configuration
sudo systemctl restart caddy

echo "Setup complete. Your Rust application is running as a systemd service and exposed via Caddy."

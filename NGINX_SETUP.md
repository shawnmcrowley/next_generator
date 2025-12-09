Absolutely! Here's how to configure your locally installed nginx as a forward proxy to handle Zscaler certificate issues:

1. Get Zscaler CA Certificate
First, obtain the Zscaler root CA certificate and place it where nginx can access it:

bash

Collapse
Save
Copy
1
2
3
4
# Copy Zscaler CA certificate to nginx accessible location
sudo mkdir -p /etc/nginx/ssl
sudo cp zscaler-ca.crt /etc/nginx/ssl/
sudo chmod 644 /etc/nginx/ssl/zscaler-ca.crt
2. Configure nginx as Forward Proxy
Create or modify /etc/nginx/nginx.conf:

nginx

Collapse
Save
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
# /etc/nginx/nginx.conf

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 768;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL settings with Zscaler CA
    ssl_trusted_certificate /etc/nginx/ssl/zscaler-ca.crt;
    ssl_verify_depth 5;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # HTTP Forward Proxy (port 3128)
    server {
        listen 3128;
        listen [::]:3128;

        # Allow proxy connections from Docker containers
        allow 127.0.0.1;
        allow 172.16.0.0/12;  # Docker default network
        allow 192.168.0.0/16; # Common internal networks
        deny all;

        location / {
            resolver 8.8.8.8;  # Google DNS
            proxy_pass http://$http_host$request_uri;
            proxy_set_header Host $http_host;
            
            # Handle Zscaler certificates
            proxy_ssl_trusted_certificate /etc/nginx/ssl/zscaler-ca.crt;
            proxy_ssl_verify on;
            proxy_ssl_verify_depth 5;
            proxy_ssl_session_reuse on;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
    }

    # HTTPS CONNECT Tunnel Proxy (port 3129)
    server {
        listen 3129;
        listen [::]:3129;

        allow 127.0.0.1;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;

        # CONNECT method support for HTTPS
        proxy_connect;
        proxy_connect_allow all;
        proxy_connect_connect_timeout 30s;
        proxy_connect_read_timeout 30s;
        proxy_connect_send_timeout 30s;

        # Zscaler certificate handling
        proxy_ssl_trusted_certificate /etc/nginx/ssl/zscaler-ca.crt;
        proxy_ssl_verify on;
        proxy_ssl_verify_depth 5;
    }
}
3. Configure Docker Containers to Use the Proxy
Update your Docker Compose files:

For Ollama:
yaml

Collapse
Save
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
⌄
⌄
⌄
⌄
⌄
⌄
⌄
version: '3.8'

services:
  ollama:
    image: ollama/ollama
    environment:
      - HTTP_PROXY=http://host.docker.internal:3128
      - HTTPS_PROXY=http://host.docker.internal:3128
      - NO_PROXY=localhost,127.0.0.1
    volumes:
      - ollama_data:/root/.ollama
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped

volumes:
  ollama_data:
For n8n:
yaml

Collapse
Save
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
⌄
⌄
⌄
⌄
⌄
⌄
⌄
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    environment:
      - HTTP_PROXY=http://host.docker.internal:3128
      - HTTPS_PROXY=http://host.docker.internal:3128
      - NO_PROXY=localhost,127.0.0.1
    volumes:
      - n8n_data:/home/node/.n8n
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped

volumes:
  n8n_data:
4. Test and Start the Proxy
bash

Collapse
Save
Copy
1
2
3
4
5
6
7
8
9
10
11
# Test nginx configuration
sudo nginx -t

# Start nginx (if not running)
sudo systemctl start nginx

# Or reload configuration
sudo systemctl reload nginx

# Enable on boot
sudo systemctl enable nginx
5. Test the Proxy
Test if the proxy is working:

bash

Collapse
Save
Copy
1
2
3
4
5
# Test HTTP proxy
curl -x http://localhost:3128 http://httpbin.org/ip

# Test HTTPS through proxy (this should now work with Zscaler)
curl -x http://localhost:3128 https://httpbin.org/ip
6. Configure Docker Daemon Proxy (Alternative)
If you want ALL Docker containers to use the proxy, configure the Docker daemon:

Create /etc/systemd/system/docker.service.d/http-proxy.conf:

ini

Collapse
Save
Copy
1
2
3
4
[Service]
Environment="HTTP_PROXY=http://localhost:3128"
Environment="HTTPS_PROXY=http://localhost:3128"
Environment="NO_PROXY=localhost,127.0.0.1"
Then restart Docker:

bash

Collapse
Save
Copy
1
2
sudo systemctl daemon-reload
sudo systemctl restart docker
7. Firewall Configuration
Ensure the proxy ports are accessible to Docker:

bash

Collapse
Save
Copy
1
2
# Allow Docker network to access proxy ports
sudo ufw allow from 172.16.0.0/12 to any port 3128,3129
8. Enhanced Logging (Optional)
For debugging, add detailed logging to nginx:

nginx

Collapse
Save
Copy
1
2
3
4
5
6
7
# Add to http block in nginx.conf
log_format proxy_format '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $body_bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       'proxy: "$proxy_host" "$upstream_addr"';

access_log /var/log/nginx/proxy.log proxy_format;
Key Points:
host.docker.internal: Special DNS name that points to host from containers
Port 3128: HTTP forward proxy
Port 3129: HTTPS CONNECT tunnel proxy
Zscaler CA: nginx now validates certificates using Zscaler's CA
This setup allows your Docker containers to route outbound HTTPS traffic through your local nginx, which properly handles Zscaler's certificate inspection without errors!

# Deploying your own instance of LinkPen
<div style="border-left: 4px solid #fab387; padding: 10px 9px 6px 10px;">
    <p><b>Please note:</b> This guide expects you to have at least some basic hosting knowledge.</p>
    <p>This guide does not cover <a href="https://docs.linkpen.xyz/configuration.html" target="_blank">configuring</a> or <a href="https://docs.linkpen.xyz/development.html" target="_blank">development</a>.</p>
    <p>Additionally, this guide only provides <b>extremely basic</b> Nginx configuration files that are not necessarily production ready, and assumes you already have Nginx installed and working!</p>
</div>

This guide uses [`GNU nano`](https://nano-editor.org/), assuming you are editing code directly from console on a VPS or server.
This guide also uses [nginx](https://nginx.org/) as a proxy manager. **This guide does not provide a production ready nginx configuration!**

## Prerequisites

Before you begin, ensure you have:
- Node.js (v12 or higher)
- npm or yarn package manager (npm v10 or above)
- Basic knowledge of JavaScript/Node.js
- A text or code editor of your choice

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/sleepingami/linkpen.git
cd linkpen
```

or alternatively, if you want to clone to the current directory:
```bash
git clone https://github.com/sleepingami/linkpen.git .
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Customise configuration file:

To correctly configure your instance, you must modify the `global-variables.json` file.
<details>
<summary style="cursor:pointer;">Summary</summary>
<ul>
    <li>rootDomain - Your instances root domain. You must include http://</li>
    <li>hostPort - The port you want to use. We recommend 5500 or 8800.</li>
    <li>siteTitle - The title of your instance. Must be a string of 8 characters or less.</li>
    <li>discordInvite - An invite to your community discord. This is optional.</li>
    <li>database_key - A private database key. DO NOT SHARE THIS WITH ANYONE!</li>
    <li>isPublic - Set to true to allow account creations. You won't be able to create any accounts, not even your own, if this is false. The first account, preferrably yours, will be an admin account!</li>
</ul>
</details><br>

```json
{
  "rootDomain": "http://your-domain.com",
  "hostPort": "5500",
  "siteTitle": "LinkPen",
  "discordInvite": "https://discord.gg/your-invite-link",
  "database_key": "your_database_secret_key",
  "isPublic": false
}
```

### 4. Start the server:

If you want to modify the frontend code, you can freely do so with:
```bash
npm run dev
```

**We recommend using [pm2](https://pm2.keymetrics.io/) to keep your process alive.**

To install pm2:
```bash
npm install pm2 -g
```

**PLEASE NOTE:** We do not recommend running the server in `dev` mode using pm2. Instead, run:
```bash
pm2 start "npm run start" --name linkpen 
```

Afterward, to ensure you can resurrect after a system reboot:
```bash
pm2 save
```

To restart pm2 after a system-wide reboot, you can issue:
```bash
pm2 resurrect
```

Alternatively, if you do change the source code and want pm2 to fetch the new source code with changes:
```bash
pm2 restart linkpen
```

### 5. Nginx Configuration

_Assuming you have Nginx installed **and** setup_

Open the Nginx Configuration file (nano creates the file if it doesn't exist):
```bash
nano /etc/nginx/sites-available/linkpen
```

Write out the file. Replace `server_name` with your root domain (no http://), and replace `proxy_pass` with your port (`proxy_pass` requires http://). We use `5500` in this example.
```conf
server {
    server_name linkpen.domain;
    listen 80;
    server_name your.domain.xyz;

    location / {
        proxy_pass http://localhost:5500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Create symlink to sites-enabled:
```bash
sudo ln -s /etc/nginx/sites-available/linkpen /etc/nginx/sites-enabled/
```

Check Configuration (Nginx default healthcheck command):
```bash
nginx -t
```

Reload Nginx to apply updates:
```bash
systemctl reload nginx
```

## Quick Links

- [GitHub Repository](https://github.com/sleepingami/linkpen)
- [Live Demo](https://linkpen.xyz/) - [Mirror](https://demo.demo.linkpen.xyz)
- [Discord Community](https://discord.gg/pbV2eFEHBt)
- [Report an Issue](https://github.com/sleepingami/linkpen/issues)
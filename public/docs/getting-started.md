# Getting Started with LinkPen

This guide will help you get LinkPen up and running on your system.

## Prerequisites

Before you begin, ensure you have:
- Node.js (v12 or higher)
- npm or yarn package manager
- Basic knowledge of JavaScript/Node.js
- A text or code editor of your choice

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sleepingami/linkpen.git
cd linkpen
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration file:
```bash
# Create global-variables.json in the root directory
{
  "rootDomain": "your-domain.com",
  "hostPort": 5500,
  "siteTitle": "LinkPen",
  "discordInvite": "your-discord-invite-link"
}
```

4. Start the development server:
```bash
npm run dev
```

## First Steps

1. Visit `http://localhost:5500` (replace 5500 with your port) in your browser
2. Create an account through the sign-up button
3. Choose your custom URL
4. Start adding your links!

## Next Steps

- Read the [User Guide](./user-guide.md) to learn about features
- Check the [Configuration Guide](./configuration.md) for customization
- Join our [Discord](https://discord.gg/your-invite) for community support
- Go back to the [Index](./index.md)
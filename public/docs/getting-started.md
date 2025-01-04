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
or alternatively, if you want to clone to the current directory:
```bash
git clone https://github.com/sleepingami/linkpen.git .
```

2. Install dependencies:
```bash
npm install
```

3. Customise configuration file:
```json
{
  "rootDomain": "http://your-domain.com",                 // NOTE: Adding http:// is mandatory. HTTPS is recommended!
  "hostPort": "5500",
  "siteTitle": "LinkPen",                                 // String; 8 characters or less
  "discordInvite": "https://discord.gg/your-invite-link", // Preferrably a permanent link
  "database_key": "your_database_secret_key",             // DO NOT SHARE THIS KEY WITH ANYONE!
  "isPublic": false                                       // Set this to true if you want to allow anyone to use your instance
}
```

4. Start the development server:
```bash
npm run dev
```
or alternatively, if you don't want to modify source code:
```bash
npm run start
```

## First Steps

1. Visit `http://localhost:5500` (replace 5500 with the port specified in step 3) in your browser
2. Create an account through the sign-up button
3. Choose your custom URL
4. OPTIONAL - Choose a theme!
5. Start adding your links!

## Next Steps

- Read the [User Guide](./user-guide.md) to learn about features
- Check the [Configuration Guide](./configuration.md) for customization
- Join our [Discord](https://discord.gg/pbV2eFEHBt) for community support
- Go back to the [Index](./index.md)

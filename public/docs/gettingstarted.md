# LinkPen Documentation

LinkPen is an open-source, self-hosted alternative to Linktree that allows you to create a personalized landing page with all your important links in one place.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)

## Features
- Create personalized link landing pages
- Customizable themes (currently includes dark theme)
- Easy to deploy and self-host
- No subscription fees
- Open-source and customizable

## Prerequisites
- Node.js (v12 or higher recommended)
- npm or yarn package manager
- Basic knowledge of JavaScript/Node.js
<!-- - Firebase -->

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

3. Create a `global-variables.json` file in the root directory:
```json
{
  "rootDomain": "your-domain.com",
  "hostPort": 5500,
  "siteTitle": "LinkPen",
  "discordInvite": "your-discord-invite-link"
}
```

4. Start the server:
```bash
node server.js
```

The application will be available at `http://localhost:5500` (or your configured port).

## Configuration

### Firebase Setup
1. ...
2. ...
3. ...
4. ...

## Usage

### Creating Your Link Page
1. Visit your deployed LinkPen instance
2. Click "Sign Up" in the top right corner
3. Choose your custom URL: `yourdomain.com/yourname`
4. Add your social media links and customize your page

### Customization
LinkPen supports customization through:
- Custom CSS (`/public/css/style.css`)
- EJS templates (`/views/pages/`)
- Custom themes (currently supports dark theme)

### Templates
Custom templates are available in the `/public/templates` directory. You can:
- Use existing templates
- Create new templates
- Share templates with the community

## Development

### Project Structure
```
linkpen/
├── public/
│   ├── css/
│   ├── img/
│   ├── templates/              <-- i think ?? 
│   └── docs/
├── views/
│   ├── pages/
│   └── partials/
├── server.js
└── global-variables.json
```

### Adding New Features
1. Fork the repository
2. Create a new branch for your feature
3. Implement your changes
4. Submit a pull request

### To-Do List
Current planned features:
- Custom redirects for /auth and other app routes
- Account management system
- Database integration
- Additional customization options

## Contributing
We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

## Support
- Join our [Discord community](https://discord.gg/pbV2eFEHBt?fingerprint%3D1259998052031398020.h357E3GsI7Ruyl4Z3FSw1MvA8j0%26attemptId%3D0b25d4d8-c123-4b43-8527-cdcaa4a6734d&utm_source=linkpen&apn=com.discord&isi=985746746&ibi=com.hammerandchisel.discord&sd=Your%20place%20to%20talk%20with%20communities%20and%20friends.&efr=1&ifl=https%3A%2F%2Fdiscord.com%2Fapi%2Fdownload%2Fmobile%3Finvite_code%3pbV2eFEHBt) for help
- Check the [GitHub repository](https://github.com/sleepingami/linkpen) for issues and updates
- Read the [documentation](https://github.com/SleepingAmi/linkpen/tree/main/public/docs) for detailed guides
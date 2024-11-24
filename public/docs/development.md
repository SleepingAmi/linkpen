# Development Guide

This guide covers everything you need to know about developing with LinkPen.

## Project Structure

```
linkpen/
├── logs/                   # This folder is automatically generated and contains various debug logs
├── public/
│   ├── css/                # Stylesheets
│   ├── img/                # Images and assets
│   ├── templates/          # Templates
│   ├── js/                 # JavaScript
│   └── docs/               # Documentation
├── routes/                 # This folder contains various API routes
├── utils/                  # This folder has the custom event logger
├── views/
│   ├── pages/              # EJS page templates
│   │   ├── admin/          # Admin page templates
│   │   ├── auth/           # Auth page templates
│   │   └── dashboard/      # Dashboard page templates
│   └── partials/           # Reusable EJS components
├── server.js               # Main application file
├── config.js               # Auth catch-all
└── global-variables.json   # Global Variables
```

## Local Development

1. If you haven't already, install dependencies:
```bash
# Install development dependencies
npm install
```

2. Start development server with auto-reload:
```bash
npm run dev
```

## Creating Templates

Templates are stored in `public/templates/`. To create a new template:

1. Create a new directory for your template:
```bash
mkdir public/templates/my-template
```
or right-click and "create new folder"

2. Required files:
```
my-template/
├── template.ejs    # Template markup
└── style.css       # Template styles
└── config.json     # Optional template data
```

## Contributing

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/my-new-feature
```
3. Commit your changes
```bash
git commit -am 'Add some feature'
```
4. Push to the branch
```bash
git push origin feature/my-new-feature
```
5. Create a Pull Request

### Code Style Guidelines

- Use ESLint for JavaScript code style
- Follow the existing project structure
- Comment your code, adding documentation
- Add changes to `/public/docs` where applicable
- Write meaningful commit messages

See our [GitHub Issues](https://github.com/sleepingami/linkpen/issues) for more details.

## Next Steps

- Read the [User Guide](./user-guide.md) to learn about features
- Check the [Configuration Guide](./configuration.md) for customization
- Join our [Discord](https://discord.gg/pbV2eFEHBt) for community support
- Go back to the [Index](./index.md)
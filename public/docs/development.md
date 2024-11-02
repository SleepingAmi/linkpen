# Development Guide

This guide covers everything you need to know about developing with LinkPen.

## Project Structure

```
linkpen/
├── public/
│   ├── css/                # Stylesheets
│   ├── img/                # Images and assets
│   ├── templates/          # Templates
│   └── docs/               # Documentation
├── views/
│   ├── pages/              # EJS page templates
│   └── partials/           # Reusable EJS components
├── server.js               # Main application file
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

## Creating Templates <!-- (im not sure of any of this yet - sooox) -->

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
├── style.css       # Template styles
└── config.json     # Template configuration
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
- Add changes to /public/docs
- Write meaningful commit messages

## Building Features

Current development priorities:
- Authentication system
- Custom redirects
- Database integration
- Additional customization options

See our [GitHub Issues](https://github.com/sleepingami/linkpen/issues) for more details.
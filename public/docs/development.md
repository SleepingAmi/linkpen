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
├── utils/                  # This folder contains various tools
├── views/
│   ├── pages/              # EJS page templates
│   │   ├── admin/          # Admin page templates
│   │   ├── auth/           # Auth page templates
│   │   └── dashboard/      # Dashboard page templates
│   └── partials/           # Reusable EJS components
├── server.js               # Main application file
├── config.js               # Auth catch-all
├── global-variables.json   # Global Variables
└── database.sqlite         # SQLite Database (auto-generated)
```

## Local Development

1. If you haven't already, install dependencies:
```bash
# Install development dependencies
npm install
```

2. Modify the `global-variables.json`:
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

3. Start development server with auto-reload:
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
```

Additionally, you will need to modify the `config` file at `public/templates/config.json`

```json

{
    "default": {
        "name": "Catppuccin Frappé (Default)",
        "author": "Linkpen Dev team",
        "description": "😸 Soothing pastel theme for the high-spirited!"
    },
    "your_theme": {
        "name": "yourTheme",
        "author": "You :)",
        "description": "Wow, a description."
    }
}
```
*replace `your_theme` with your theme's folder name and fill in the details according to your theme.

\*\*For a more in-depth guide, navigate to [Templates](./templates.md)

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
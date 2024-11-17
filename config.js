const config = {
    reservedUsernames: [
        'about',
        'admin',
        'api',
        'auth',
        'login',
        'logout',
        'register',
        'settings',
        'profile',
        '404',
        'templates',
        'docs',
        'documentation',
        'help',
        'support',
        'terms',
        'privacy',
        'legal',
        'contact',
        'dashboard'
    ],

    passwordRequirements: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: true,
        allowedSpecialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }
};

module.exports = config;
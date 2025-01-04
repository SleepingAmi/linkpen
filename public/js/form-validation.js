document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Create validation message containers
    const usernameValidation = document.createElement('div');
    usernameValidation.className = 'validation-messages';
    const passwordValidation = document.createElement('div');
    passwordValidation.className = 'validation-messages';

    // Insert after respective inputs
    usernameInput.parentNode.appendChild(usernameValidation);
    passwordInput.parentNode.appendChild(passwordValidation);

    function validateUsername(username) {
        const messages = [];
        const hasValidLength = username.length >= 3 && username.length <= 20;
        const hasValidChars = /^[a-zA-Z0-9_-]*$/.test(username);

        if (!username) {
            return messages;
        }

        messages.push({
            valid: hasValidLength,
            message: 'Between 3 and 20 characters'
        });
        messages.push({
            valid: hasValidChars,
            message: 'Only letters, numbers, underscores, and hyphens'
        });

        return messages;
    }

    function validatePassword(password) {
        const messages = [];

        if (!password) {
            messages.push({
                valid: false,
                message: 'Password is required'
            });
            return messages;
        }

        messages.push({
            valid: password.length >= 8,
            message: 'At least 8 characters'
        });
        messages.push({
            valid: password.length <= 128,
            message: 'No more than 128 characters'
        });
        messages.push({
            valid: /[A-Z]/.test(password),
            message: 'At least one uppercase letter'
        });
        messages.push({
            valid: /[a-z]/.test(password),
            message: 'At least one lowercase letter'
        });
        messages.push({
            valid: /[0-9]/.test(password),
            message: 'At least one number'
        });

        return messages;
    }

    function updateValidationMessages(container, messages) {
        container.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'validation-message ' + (msg.valid ? 'valid' : 'invalid');
            const icon = msg.valid ? '✔' : '✖';
            div.innerHTML = `<span class="validation-icon">${icon}</span> ${msg.message}`;
            container.appendChild(div);
        });
    }

    usernameInput.addEventListener('input', function () {
        const messages = validateUsername(this.value);
        updateValidationMessages(usernameValidation, messages);
    });

    passwordInput.addEventListener('input', function () {
        const messages = validatePassword(this.value);
        updateValidationMessages(passwordValidation, messages);
    });

    form.addEventListener('submit', function (e) {
        const usernameMessages = validateUsername(usernameInput.value);
        const passwordMessages = validatePassword(passwordInput.value);

        const usernameValid = usernameMessages.every(msg => msg.valid);
        const passwordValid = passwordMessages.every(msg => msg.valid);

        if (!usernameValid || !passwordValid) {
            e.preventDefault();
            updateValidationMessages(usernameValidation, usernameMessages);
            updateValidationMessages(passwordValidation, passwordMessages);
        }
    });
});
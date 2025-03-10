// src/utils/validation.js

export const isRequired = (value) => {
    if (!value || value.trim() === '') {
        return 'Field cannot be blank';
    }
    return undefined;
};

export const isValidEmail = (value) => {
    if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
        return 'Invalid email format';
    }
    return undefined;
};

export const isValidPhoneNumber = (value) => {
    if (value && value.length !== 8) {
        return 'Invalid phone number';
    }
    return undefined;
};

export const isNotWeekend = (dateString) => {
    if (dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'Weekend dates are not allowed';
        }
    }
    return undefined;
};

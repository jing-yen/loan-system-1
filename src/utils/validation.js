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

export const borrowFormValidationSchema = (formData, fields, requiresApproval) => {
    let newErrors = {};

    fields.forEach(field => {
        if (!requiresApproval && (field.name === 'project_supervisor_name' || field.name === 'supervisor_email')) {
            return; // Skip validation for supervisor fields if approval is not required
        }
        const value = formData[field.name];
        switch (field.type) {
            case 'text':
                if (field.name !== 'additional_remarks'){
                    const requiredError = isRequired(value);
                    if (requiredError) newErrors[field.name] = requiredError;
                }
                break;
            case 'email':
                const requiredEmailError = isRequired(value);
                if (requiredEmailError) newErrors[field.name] = requiredEmailError;
                const emailError = isValidEmail(value);
                if (emailError && !newErrors[field.name]) newErrors[field.name] = emailError; // Only add if no required error
                break;
            case 'tel':
                const requiredTelError = isRequired(value);
                if (requiredTelError) newErrors[field.name] = requiredTelError;
                const telError = isValidPhoneNumber(value);
                if (telError && !newErrors[field.name]) newErrors[field.name] = telError; // Only add if no required error
                break;
            case 'date':
                const requiredDateError = isRequired(value);
                if (requiredDateError) newErrors[field.name] = requiredDateError;
                const weekendError = isNotWeekend(value);
                if (weekendError && !newErrors[field.name]) newErrors[field.name] = weekendError; // Only add if no required error
                break;
            default:
                if (field.name !== 'additional_remarks'){
                    const defaultRequiredError = isRequired(value);
                    if (defaultRequiredError) newErrors[field.name] = defaultRequiredError;
                }
        }
    });
    return newErrors;
};

export const collectFormValidationSchema = (formData, fields, isVerified) => {
    let newErrors = {};

    if (!isVerified) {
        newErrors['verify'] = 'Get a staff to verify your collection';
    }

    fields.forEach(field => {
        const value = formData[field.name];
        switch (field.type) {
            case 'text':
                if (field.name !== 'serial_numbers'){
                    const requiredError = isRequired(value);
                    if (requiredError) newErrors[field.name] = requiredError;
                }
                break;
            case 'date':
                const requiredDateError = isRequired(value);
                if (requiredDateError) newErrors[field.name] = requiredDateError;
                const weekendError = isNotWeekend(value);
                if (weekendError && !newErrors[field.name]) newErrors[field.name] = weekendError; // Only add if no required error
                break;
            default:
                if (field.name !== 'serial_numbers'){
                    const defaultRequiredError = isRequired(value);
                    if (defaultRequiredError) newErrors[field.name] = defaultRequiredError;
                }
        }
    });
    return newErrors;
};

export const returnFormValidationSchema = (formData, fields, isVerified, loanDetails) => {
    let newErrors = {};

    if (!isVerified) {
        newErrors['verify'] = 'Get a staff to verify your collection';
    }
    if (formData.phone?.trim() != loanDetails.student_phone) {
        newErrors['phone'] = 'Incorrect phone number';
    }


    fields.forEach(field => {
        const value = formData[field.name];
        switch (field.type) {
            case 'text':
                if (field.name !== 'additional_remarks'){
                    const requiredError = isRequired(value);
                    if (requiredError) newErrors[field.name] = requiredError;
                }
                break;
            case 'tel':
                const requiredTelError = isRequired(value);
                if (requiredTelError) newErrors[field.name] = requiredTelError;
                const telError = isValidPhoneNumber(value);
                if (telError && !newErrors[field.name]) newErrors[field.name] = telError; // Only add if no required error
                break;
            case 'date':
                const requiredDateError = isRequired(value);
                if (requiredDateError) newErrors[field.name] = requiredDateError;
                const weekendError = isNotWeekend(value);
                if (weekendError && !newErrors[field.name]) newErrors[field.name] = weekendError; // Only add if no required error
                break;
            default:
                if (field.name !== 'additional_remarks'){
                    const defaultRequiredError = isRequired(value);
                    if (defaultRequiredError) newErrors[field.name] = defaultRequiredError;
                }
        }
    });
    return newErrors;
};

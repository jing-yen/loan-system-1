// src/utils/validation.js

const isRequired = (value) => {
    if (!value || value.trim() === '') {
        return 'Field cannot be blank';
    }
    return undefined;
};

const isValidEmail = (value) => {
    if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
        return 'Invalid email format';
    }
    return undefined;
};

const isValidPhoneNumber = (value) => {
    if (value && value.length !== 8) {
        return 'Invalid phone number';
    }
    return undefined;
};

const isNotWeekend = (dateString) => {
    if (dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'Weekend dates are not allowed';
        }
    }
    return undefined;
};

// Validation rule registry
const validationRuleFunctions = {
    'required': isRequired,
    'emailFormat': isValidEmail,
    'phoneNumber': isValidPhoneNumber,
    'notWeekend': isNotWeekend,
};

// Schema definitions
export const borrowFormSchemaDefinition = {
    name: { type: 'text', rules: ['required'] },
    email: { type: 'email', rules: ['required', 'emailFormat'] },
    course_code: { type: 'text', rules: ['required'] },
    project_code: { type: 'text', rules: ['required'] },
    phone_number: { type: 'tel', rules: ['required', 'phoneNumber'] },
    start_usage_date: { type: 'date', rules: ['required', 'notWeekend'] },
    end_usage_date: { type: 'date', rules: ['required', 'notWeekend'] },
    project_supervisor_name: { type: 'text', rules: ['required'] }, // only checked when approval is required (otherwise field is disabled)
    supervisor_email: { type: 'email', rules: ['required'] }, // only checked when approval is required (otherwise field is disabled)
};

export const collectFormSchemaDefinition = {
    date: { type: 'date', rules: ['required', 'notWeekend'] },
    staff_name: { type: 'text', rules: ['required'] },
    serial_numbers: { type: 'textarea', rules: [] }, // not required
};

export const returnFormSchemaDefinition = {
    date: { type: 'date', rules: ['required', 'notWeekend'] },
    staff_name: { type: 'text', rules: ['required'] },
    phone: { type: 'tel', rules: ['required', 'phoneNumber'] },
};


// Generic validation function
export const genericValidationSchema = (formData, fields, schemaDefinition, extraValidation) => {
    let newErrors = {};

    fields.forEach(field => {
        const fieldSchema = schemaDefinition[field.name];
        if (fieldSchema && fieldSchema.rules) {
            fieldSchema.rules.forEach(ruleName => {
                const validationFn = validationRuleFunctions[ruleName];
                if (validationFn) {
                    const error = validationFn(formData[field.name]);
                    if (error && !newErrors[field.name]) { // Only add the first error for the field
                        newErrors[field.name] = error;
                    }
                }
            });
        }
    });

    if (extraValidation) {
        const extraErrors = extraValidation(formData);
        newErrors = { ...newErrors, ...extraErrors };
    }

    return newErrors;
};

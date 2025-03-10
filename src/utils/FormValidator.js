class FormValidator {
    static validationRuleFunctions = {
        'required': FormValidator._isRequired,
        'emailFormat': FormValidator._isValidEmail,
        'phoneNumber': FormValidator._isValidPhoneNumber,
        'notWeekend': FormValidator._isNotWeekend,
    };

    static schemaDefinitions = {
        // Schema definitions by input type
        text: { rules: ['required'] },
        email: { rules: ['required', 'emailFormat'] },
        tel: { rules: ['required', 'phoneNumber'] },
        date: { rules: ['required', 'notWeekend'] },
        textarea: { rules: [] }, // No default rules for textarea
    };

    /**
     * Public method to validate form data against the schema.
     * @param {object} formData - The form data to validate.
     * @param {array} fields - Configuration array for form fields.
     * @param {function} [extraValidation] - An optional function for extra validation logic.
     * @returns {object} An object containing validation errors, where keys are field names and values are error messages.
     */
    static validate(formData, fields, extraValidation) {
        let newErrors = {};

        for (const field of fields) {
            const fieldSchema = FormValidator.schemaDefinitions[field.type];
            if (!fieldSchema || !fieldSchema.rules) {
                continue; // Skip fields without schema or rules
            }

            for (const ruleName of fieldSchema.rules) {
                const validationFn = FormValidator.validationRuleFunctions[ruleName];
                if (!validationFn) {
                    continue; // Skip unknown validation functions
                }
                try {
                    validationFn(formData[field.name]);
                } catch (error) {
                    newErrors[field.name] = error.message;
                    break; // Break after capturing the first error, no need to run further rules for this field
                }
            }
        }

        if (extraValidation) {
            Object.assign(newErrors, extraValidation(formData)); // Merge extra errors
        }

        return newErrors;
    }

    static _isRequired(value) {
        if (!value || value.trim() === '') {
            throw new Error('Field cannot be blank');
        }
    }

    static _isValidEmail(value) {
        if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
            throw new Error('Invalid email format');
        }
    }

    static _isValidPhoneNumber(value) {
        if (value && value.length !== 8) {
            throw new Error('Invalid phone number');
        }
    }

    static _isNotWeekend(dateString) {
        if (dateString) {
            const date = new Date(dateString);
            const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                throw new Error('Weekend dates are not allowed');
            }
        }
    }
}

export default FormValidator;

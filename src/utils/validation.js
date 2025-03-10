// src/utils/validation.js

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
                    if (!newErrors[field.name]) {
                        newErrors[field.name] = error.message; // Capture only the first error for each field
                    }
                    // Break after capturing the first error, no need to run further rules for this field
                    break;
                }
            }
        }

        if (extraValidation) {
            Object.assign(newErrors, extraValidation(formData)); // Merge extra errors
        }

        return newErrors;
    }

    /**
     * Private validation function for required fields.
     * Checks if a value is not null, undefined, or an empty string after trimming whitespace.
     * @param {*} value The value to validate.
     * @throws {Error} If the value is null, undefined, or an empty string.
     * @private
     */
    static _isRequired(value) {
        if (!value || value.trim() === '') {
            throw new Error('Field cannot be blank');
        }
    }

    /**
     * Private validation function for email format.
     * Uses a regular expression to check if the value is a valid email format.
     * @param {string} value The value to validate.
     * @throws {Error} If the value is not a valid email format.
     * @private
     */
    static _isValidEmail(value) {
        if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
            throw new Error('Invalid email format');
        }
    }

    /**
     * Private validation function for phone number format (8 digits).
     * Checks if the value is exactly 8 digits long.
     * @param {string} value The value to validate.
     * @throws {Error} If the value is not exactly 8 digits long.
     * @private
     */
    static _isValidPhoneNumber(value) {
        if (value && value.length !== 8) {
            throw new Error('Invalid phone number');
        }
    }

    /**
     * Private validation function to check for weekend dates.
     * Validates that the date string does not fall on a Saturday or Sunday.
     * @param {string} dateString The date string to validate.
     * @throws {Error} If the date falls on a weekend.
     * @private
     */
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

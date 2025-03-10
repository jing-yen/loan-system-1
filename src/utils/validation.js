// src/utils/validation.js

class FormValidator {
    static validationRuleFunctions = {
        'required': FormValidator._isRequired, // Rule for required fields
        'emailFormat': FormValidator._isValidEmail, // Rule for email format validation
        'phoneNumber': FormValidator._isValidPhoneNumber, // Rule for phone number validation
        'notWeekend': FormValidator._isNotWeekend, // Rule to check if date is not a weekend
    };

    static schemaDefinitions = {
        // Schema definitions by input type
        text: { rules: ['required'] },
        email: { rules: ['required', 'emailFormat'] },
        tel: { rules: ['required', 'phoneNumber'] },
        date: { rules: ['required', 'notWeekend'] },
        textarea: { rules: [] }, // No default rules for textarea
    };

    // Public method to validate form data against the schema.
    // Accepts formData, fields configuration, and an optional extraValidation function.
    static validate(formData, fields, extraValidation) {
        let newErrors = {};

        // Iterate over each field in the form configuration.
        fields.forEach(field => {
            // Retrieve the schema definition based on the field type.
            const fieldSchema = FormValidator.schemaDefinitions[field.type];
            // Check if a schema is defined for this field type and if it has validation rules.
            if (fieldSchema && fieldSchema.rules) {
                // Iterate over each validation rule defined in the field type's schema.
                fieldSchema.rules.forEach(ruleName => {
                    // Retrieve the validation function from the registry using the rule name.
                    const validationFn = FormValidator.validationRuleFunctions[ruleName];
                    if (validationFn) {
                        try {
                            // Execute the validation function with the field's value from formData.
                            validationFn(formData[field.name]);
                        } catch (error) {
                            // If an error is caught, it means validation failed, add the error message to newErrors.
                            if (!newErrors[field.name]) {
                                newErrors[field.name] = error.message;
                            }
                        }
                    }
                });
            }
        });

        // Apply extra validation if provided.
        if (extraValidation) {
            const extraErrors = extraValidation(formData);
            // Merge extra errors into the main errors object.
            newErrors = { ...newErrors, ...extraErrors };
        }

        // Return the object containing all validation errors.
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

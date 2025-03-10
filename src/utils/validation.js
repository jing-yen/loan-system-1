class FormValidator {
    static validationRuleFunctions = {
        'required': FormValidator._isRequired, // Rule for required fields
        'emailFormat': FormValidator._isValidEmail, // Rule for email format validation
        'phoneNumber': FormValidator._isValidPhoneNumber, // Rule for phone number validation
        'notWeekend': FormValidator._isNotWeekend, // Rule to check if date is not a weekend
    };

    static schemaDefinitions = {
        // Borrow Form Schema
        name: { type: 'text', rules: ['required'] },
        email: { type: 'email', rules: ['required', 'emailFormat'] },
        course_code: { type: 'text', rules: ['required'] },
        project_code: { type: 'text', rules: ['required'] },
        phone_number: { type: 'tel', rules: ['required', 'phoneNumber'] },
        start_usage_date: { type: 'date', rules: ['required', 'notWeekend'] },
        end_usage_date: { type: 'date', rules: ['required', 'notWeekend'] },
        project_supervisor_name: { type: 'text', rules: [] }, // No rules initially, conditionally validated in component
        supervisor_email: { type: 'email', rules: [] }, // No rules initially, conditionally validated in component

        // Collect Form Schema
        date: { type: 'date', rules: ['required', 'notWeekend'] },
        staff_name: { type: 'text', rules: ['required'] },
        serial_numbers: { type: 'textarea', rules: [] }, // No validation rules, not required

        // Return Form Schema
        phone: { type: 'tel', rules: ['required', 'phoneNumber'] }, // Shared type with borrowForm, context specific to returnForm
    };

    // Public method to validate form data against the schema.
    // Accepts formData, fields configuration, and an optional extraValidation function.
    static validate(formData, fields, extraValidation) {
        let newErrors = {};

        fields.forEach(field => {
            const fieldSchema = FormValidator.schemaDefinitions[field.name];
            if (fieldSchema && fieldSchema.rules) {
                fieldSchema.rules.forEach(ruleName => {
                    const validationFn = FormValidator.validationRuleFunctions[ruleName];
                    if (validationFn) {
                        try {
                            validationFn(formData[field.name]);
                        } catch (error) {
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

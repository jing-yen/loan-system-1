// src/utils/validation.js

class FormValidator {
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

    static validationRuleFunctions = {
        'required': FormValidator._isRequired, // Rule for required fields
        'emailFormat': FormValidator._isValidEmail, // Rule for email format validation
        'phoneNumber': FormValidator._isValidPhoneNumber, // Rule for phone number validation
        'notWeekend': FormValidator._isNotWeekend, // Rule to check if date is not a weekend
    };

    // Public method to validate form data against the schema.
    // Accepts formData, fields configuration, and an optional extraValidation function.
    static validate(formData, fields, extraValidation) { // Removed formName parameter
        let newErrors = {};

        // Iterate over each field in the form configuration.
        fields.forEach(field => {
            // Retrieve the schema definition for the current field using field.name as key.
            const fieldSchema = FormValidator.schemaDefinitions[field.name];
            // Check if a schema is defined for this field and if it has validation rules.
            if (fieldSchema && fieldSchema.rules) {
                // Iterate over each validation rule defined in the field's schema.
                fieldSchema.rules.forEach(ruleName => {
                    // Retrieve the validation function from the registry using the rule name.
                    const validationFn = FormValidator.validationRuleFunctions[ruleName];
                    if (validationFn) {
                        // Execute the validation function with the field's value from formData.
                        const error = validationFn(formData[field.name]);
                        // If an error is returned and no error has been recorded for this field yet,
                        // add the error message to the newErrors object.
                        if (error && !newErrors[field.name]) {
                            newErrors[field.name] = error;
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
     * @returns {string|undefined} An error message string if validation fails, undefined otherwise.
     * @private
     */
    static _isRequired(value) {
        if (!value || value.trim() === '') {
            return 'Field cannot be blank';
        }
        return undefined; // Return undefined if validation passes (no error).
    }

    /**
     * Private validation function for email format.
     * Uses a regular expression to check if the value is a valid email format.
     * @param {string} value The value to validate.
     * @returns {string|undefined} An error message string if validation fails, undefined otherwise.
     * @private
     */
    static _isValidEmail(value) {
        if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
            return 'Invalid email format';
        }
        return undefined; // Return undefined if validation passes (no error).
    }

    /**
     * Private validation function for phone number format (8 digits).
     * Checks if the value is exactly 8 digits long.
     * @param {string} value The value to validate.
     * @returns {string|undefined} An error message string if validation fails, undefined otherwise.
     * @private
     */
    static _isValidPhoneNumber(value) {
        if (value && value.length !== 8) {
            return 'Invalid phone number';
        }
        return undefined; // Return undefined if validation passes (no error).
    }

    /**
     * Private validation function to check for weekend dates.
     * Validates that the date string does not fall on a Saturday or Sunday.
     * @param {string} dateString The date string to validate.
     * @returns {string|undefined} An error message string if validation fails, undefined otherwise.
     * @private
     */
    static _isNotWeekend(dateString) {
        if (dateString) {
            const date = new Date(dateString);
            const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                return 'Weekend dates are not allowed';
            }
        }
        return undefined; // Return undefined if validation passes (no error).
    }
}

export default FormValidator;

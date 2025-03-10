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
        project_supervisor_name: { type: 'text', rules: ['required'] }, // only checked when approval is required
        supervisor_email: { type: 'email', rules: ['required'] }, // only checked when approval is required

        // Collect Form Schema
        date: { type: 'date', rules: ['required', 'notWeekend'] },
        staff_name: { type: 'text', rules: ['required'] },
        serial_numbers: { type: 'textarea', rules: [] }, // not required

        // Return Form Schema
        phone: { type: 'tel', rules: ['required', 'phoneNumber'] }, // sharing with borrowForm, but specific to returnForm in context
    };

    static validationRuleFunctions = {
        'required': FormValidator._isRequired,
        'emailFormat': FormValidator._isValidEmail,
        'phoneNumber': FormValidator._isValidPhoneNumber,
        'notWeekend': FormValidator._isNotWeekend,
    };

    static validate(formData, fields, formName, extraValidation) { // formName is not used to access schema anymore
        let newErrors = {};
        // const schemaDefinition = FormValidator.schemaDefinitions[formName]; // formName not used

        fields.forEach(field => {
            const fieldSchema = FormValidator.schemaDefinitions[field.name]; // directly use field.name to access schema
            if (fieldSchema && fieldSchema.rules) {
                fieldSchema.rules.forEach(ruleName => {
                    const validationFn = FormValidator.validationRuleFunctions[ruleName];
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
    }


    static _isRequired(value) {
        if (!value || value.trim() === '') {
            return 'Field cannot be blank';
        }
        return undefined;
    }

    static _isValidEmail(value) {
        if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())) {
            return 'Invalid email format';
        }
        return undefined;
    }

    static _isValidPhoneNumber(value) {
        if (value && value.length !== 8) {
            return 'Invalid phone number';
        }
        return undefined;
    }

    static _isNotWeekend(dateString) {
        if (dateString) {
            const date = new Date(dateString);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                return 'Weekend dates are not allowed';
            }
        }
        return undefined;
    }
}

export default FormValidator;

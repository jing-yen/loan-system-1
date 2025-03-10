import React, { useState, useEffect } from 'react';
import '../../styles/NewBorrowForm.css'; // Assuming you want to reuse the same styles

function ReusableForm({ formTitle, itemDescription, fields, validationSchema, onSubmit, submitButtonText, extraContent, successMessage }) {
    const [formData, setFormData] = useState(() => {
        return fields.reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
        }, {});
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        // Initialize form data if there are default values in fields
        const initialFormData = fields.reduce((acc, field) => {
            acc[field.name] = field.defaultValue || '';
            return acc;
        }, {});
        setFormData(initialFormData);
    }, [fields]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedErrors = { ...errors, [name]: '' };
        setFormData({ ...formData, [name]: value });
        setErrors(updatedErrors);
    };

    const validateForm = () => {
        let newErrors = validationSchema(formData);
        setErrors(newErrors);
        console.log('eror',newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        console.log('hihi:');
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (validateForm()) {
            try {
                console.log('Form submitting:', formData);
                await onSubmit(formData);
                setIsSubmitted(true);
            } catch (error) {
                console.error('Form submission error:', error);
                // Handle error appropriately, maybe set an error message state
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isSubmitting) return <div className="loading-message">Submitting...</div>;
    if (isSubmitted) return <div className="submission-success">{successMessage || "Form submitted successfully!"}</div>;


    return (
        <div className="form-container">
            <h3 className="form-heading">{formTitle}</h3>
            <div className="selected-items">
                {itemDescription}
            </div>

            <form onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div className="form-group" key={index}>
                        <label htmlFor={field.name}>{field.label}:</label>
                        {field.type === 'textarea' ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className={errors[field.name] ? 'input-error' : ''}
                            />
                        ) : (
                            <input
                                type={field.type || 'text'}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className={errors[field.name] ? 'input-error' : ''}
                                minLength={field.minLength}
                                maxLength={field.maxLength}
                            />
                        )}
                        {errors[field.name] && <p className="form-error">{errors[field.name]}</p>}
                    </div>
                ))}
                {extraContent}
                <button type="submit" disabled={isSubmitting} className="submit-button">{submitButtonText}</button>
            </form>
        </div>
    );
}

export default ReusableForm;

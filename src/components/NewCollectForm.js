import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/NewBorrowForm.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function NewCollectForm({verifiedByStaff, startVerification}) {
    const location = useLocation();
    const loanDetails = useMemo(() => location.state?.loanDetails || {});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        staff_name: '',
        serial_numbers: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Ensure 8 digit phone number
        if (name === 'phone' && value.length > 8) return;

        let updatedErrors = { ...errors, [name]: '' };
        const updatedFormData = { ...formData, [name]: value };

        // Check for weekend dates
        if (name === 'start_usage_date' || name === 'end_usage_date') {
            const date = new Date(value);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Sunday, 6 = Saturday
                updatedErrors[name] = 'Weekend dates are not allowed';
            }
        }

        setFormData(updatedFormData);
        setErrors(updatedErrors);
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        if (!verifiedByStaff) {
            newErrors['verify'] = 'Get a staff to verify your collection';
            isValid = false;
        }

        Object.keys(formData).forEach(key => {
            if (!formData[key].trim() && key !== 'additional_remarks') {
                newErrors[key] = 'Field cannot be blank';
                isValid = false;
            }

            if ((key === 'date') && formData[key]) {
                const date = new Date(formData[key]);
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    newErrors[key] = 'Weekend dates are not allowed';
                    isValid = false;
                }
            }
        });

        // Log the current validation state for debugging
        console.log("Validation Errors:", newErrors);
        console.log("Is Form Valid:", isValid);

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent further execution if already submitting
        setIsSubmitting(true); // Set early to prevent multiple submissions

        if (validateForm()) {
            try {
                const formDataToSend = {
                    ...formData,
                    status: 'Borrowed',
                    loan_id: loanDetails.transaction_id,
                    completion_time: new Date().toISOString()
                };

                console.log('Submitting form with data:', formDataToSend);
                await axios.post(API_URL+'/api/loan-status/update', formDataToSend);
                setIsSubmitted(true); // Set this on successful submission
            } catch (error) {
                console.error('Error submitting form:', error);
                setIsSubmitting(false); // Reset on error as well
            } finally {
                setIsSubmitting(false); // Always reset submitting state after the operation
            }
        } else {
            setIsSubmitting(false); // Reset if validation fails
        }
    };

    useEffect(() => window.scrollTo(0, 0), []);

    if (isSubmitting) return <div className="loading-message">Submitting...</div>;
    else if (isSubmitted) return <div className="submission-success">Form submitted successfully!</div>;

    return (
        <div className="form-container">
            <h3 className="form-heading">Items to Collect:</h3>
            <h2>{loanDetails.student_name}</h2>
            <div className="selected-items">
                {loanDetails?.loan_items?.length > 0 ? (
                    <ol className="selected-items-list">
                        {loanDetails.loan_items.map((item, index) => (
                            <li key={index}>{item.item_name} (Qty: {item.quantity})</li>
                        ))}
                    </ol>
                ) : (
                    <p onClick={console.log(loanDetails)}>No items selected.</p>
                )}
            </div>
            <h4>📆: {new Date(loanDetails.start_usage_date).toLocaleDateString()} to {new Date(loanDetails.end_usage_date).toLocaleDateString()}</h4>
            
            <hr/>
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).slice(0,-2).map((key, index) => {

                    return (
                        <div className="form-group" key={index}>
                            <label>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</label>
                            <input
                                type={key === 'phone' ? 'number' : (key.includes('date') ? 'date' : 'text')}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                minLength={key === 'phone' ? 8 : 0}
                                maxLength={key === 'phone' ? 8 : 0}
                                className={errors[key] ? 'input-error' : ''}
                            />
                            {errors[key] && <p className="form-error">{errors[key]}</p>}
                        </div>
                    );
                })}
                <div className="form-group">
                    <label>Serial Numbers:</label>
                    <label>Please type in separate lines</label>
                    <textarea
                        name={'serial_numbers'}
                        value={formData['serial_numbers']}
                        onChange={handleChange}
                        className={errors['serial_numbers'] ? 'input-error' : ''}
                    />
                    {errors['serial_numbers'] && <p className="form-error">{errors['serial_numbers']}</p>}
                </div>
                <hr/><br/>
                
                <div className="form-group">
                    <label>Updated by:</label>
                    <input
                        type={'text'}
                        name={'staff_name'}
                        value={formData['staff_name']}
                        onChange={handleChange}
                        className={errors['staff_name'] ? 'input-error' : ''}
                    />
                    {errors['staff_name'] && <p className="form-error">{errors['staff_name']}</p>}
                </div>
                <button type="button" onClick={startVerification} disabled={verifiedByStaff} className="submit-button">Step 1: {verifiedByStaff?'Verified':'Get A Staff to Verify'}</button>
                {errors['verify'] && <p className="form-error">{errors['verify']}</p>}
                <button type="submit" disabled={isSubmitting||!verifiedByStaff} className="submit-button">Step 2: Submit</button>
            </form>
        </div>
    );
}

export default NewCollectForm;
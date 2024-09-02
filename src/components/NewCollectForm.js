import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/NewBorrowForm.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function NewCollectForm() {
    const location = useLocation();
    const loanDetails = useMemo(() => location.state?.loanDetails || {});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const [formData, setFormData] = useState({
        phone: '',
        collection_date: '',
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

        Object.keys(formData).forEach(key => {
            if ((key === 'phone') && formData[key].trim() != loanDetails.student_phone) {
                newErrors[key] = 'Incorrect phone number';
                isValid = false;
            }

            if (!formData[key].trim() && key !== 'additional_remarks') {
                newErrors[key] = 'Field cannot be blank';
                isValid = false;
            }

            if ((key === 'collection_date') && formData[key]) {
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
                await axios.post('http://localhost:5000/api/loan-status/update', formDataToSend);
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

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const requestScreenLock = async () => {
        try {
            // Replace this with an actual base64-encoded credential ID
            const credentialId = 'dummyCredentialIdBase64'; 

            const publicKeyCredentialRequestOptions = {
                challenge: new Uint8Array([0x8C, 0xFA, 0xB3, 0xA9, 0x42, 0xF5, 0x89, 0xDE]), // Random example challenge
                allowCredentials: [{
                    id: base64ToArrayBuffer(credentialId),
                    transports: ['internal'],
                    type: 'public-key'
                }],
                timeout: 60000, // 1 minute
                userVerification: 'required',
            };

            const credential = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            if (credential) {
                console.log('Screen lock or biometric authentication successful.');
                alert('Authentication successful!'); // Display success message
                // You can perform additional actions here, such as granting access
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                console.error('Authentication was not allowed or timed out. Please ensure you interacted with the prompt.');
            } else if (err.name === 'SecurityError') {
                console.error('A security error occurred. This could be due to an insecure context or another security policy.');
            } else {
                console.error('Authentication failed:', err);
            }
            alert('Authentication failed or timed out. Please try again.');
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isSubmitting) {
        return <div className="loading-message">Submitting...</div>;
    }
    else if (isSubmitted) {
        return <div className="submission-success">Form submitted successfully!</div>;
    }

    return (
        <div className="form-container">
            <h3 className="form-heading">Items to Collect:</h3>
            <h2>{loanDetails.student_name}</h2>
            <div className="selected-items">
                {loanDetails?.loan_items?.length > 0 ? (
                    <ul className="selected-items-list">
                        {loanDetails.loan_items.map((item, index) => (
                            <li key={index}>{item.item_name} (Qty: {item.quantity})</li>
                        ))}
                    </ul>
                ) : (
                    <p onClick={console.log(loanDetails)}>No items selected.</p>
                )}
            </div>
            <h4>Loan Period: {new Date(loanDetails.start_usage_date).toLocaleDateString()} to {new Date(loanDetails.end_usage_date).toLocaleDateString()}</h4>
            <button onClick={requestScreenLock}>Unlock with Screen Lock</button>
            <hr/>
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key, index) => {

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
                <button type="submit" disabled={isSubmitting} className="submit-button">Submit</button>
            </form>
        </div>
    );
}

export default NewCollectForm;
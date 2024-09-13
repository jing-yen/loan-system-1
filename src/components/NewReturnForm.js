import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/NewBorrowForm.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function NewReturnForm() {
    const location = useLocation();
    const loanDetails = useMemo(() => location.state?.loanDetails || {});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [verifiedByStaff, setVerifiedByStaff] = useState(false);


    const [formData, setFormData] = useState({
        phone: '',
        date: '',
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
            if ((key === 'phone') && formData[key].trim() != loanDetails.student_phone) {
                newErrors[key] = 'Incorrect phone number';
                isValid = false;
            }

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
                    status: 'Completed',
                    loan_id: loanDetails.transaction_id,
                    completion_time: new Date().toISOString()
                };

                console.log('Submitting form with data:', formDataToSend);
                await axios.post('https://express-server-1.fly.dev/api/loan-status/update', formDataToSend);
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

    const registerCredential = async () => {
        try {
            const publicKeyCredentialCreationOptions = {
                challenge: new Uint8Array([0x8C, 0xFA, 0xB3, 0xA9, 0x42, 0xF5, 0x89, 0xDE]), // Example challenge
                rp: { name: "Your App Name" },
                user: {
                    id: new Uint8Array(16), // User ID in Uint8Array form, must be unique per user
                    name: "Staff and Makers",
                    displayName: "User Name"
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, // ES256
                    { alg: -257, type: "public-key" } // RS256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "direct",
            };
    
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });
    
            if (credential) {
                console.log('Credential registered:', credential);
                setVerifiedByStaff(true);
                // Store the credential ID securely for future use
                const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                console.log('Credential ID:', credentialId);
                // Store this credentialId in your localStorage or server
            }
        } catch (err) {
            console.error('Credential registration failed:', err);
        }
    };

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
            <h3 className="form-heading">Items to Return:</h3>
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
                <hr/>

                <button type="button" onClick={registerCredential} disabled={verifiedByStaff} className="submit-button">Step 1: {verifiedByStaff?'Verified':'Get A Staff to Verify'}</button>
                {errors['verify'] && <p className="form-error">{errors['verify']}</p>}
                <button type="submit" disabled={isSubmitting||!verifiedByStaff} className="submit-button">Step 2: Submit</button>
            </form>
        </div>
    );
}

export default NewReturnForm;
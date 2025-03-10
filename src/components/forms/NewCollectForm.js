import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReusableForm from './ReusableForm';
import { isRequired, isNotWeekend } from '../../utils/validation';

function NewCollectForm({ verifiedByStaff, startVerification }) {
    const location = useLocation();
    const loanDetails = useMemo(() => location.state?.loanDetails || {}, [location.state?.loanDetails]);
    const [isVerified, setIsVerified] = useState(verifiedByStaff);

    const itemDescription = loanDetails?.loan_items?.length > 0 ? (
        <ol className="selected-items-list">
            {loanDetails.loan_items.map((item, index) => (
                <li key={index}>{item.item_name} (Qty: {item.quantity})</li>
            ))}
        </ol>
    ) : (
        <p onClick={() => console.log(loanDetails)}>No items selected.</p>
    );

    const formFields = [
        { name: 'date', label: 'Date', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'staff_name', label: 'Staff Name', type: 'text' },
        { name: 'serial_numbers', label: 'Serial Numbers', type: 'textarea' },
    ];

    const validationSchema = (formData, fields) => {
        let newErrors = {};

        if (!isVerified) {
            newErrors['verify'] = 'Get a staff to verify your collection';
        }

        fields.forEach(field => {
            const value = formData[field.name];
            switch (field.type) {
                case 'text':
                    if (field.name !== 'serial_numbers'){
                        const requiredError = isRequired(value);
                        if (requiredError) newErrors[field.name] = requiredError;
                    }
                    break;
                case 'date':
                    const requiredDateError = isRequired(value);
                    if (requiredDateError) newErrors[field.name] = requiredDateError;
                    const weekendError = isNotWeekend(value);
                    if (weekendError && !newErrors[field.name]) newErrors[field.name] = weekendError; // Only add if no required error
                    break;
                default:
                    if (field.name !== 'serial_numbers'){
                        const defaultRequiredError = isRequired(value);
                        if (defaultRequiredError) newErrors[field.name] = defaultRequiredError;
                    }
            }
        });
        return newErrors;
    };

    const handleSubmit = async (formData) => {
        const formDataToSend = {
            ...formData,
            status: 'Borrowed',
            loan_id: loanDetails.transaction_id,
            completion_time: new Date().toISOString()
        };
        await axios.post('http://localhost:5000/api/loan-status/update', formDataToSend);
    };

    const extraContent = (
        <>
            <div className="form-group">
                <button type="button" onClick={startVerification} disabled={isVerified} className="submit-button">Step 1: {isVerified ? 'Verified' : 'Get A Staff to Verify'}</button>
                {validationSchema({}).verify && <p className="form-error">{validationSchema({}).verify}</p>}
            </div>
        </>
    );

    const submitButtonText = isVerified ? "Step 2: Submit" : "Step 2: Submit (disabled)";

    return (
        <ReusableForm
            formTitle="Items to Collect:"
            itemDescription={itemDescription}
            fields={formFields}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            submitButtonText={submitButtonText}
            extraContent={extraContent}
            successMessage="Form submitted successfully!"
        />
    );
}

export default NewCollectForm;

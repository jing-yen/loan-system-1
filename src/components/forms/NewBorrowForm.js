import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../CartContext';
import { useWhichLocation } from '../LocationContext';
import ReusableForm from './ReusableForm';
import { isRequired, isValidEmail, isValidPhoneNumber, isNotWeekend } from '../../utils/validation';

function NewBorrowForm() {
    const location = useLocation();
    const { whichLocation } = useWhichLocation();
    const selectedItems = useMemo(() => location.state?.selectedItems || [], [location.state?.selectedItems]);
    const { setCart } = useCart();
    const requiresApproval = useMemo(() => selectedItems.some(item => item.requires_approval === 'true'), [selectedItems]);

    const itemDescription = selectedItems.length > 0 ? (
        <ul className="selected-items-list">
            {selectedItems.map((item, index) => (
                <li key={index}>{item.item_name} (Qty: {item.qty_borrowed})</li>
            ))}
        </ul>
    ) : (
        <p>No items selected.</p>
    );

    const formFields = [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'course_code', label: 'Course Code', type: 'text' },
        { name: 'project_code', label: 'Project Code', type: 'text' },
        { name: 'phone_number', label: 'Phone Number', type: 'number', minLength: 8, maxLength: 8 },
        { name: 'start_usage_date', label: 'Start Usage Date', type: 'date' },
        { name: 'end_usage_date', label: 'End Usage Date', type: 'date' },
        ...(requiresApproval ? [
            { name: 'project_supervisor_name', label: 'Project Supervisor Name', type: 'text' },
            { name: 'supervisor_email', label: 'Supervisor Email', type: 'email' },
        ] : [])
    ];

    const validationSchema = (formData) => {
        let newErrors = {};

        formFields.forEach(field => {
            if (!requiresApproval && (field.name === 'project_supervisor_name' || field.name === 'supervisor_email')) {
                return; // Skip validation for supervisor fields if approval is not required
            }
            if (field.name !== 'additional_remarks') {
                const requiredError = isRequired(formData[field.name]);
                if (requiredError) newErrors[field.name] = requiredError;
            }
            if (field.name === 'email') {
                const emailError = isValidEmail(formData[field.name]);
                if (emailError) newErrors[field.name] = emailError;
            }
            if (field.name === 'supervisor_email') {
                const supervisorEmailError = isValidEmail(formData[field.name]);
                if (supervisorEmailError) newErrors[field.name] = supervisorEmailError;
            }
            if (field.name === 'phone_number') {
                const phoneError = isValidPhoneNumber(formData[field.name]);
                if (phoneError) newErrors[field.name] = phoneError;
            }
            if (field.name === 'start_usage_date' || field.name === 'end_usage_date') {
                const weekendError = isNotWeekend(formData[field.name]);
                if (weekendError) newErrors[field.name] = weekendError;
            }
        });
        return newErrors;
    };

    const handleSubmit = async (formData) => {
        console.log('hi0');
        let itemsData = selectedItems.reduce((acc, item, index) => {
            acc[`item_id_${index + 1}`] = item.item_id;
            acc[`item_name_${index + 1}`] = item.item_name;
            acc[`quantity_${index + 1}`] = item.qty_borrowed;
            return acc;
        }, {});

        const formDataToSend = {
            ...formData,
            ...itemsData,
            location: whichLocation || 'hub',
            completion_time: new Date().toISOString()
        };

        if (!requiresApproval) {
            formDataToSend.project_supervisor_name = '';
            formDataToSend.supervisor_email = '';
        }

        console.log('hi');
        await axios.post('http://localhost:5000/api/submit-form', formDataToSend);
        setCart([]);
    };

    const extraContent = (
        <>
            <p style={{ fontSize: '12px', color: '#666', width: '100%' }}>We collect your personal data to contact you regarding your loan transaction. Your data may be disclosed to third parties solely for this purpose.</p>
            <p style={{ fontSize: '12px', color: '#666', width: '100%' }}>By submitting this form, you consent to the collection, use, and disclosure of your data as described above. Please review your information for accuracy before clicking "Submit."</p>
        </>
    );


    return (
        <ReusableForm
            formTitle="Items to Borrow:"
            itemDescription={itemDescription}
            fields={formFields}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            submitButtonText="Submit"
            extraContent={extraContent}
            successMessage="Form submitted successfully!"
        />
    );
}

export default NewBorrowForm;

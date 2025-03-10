import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../CartContext';
import { useWhichLocation } from '../LocationContext';
import ReusableForm from './ReusableForm';
import { borrowFormValidationSchema } from '../../utils/validation';

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
        { name: 'phone_number', label: 'Phone Number', type: 'tel', minLength: 8, maxLength: 8 },
        { name: 'start_usage_date', label: 'Start Usage Date', type: 'date' },
        { name: 'end_usage_date', label: 'End Usage Date', type: 'date' },
        ...(requiresApproval ? [
            { name: 'project_supervisor_name', label: 'Project Supervisor Name', type: 'text' },
            { name: 'supervisor_email', label: 'Supervisor Email', type: 'email' },
        ] : [])
    ];

    const validationSchema = (formData) => borrowFormValidationSchema(formData, formFields, requiresApproval);


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

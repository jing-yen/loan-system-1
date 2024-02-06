import React, { useState, useEffect } from 'react';
import '../styles/NewBorrowForm.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';;

function NewBorrowForm() {

    const location = useLocation();
    const selectedItems = location.state?.selectedItems || [];
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { cart, setCart } = useCart();


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        project_title: '',
        project_code: '',
        phone_number: '',
        start_usage_date: '',
        end_usage_date: '',
        location_of_usage: '',
        purpose_of_usage: '',
        project_supervisor_name: '',
        supervisor_email: '',
        additional_remarks: ''
    });

    const handleChange = (e) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);
        setErrors({ ...errors, [e.target.name]: '' });

        // Additional validation for date fields
        if (e.target.name === 'end_usage_date' || e.target.name === 'start_usage_date') {
            const startDate = updatedFormData['start_usage_date'];
            const endDate = updatedFormData['end_usage_date'];
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of the day

            if (startDate && new Date(startDate) < today) {
                // Set error if start date is today's date or earlier
                setErrors(prevErrors => ({ ...prevErrors, 'start_usage_date': 'Start date cannot be today or earlier' }));
            } else if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                // Set error if end date is before start date
                setErrors(prevErrors => ({ ...prevErrors, 'end_usage_date': 'End date cannot be earlier than start date' }));
            }
        }
    };



    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        // Email validation regex
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

        Object.keys(formData).forEach(key => {
            if (formData[key].trim() === '') {
                newErrors[key] = 'Field cannot be blank';
                isValid = false;
            }

            // Specific validation for email fields
            if ((key === 'email' || key === 'supervisor_email') && !emailRegex.test(formData[key].trim())) {
                newErrors[key] = 'Invalid email format';
                isValid = false;
            }
        });

        // Validate that end date is not before start date
        if (new Date(formData.end_usage_date) < new Date(formData.start_usage_date)) {
            newErrors['end_usage_date'] = 'End date cannot be earlier than start date!';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                // Initialize an object to hold the flattened item data
                let itemsData = {};

                // Flatten selectedItems into formData
                selectedItems.forEach((item, index) => {
                    itemsData[`item_id_${index + 1}`] = item.item_id;
                    itemsData[`item_name_${index + 1}`] = item.item_name;
                    itemsData[`quantity_${index + 1}`] = item.qty_borrowed;
                });

                const formDataToSend = {
                    ...formData,
                    ...itemsData,
                    completion_time: new Date().toISOString()
                };
                console.log("formDataToSend:", formDataToSend);

                await axios.post('https://express-server-1.fly.dev/api/submit-form', formDataToSend);
                setIsSubmitted(true);
                console.log("Emptying cart");
                setCart([]);
                console.log("Cart should be empty", cart);
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        }
    };

    useEffect(() => {
        // Scroll to top on component mount
        window.scrollTo(0, 0);
    }, []);

    if (isSubmitted) {
        return <div className="submission-success">Form submitted successfully!</div>;
    }

    return (
        <div className="form-container">
            <h3 className="form-heading">Items to Borrow:</h3>
            <div className="selected-items">
                {selectedItems.length > 0 ? (
                    <ul className="selected-items-list">
                        {selectedItems.map((item, index) => (
                            <li key={index}>{item.item_name} (Qty: {item.qty_borrowed})</li>
                        ))}
                    </ul>
                ) : (
                    <p>No items selected.</p>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key, index) => (
                    <div className="form-group" key={index}>
                        <label>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</label>
                        <input
                            type={key === 'email' ? 'email' : (key.includes('date') ? 'date' : 'text')}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                        />
                        {errors[key] && <p className="form-error">{errors[key]}</p>}
                    </div>
                ))}
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
}

export default NewBorrowForm;

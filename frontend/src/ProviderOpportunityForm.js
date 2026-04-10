import React, { useState, useEffect } from 'react';
import './ProviderOpportunityForm.css';

function ProviderOpportunityForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stipend: '',
        location: '',
        duration: '',
        requirements: '',
        closingDate: ''
    });

    const [message, setMessage] = useState('');

    const [displayText, setDisplayText] = useState('');
    const fullText = "Post an Opportunity";

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < fullText.length) {
                setDisplayText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
        return () => clearInterval(timer);
    }, []);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:5000/opportunities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage('Opportunity posted successfully!');
            }
        })
        .catch(err => setMessage('Something went wrong, try again'));
    };

    return (
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">{displayText}<span className="cursor">|</span></h2>
            <div className="ambient-line"></div>
          </div>

          <div className="form-body">
            <form className="opportunity-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Junior Developer Learnership" />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the opportunity..." />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="stipend">Stipend (R)</label>
                        <input type="text" id="stipend" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. 3000" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Johannesburg" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="duration">Duration</label>
                        <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 12 months" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="closingDate">Closing Date</label>
                        <input type="date" id="closingDate" name="closingDate" value={formData.closingDate} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="requirements">Requirements</label>
                    <textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="List the requirements..." />
                </div>

                <button type="submit" className="submit-btn">Post Opportunity</button>

            </form>
            {message && <p className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</p>}
          </div>
        </div>
    );
}

export default ProviderOpportunityForm;
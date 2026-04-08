import React, { useState } from 'react';

function ProviderOpportunityForm() {
    const[formData, setFormData] = useState({
        title: '',
        description: '',
        stipend: '',
        location: '',
        duration: '',
        requirements: '',
        closingDate: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

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
    <div>
      <h2>Post an Opportunity</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <label htmlFor="stipend">Stipend</label>
        <input
          type="text"
          id="stipend"
          name="stipend"
          value={formData.stipend}
          onChange={handleChange}
        />
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        <label htmlFor="duration">Duration</label>
        <input
          type="text"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />
        <label htmlFor="requirements">Requirements</label>
        <textarea
          id="requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
        />
        <label htmlFor="closingDate">Closing Date</label>
        <input
          type="date"
          id="closingDate"
          name="closingDate"
          value={formData.closingDate}
          onChange={handleChange}
        /> 
        <button type="submit">Post Opportunity</button>
      </form>
        {message && <p>{message}</p>}
    </div>
  );
}

export default ProviderOpportunityForm;
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ApplicantHome.css";

function ApplicantHome(){
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({ sector: "", nqflevel: "", location: "" });

    useEffect(() => {
        fetch('https://code-crafters-t8dp.onrender.com/opportunities')
            .then(res => res.json())
            .then(data => setJobs(data))
            .catch(err => console.log('Error fetching opportunities:', err));
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredJobs = jobs.filter(job => {
        return (
            (filters.sector === "" || job.sector === filters.sector) &&
            (filters.nqflevel === "" || job.nqf_level === filters.nqflevel) &&
            (filters.location === "" || job.location === filters.location)
        );
    });

    return(
        <div className="home-container">

            <div className="profile-card" onClick={() => navigate("/profile")}>
                <div className="profile-Initials">M</div>
                <div className="profile-info">
                    <h2>Mlungisi Mahlangu</h2>
                    <p>View and edit Profile</p>
                </div>
            </div>

            <div className="filter-bar">
                <h3>Filter Opportunities...</h3>
                <div className="filter-controls">
                    <select name="sector" value={filters.sector} onChange={handleFilterChange}>
                        <option value="">All Sectors</option>
                        <option value="ICT">ICT</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                    </select>
                    <select name="nqflevel" value={filters.nqflevel} onChange={handleFilterChange}>
                        <option value="">All NQF Levels</option>
                        <option value="NQF 4">NQF 4</option>
                        <option value="NQF 5">NQF 5</option>
                        <option value="NQF 6">NQF 6</option>
                    </select>
                    <select name="location" value={filters.location} onChange={handleFilterChange}>
                        <option value="">All Locations</option>
                        <option value="Cape Town">Cape Town</option>
                        <option value="Johannesburg">Johannesburg</option>
                        <option value="Durban">Durban</option>
                    </select>
                </div>
            </div>

            <div className="listings-section">
                <h3>Available Opportunities</h3>
                {filteredJobs.length === 0 ? (
                    <p>No opportunities available at the moment.</p>
                ) : (
                    <div className="job-grid">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="job-card" onClick={() => alert(`You clicked: ${job.title}`)}>
                                <h4>{job.title}</h4>
                                <p className="company">{job.provider_id}</p>
                                <div className="job-tags">
                                    <span className="tag">{job.sector}</span>
                                    <span className="tag">{job.nqf_level}</span>
                                </div>
                                <p className="job-details">{job.location}</p>
                                <p className="job-details">{job.stipend}</p>
                                <p className="job-details">{job.closing_date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApplicantHome;
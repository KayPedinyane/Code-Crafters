// Filter logic for job listings
export const filterJobs = (jobs, filters) => {
  return jobs.filter((job) => {
    const sectorMatch   = filters.sector   === "" || job.sector    === filters.sector;
    const nqfMatch      = filters.nqfLevel === "" || job.nqf_level === filters.nqfLevel;
    const locationMatch = filters.location === "" || job.location  === filters.location;
    const typeMatch     = filters.type     === "" || job.type      === filters.type;
    return sectorMatch && nqfMatch && locationMatch && typeMatch;
  });
};
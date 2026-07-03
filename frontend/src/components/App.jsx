import { useState } from 'react';
import './App.css';
import { createJob, uploadResumes, rankResumes, getResults } from './api';

function App() {
  const [step, setStep] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobFile) {
      setError('Please enter a job title and select a file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const job = await createJob(jobTitle, jobFile);
      setJobs([job, ...jobs]);
      setSelectedJob(job);
      setJobTitle('');
      setJobFile(null);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResumes = async () => {
    if (!resumeFiles.length) {
      setError('Please select at least one resume file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await uploadResumes(selectedJob.id, resumeFiles);
      setResumeFiles([]);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRankResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const ranked = await rankResumes(selectedJob.id);
      const allResults = await getResults(selectedJob.id);
      setResults(allResults);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setStep(2);
    setResults([]);
    setResumeFiles([]);
  };

  return (
    <div className="app">
      <header>
        <h1>🎯 TalentMatch AI</h1>
        <p>AI-powered resume matching for efficient hiring</p>
      </header>

      <div className="layout">
        <ul className="steps--vertical">
          <li className={`step step--${step === 1 ? 'active' : step > 1 ? 'done' : 'pending'}`}>
            <div className="step-track">
              <button className="step-circle" disabled>{1}</button>
            </div>
            <div className="step-text">
              <span className="step-label">Create Job</span>
              <span className="step-sublabel">Post job details</span>
            </div>
          </li>

          <li className={`step step--${step === 2 ? 'active' : step > 2 ? 'done' : 'pending'}`}>
            <div className="step-track">
              <button className="step-circle" disabled>{2}</button>
            </div>
            <div className="step-text">
              <span className="step-label">Upload Resumes</span>
              <span className="step-sublabel">Add candidate files</span>
            </div>
          </li>

          <li className={`step step--${step === 3 ? 'active' : step > 3 ? 'done' : 'pending'}`}>
            <div className="step-track">
              <button className="step-circle" disabled>{3}</button>
            </div>
            <div className="step-text">
              <span className="step-label">Rank Resumes</span>
              <span className="step-sublabel">AI matching</span>
            </div>
          </li>

          <li className={`step step--${step === 4 ? 'active' : 'pending'}`}>
            <div className="step-track">
              <button className="step-circle" disabled>{4}</button>
            </div>
            <div className="step-text">
              <span className="step-label">View Results</span>
              <span className="step-sublabel">Top matches</span>
            </div>
          </li>
        </ul>

        <div className="panel-viewport">
          {error && <div style={{ color: 'var(--critical)', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(208, 59, 59, 0.1)' }}>{error}</div>}

          {step === 1 && (
            <div className="panel-slide step-card">
              <h2>Create Job Posting</h2>
              <p className="step-hint">Upload the job description to get started</p>
              <form onSubmit={handleCreateJob}>
                <input
                  type="text"
                  placeholder="Job Title (e.g., Senior Developer)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  style={{ flex: 1, minWidth: '100%' }}
                />
                <div className="file-picker" style={{ width: '100%' }}>
                  <label className="file-picker-button">
                    📎 {jobFile ? jobFile.name : 'Choose Job Description File'}
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setJobFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                  {loading ? 'Processing...' : 'Create Job'}
                </button>
              </form>

              {jobs.length > 0 && (
                <>
                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Recent Jobs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        style={{
                          padding: '1rem',
                          border: '1px solid var(--hairline)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedJob?.id === job.id ? 'var(--accent-bg)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && selectedJob && (
            <div className="panel-slide step-card">
              <h2>Upload Resumes</h2>
              <p className="step-hint">For: <strong>{selectedJob.title}</strong></p>
              <div className="file-picker">
                <label className="file-picker-button">
                  📎 {resumeFiles.length > 0 ? `${resumeFiles.length} file(s) selected` : 'Choose Resume Files'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setResumeFiles(Array.from(e.target.files))}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {resumeFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Selected files:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--ink-secondary)' }}>
                    {resumeFiles.map((file, i) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => setStep(1)}>← Back</button>
                <button onClick={handleUploadResumes} disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Uploading...' : 'Upload Resumes'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedJob && (
            <div className="panel-slide step-card">
              <h2>Rank Resumes</h2>
              <p className="step-hint">Click below to run AI matching algorithm</p>
              <button onClick={handleRankResumes} disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Analyzing...' : '🤖 Start AI Ranking'}
              </button>
              <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '0.75rem', background: 'var(--ink-muted)' }}>
                ← Back
              </button>
            </div>
          )}

          {step === 4 && results.length > 0 && (
            <div className="panel-slide step-card">
              <h2>Ranking Results</h2>
              <p className="step-hint">Top matches for: <strong>{selectedJob.title}</strong></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {results.map((resume, index) => (
                  <div
                    key={resume.id}
                    style={{
                      padding: '1rem',
                      border: '2px solid',
                      borderColor: resume.match_score
                        ? resume.match_score > 0.7
                          ? 'var(--good)'
                          : resume.match_score > 0.4
                          ? 'var(--blue-450)'
                          : 'var(--critical)'
                        : 'var(--hairline)',
                      borderRadius: '8px',
                      background: resume.match_score
                        ? resume.match_score > 0.7
                          ? 'rgba(12, 163, 12, 0.05)'
                          : resume.match_score > 0.4
                          ? 'rgba(42, 120, 214, 0.05)'
                          : 'rgba(208, 59, 59, 0.05)'
                        : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>#{index + 1} - {resume.filename}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', marginTop: '0.25rem' }}>
                          {new Date(resume.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      {resume.match_score !== null && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            color: resume.match_score > 0.7 ? 'var(--good)' : resume.match_score > 0.4 ? 'var(--accent)' : 'var(--critical)',
                          }}
                        >
                          {(resume.match_score * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '1.5rem', background: 'var(--ink-muted)' }}>
                ← New Job
              </button>
            </div>
          )}

          {step === 4 && results.length === 0 && (
            <div className="panel-slide step-card">
              <h2>No Results</h2>
              <p>Something went wrong. Please try again.</p>
              <button onClick={() => setStep(1)} style={{ width: '100%' }}>
                ← Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

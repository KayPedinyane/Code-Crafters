import { useState, useRef } from "react";
// Add this import at the top
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HelpPage.css";

const API = "https://code-crafters-t8dp.onrender.com";

const FAQS = [
  {
    category: "Getting Started",
    icon: "",
    items: [
      {
        q: "How do I apply for a learnership?",
        a: "First complete your profile under Edit Profile , you need your personal details, NQF level, qualification and institution filled in. Then browse opportunities, click on one to view details, and click Apply Now. You will receive a confirmation email and in-app notification."
      },
      {
        q: "Why can't I click Apply Now?",
        a: "You need to complete your profile first. The Apply Now button checks that your Full Name, Phone Number, ID Number, Gender, City, Province, Qualification, Institution and NQF Level are all filled in. Click 'Complete your profile →' in the error message to go directly to Edit Profile."
      },
      {
        q: "Can I apply for multiple opportunities?",
        a: "Yes, you can apply for as many opportunities as you are eligible for. Each application is tracked separately under My Applications."
      },
    ]
  },
  {
    category: "Applications & Status",
    icon: "📋",
    items: [
      {
        q: "How do I track my application status?",
        a: "Click My Applications in the navigation bar. Each card shows the current status , Pending, Shortlisted, Accepted or Rejected — with colour coding. You will also receive in-app notifications and emails when your status changes."
      },
      {
        q: "My application shows as Pending — what does this mean?",
        a: "Pending means the provider has received your application and it is under review. You will be notified by email and in-app notification when the status changes to Shortlisted, Accepted or Rejected."
      },
      {
        q: "How do I save an opportunity?",
        a: "Click the 🏷 bookmark icon on any job card to save it. Saved opportunities appear under the Saved tab on the opportunities page and in your profile popup."
      },
    ]
  },
  {
    category: "AI & Notifications",
    icon: "✨",
    items: [
      {
        q: "How does AI Match work?",
        a: "Click ✨ AI Match in the navigation bar. The smart matching engine scores all available opportunities against your NQF level, qualification sector, skills, and location. It returns your top 5 matches with a percentage score, explanation of why it matches you, and a tip to strengthen your application."
      },
      {
        q: "Why am I not receiving emails?",
        a: "Email notifications are sent for application status changes, new matching opportunities, and closing deadlines. Check your spam/junk folder first. If emails still don't arrive, ensure your profile email is correct and contact skillsbridgesa@gmail.com."
      },
    ]
  },
  {
    category: "Qualifications & NQF",
    icon: "🎓",
    items: [
      {
        q: "What is the NQF?",
        a: "The National Qualifications Framework (NQF) is South Africa's official system for classifying qualifications from NQF 1 (basic) to NQF 10 (doctorate), as defined by the South African Qualifications Authority (SAQA). Learnerships typically require NQF 4 to NQF 6 qualifications."
      },
      {
        q: "What qualifications do I need for a learnership?",
        a: "Requirements vary per listing. Most learnerships require at minimum a Matric/Grade 12 (NQF 4). Check the Requirements section on each opportunity card for specific criteria."
      },
    ]
  },
];

const CONTACT_SUBJECTS = [
  "Application Issue",
  "Profile Problem",
  "Technical Error",
  "Account Help",
  "General Enquiry",
  "Other",
];

// ── Validate SA phone number ──
function isValidSAPhone(val) {
  return /^0[6-8][0-9]{8}$/.test(val.replace(/\s/g, ""));
}

// ── Only letters and spaces ──
function isTextOnly(val) {
  return /^[a-zA-Z\s'-]+$/.test(val);
}

function HelpPage() {
  const navigate  = useNavigate();
  const [openFaq,     setOpenFaq]     = useState(null);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("faq");  // faq | contact | status
  const [sent,        setSent]        = useState(false);
  const [sending,     setSending]     = useState(false);
  const [formErrors,  setFormErrors]  = useState({});
  const [statusEmail, setStatusEmail] = useState("");
  const [statusData,  setStatusData]  = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError,   setStatusError]   = useState("");
  const searchRef = useRef(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });

  // ── Auto-fill email from logged-in user ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.email) {
          setStatusEmail(user.email);  
          setForm(prev => ({ ...prev, email: user.email }));
        }
      }
    } catch {}
  }, []);

  // ── Filter FAQs ──
  const filteredCategories = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(f =>
      search === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const totalResults = filteredCategories.reduce((acc, c) => acc + c.items.length, 0);

  // ── Validate form ──
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Name is required";
    } else if (!isTextOnly(form.name)) {
      errs.name = "Name must contain letters only";
    }
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (form.phone && !isValidSAPhone(form.phone)) {
      errs.phone = "Enter a valid SA number (e.g. 0821234567)";
    }
    if (!form.subject) {
      errs.subject = "Please select a subject";
    }
    if (!form.message.trim()) {
      errs.message = "Message is required";
    } else if (form.message.trim().length < 20) {
      errs.message = "Message must be at least 20 characters";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handle field changes ──
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: numbers only
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm(prev => ({ ...prev, phone: digits }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── Send contact form via email API ──
  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);

    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch {
      setFormErrors({ message: "Failed to send. Please email us directly at skillsbridgesa@gmail.com" });
    } finally {
      setSending(false);
    }
  };

  // ── Check application status by email ──
  const handleCheckStatus = async () => {
    if (!statusEmail || !/\S+@\S+\.\S+/.test(statusEmail)) {
      setStatusError("Please enter a valid email address");
      return;
    }
    setStatusLoading(true);
    setStatusError("");
    setStatusData(null);
    try {
      const res  = await fetch(`${API}/applications/${encodeURIComponent(statusEmail)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStatusData(data);
      } else {
        setStatusError("No applications found for this email address.");
      }
    } catch {
      setStatusError("Could not fetch applications. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  const STATUS_COLORS = {
    pending:     { bg: "#fff3e0", text: "#e65100", label: "Pending Review" },
    shortlisted: { bg: "#e3f2fd", text: "#1565c0", label: "Shortlisted ⭐" },
    accepted:    { bg: "#e8f5e9", text: "#2e7d32", label: "Accepted 🎉" },
    rejected:    { bg: "#fff5f5", text: "#c53030", label: "Unsuccessful" },
  };

  return (
    <div className="help-wrapper">

      {/* ── HEADER ── */}
      <header className="help-header">
        <div className="help-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="help-back-btn" onClick={() => navigate("/applicant")}>← Back</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="help-hero">
        <div className="help-hero-inner">
          <div className="help-hero-badge">Support Centre</div>
          <h1 className="help-title">How can we <span className="help-green">help you?</span></h1>
          <p className="help-sub">Find answers, track your applications, or get in touch with our team.</p>

          <div className="help-search">
            <span className="help-search-icon">🔍</span>
            <input
              ref={searchRef}
              placeholder="Search for help topics..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveTab("faq"); }}
              className="help-search-input"
            />
            {search && (
              <button onClick={() => setSearch("")} className="help-search-clear">✕</button>
            )}
          </div>

          {/* Stats */}
          <div className="help-hero-stats">
            <div className="help-stat"><span className="help-stat-num">10</span><span className="help-stat-label">FAQ Topics</span></div>
            <div className="help-stat-div"/>
            <div className="help-stat"><span className="help-stat-num">1-2</span><span className="help-stat-label">Day Response</span></div>
            <div className="help-stat-div"/>
            <div className="help-stat"><span className="help-stat-num">24/7</span><span className="help-stat-label">App Support</span></div>
          </div>
        </div>
        <div className="help-hero-pattern"/>
      </section>

      {/* ── QUICK LINKS ── */}
      <div className="help-quick-links-bar">
        <div className="help-quick-links-inner">
          {[
            { icon: "👤", label: "Edit Profile",    action: () => navigate("/edit-profile") },
            { icon: "✨", label: "AI Match",         action: () => navigate("/ai-recommendations") },
            { icon: "📋", label: "My Applications", action: () => navigate("/applicant") },
          ].map(({ icon, label, action }) => (
            <button key={label} className="help-quick-btn" onClick={action}>
              <span className="help-quick-icon">{icon}</span>
              <span>{label}</span>
              <span className="help-quick-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="help-tabs-bar">
        <div className="help-tabs-inner">
          {[
            { id: "faq",     label: "FAQs",              icon: "❓" },
            { id: "status",  label: "Check My Status",   icon: "🔍" },
            { id: "contact", label: "Contact Us",        icon: "✉️" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`help-tab ${activeTab === tab.id ? "help-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="help-content">

        {/* ══ FAQ TAB ══ */}
        {activeTab === "faq" && (
          <div className="help-faq-section">
            {search && (
              <p className="help-results-count">
                {totalResults === 0
                  ? `No results for "${search}"`
                  : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${search}"`}
              </p>
            )}

            {filteredCategories.length === 0 ? (
              <div className="help-empty">
                <span style={{ fontSize: 48 }}>🔍</span>
                <h3>No results found</h3>
                <p>Try a different search term or browse the categories below.</p>
                <button className="help-send-btn" onClick={() => setSearch("")}>Clear search</button>
              </div>
            ) : (
              filteredCategories.map((cat, ci) => (
                <div key={ci} className="help-category">
                  <div className="help-category-header">
                    <span className="help-category-icon">{cat.icon}</span>
                    <h2 className="help-category-title">{cat.category}</h2>
                    <span className="help-category-count">{cat.items.length}</span>
                  </div>
                  <div className="help-faqs">
                    {cat.items.map((faq, i) => {
                      const key = `${ci}-${i}`;
                      return (
                        <div key={key} className={`help-faq ${openFaq === key ? "help-faq-open" : ""}`}>
                          <button
                            className="help-faq-question"
                            onClick={() => setOpenFaq(openFaq === key ? null : key)}
                          >
                            <span>{faq.q}</span>
                            <span className="help-faq-chevron">{openFaq === key ? "▲" : "▼"}</span>
                          </button>
                          {openFaq === key && (
                            <div className="help-faq-answer">{faq.a}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            <div className="help-still-stuck">
              <span style={{ fontSize: 32 }}>🤔</span>
              <h3>Still stuck?</h3>
              <p>Can't find what you're looking for? Contact our support team directly.</p>
              <button className="help-send-btn" onClick={() => setActiveTab("contact")}>
                Contact Support →
              </button>
            </div>
          </div>
        )}

        {/* ══ STATUS TAB ══ */}
        {activeTab === "status" && (
          <div className="help-status-section">
            <div className="help-status-card">
              <div className="help-status-icon-wrap">🔍</div>
              <h2 className="help-status-title">Check Your Application Status</h2>
              <p className="help-status-sub">Enter the email address you used to register and we'll show all your applications.</p>

              <div className="help-status-input-row">
                <input
                  className={`help-input ${statusError ? "help-input-error" : ""}`}
                  placeholder="Enter your email address"
                  value={statusEmail}
                  onChange={e => { setStatusEmail(e.target.value); setStatusError(""); setStatusData(null); }}
                  onKeyDown={e => e.key === "Enter" && handleCheckStatus()}
                  type="email"
                />
                <button
                  className="help-send-btn"
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                >
                  {statusLoading ? "Checking..." : "Check Status"}
                </button>
              </div>
              {statusError && <p className="help-field-error">{statusError}</p>}
            </div>

            {statusData && (
              <div className="help-status-results">
                <h3 className="help-status-results-title">
                  Found {statusData.length} application{statusData.length !== 1 ? "s" : ""}
                </h3>
                <div className="help-status-list">
                  {statusData.map((app, i) => {
                    const s      = (app.status || "pending").toLowerCase();
                    const colors = STATUS_COLORS[s] || { bg: "#f0f0f0", text: "#333", label: app.status };
                    return (
                      <div key={i} className="help-status-item">
                        <div className="help-status-item-left">
                          <div className="help-status-logo">
                            {app.title?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="help-status-job-title">{app.title}</p>
                            <p className="help-status-job-meta">{app.sector} · {app.location}</p>
                            <p className="help-status-job-date">
                              Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "recently"}
                            </p>
                          </div>
                        </div>
                        <div
                          className="help-status-badge"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {colors.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CONTACT TAB ══ */}
        {activeTab === "contact" && (
          <div className="help-contact-section">
            {sent ? (
              <div className="help-sent">
                <div className="help-sent-icon">✅</div>
                <h3>Message Received!</h3>
                <p>Thank you for reaching out. We'll respond to <strong>{form.email}</strong> within 1-2 business days.</p>
                <p style={{ fontSize: 13, color: "#718096", marginTop: 4 }}>
                  In the meantime, check our FAQs — your answer might already be there.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button className="help-send-btn" onClick={() => setActiveTab("faq")}>
                    Browse FAQs
                  </button>
                  <button
                    className="help-send-btn"
                    style={{ background: "#e2e8f0", color: "#0a1628" }}
                    onClick={() => { setSent(false); setForm({ name:"", email:"", phone:"", subject:"", message:"" }); }}
                  >
                    Send Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="help-contact-grid">

                {/* Left — info */}
                <div className="help-contact-info">
                  <h2 className="help-contact-title">Get in Touch</h2>
                  <p className="help-contact-desc">
                    Our support team is here to help. Send us a message and we'll get back to you as soon as possible.
                  </p>

                  <div className="help-contact-details">
                    <div className="help-contact-item">
                      <div className="help-contact-item-icon">✉️</div>
                      <div>
                        <p className="help-contact-item-label">Email</p>
                        <p className="help-contact-item-value">skillsbridgesa@gmail.com</p>
                      </div>
                    </div>
                    <div className="help-contact-item">
                      <div className="help-contact-item-icon">⏰</div>
                      <div>
                        <p className="help-contact-item-label">Response Time</p>
                        <p className="help-contact-item-value">Within 1-2 business days</p>
                      </div>
                    </div>
                    <div className="help-contact-item">
                      <div className="help-contact-item-icon">🌍</div>
                      <div>
                        <p className="help-contact-item-label">Location</p>
                        <p className="help-contact-item-value">Johannesburg, South Africa</p>
                      </div>
                    </div>
                    <div className="help-contact-item">
                      <div className="help-contact-item-icon">💬</div>
                      <div>
                        <p className="help-contact-item-label">Languages</p>
                        <p className="help-contact-item-value">English, Zulu, Sotho</p>
                      </div>
                    </div>
                  </div>

                  <div className="help-contact-tip">
                    <span>💡</span>
                    <p>For faster help, check our <button className="help-link" onClick={() => setActiveTab("faq")}>FAQs</button> — most questions are answered there instantly.</p>
                  </div>
                </div>

                {/* Right — form */}
                <div className="help-contact-form">

                  <div className="help-form-row">
                    <div className="help-form-group">
                      <label className="help-label">Full Name <span className="help-required">*</span></label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Thabo Nkosi"
                        className={`help-input ${formErrors.name ? "help-input-error" : ""}`}
                      />
                      {formErrors.name && <p className="help-field-error">{formErrors.name}</p>}
                    </div>
                    <div className="help-form-group">
                      <label className="help-label">Email Address <span className="help-required">*</span></label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="e.g. thabo@email.com"
                        className={`help-input ${formErrors.email ? "help-input-error" : ""}`}
                      />
                      {formErrors.email && <p className="help-field-error">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="help-form-row">
                    <div className="help-form-group">
                      <label className="help-label">
                        Phone Number
                        <span className="help-optional"> (optional)</span>
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. 0821234567"
                        maxLength={10}
                        inputMode="numeric"
                        className={`help-input ${formErrors.phone ? "help-input-error" : ""}`}
                      />
                      <span style={{ fontSize: 11, color: form.phone.length === 10 ? "#2e7d32" : "#718096", marginTop: 3, display: "block" }}>
                        {form.phone.length}/10 digits
                      </span>
                      {formErrors.phone && <p className="help-field-error">{formErrors.phone}</p>}
                    </div>
                    <div className="help-form-group">
                      <label className="help-label">Subject <span className="help-required">*</span></label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={`help-input ${formErrors.subject ? "help-input-error" : ""}`}
                      >
                        <option value="">Select a subject</option>
                        {CONTACT_SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {formErrors.subject && <p className="help-field-error">{formErrors.subject}</p>}
                    </div>
                  </div>

                  <div className="help-form-group">
                    <label className="help-label">
                      Message <span className="help-required">*</span>
                      <span className="help-optional"> (min 20 characters)</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your issue or question in detail..."
                      className={`help-textarea ${formErrors.message ? "help-input-error" : ""}`}
                      rows={5}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                      {formErrors.message
                        ? <p className="help-field-error">{formErrors.message}</p>
                        : <span/>}
                      <span style={{ fontSize: 11, color: "#718096" }}>{form.message.length} characters</span>
                    </div>
                  </div>

                  <button
                    className="help-send-btn"
                    onClick={handleSend}
                    disabled={sending}
                    style={{ width: "100%" }}
                  >
                    {sending ? "Sending..." : "Send Message →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default HelpPage;
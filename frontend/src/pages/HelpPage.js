import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HelpPage.css";

const FAQS = [
  { q: "How do I apply for a learnership?", a: "First complete your profile under Edit Profile , you need your personal details, NQF level, qualification and institution filled in. Then browse opportunities, click on one to view details, and click Apply Now. You will receive a confirmation email and in-app notification." },
  { q: "Why can't I click Apply Now?", a: "You need to complete your profile first. The Apply Now button checks that your Full Name, Phone Number, ID Number, Gender, City, Province, Qualification, Institution and NQF Level are all filled in. Click 'Complete your profile →' in the error message to go directly to Edit Profile." },
  { q: "How does AI Match work?", a: "Click ✨ AI Match in the navigation bar. The smart matching engine scores all available opportunities against your NQF level, qualification sector, skills, and location. It returns your top 5 matches with a percentage score, explanation of why it matches you, and a tip to strengthen your application." },
  { q: "Why am I not receiving emails?", a: "Email notifications are sent for application status changes, new matching opportunities, and closing deadlines. Check your spam/junk folder first. If emails still don't arrive, ensure your profile email is correct and contact skillsbridgesa@gmail.com." },
  { q: "How do I track my application status?", a: "Click My Applications in the navigation bar. Each card shows the current status — Pending, Shortlisted, Accepted or Rejected — with colour coding. You will also receive in-app notifications and emails when your status changes." },
  { q: "Can I apply for multiple opportunities?", a: "Yes, you can apply for as many opportunities as you are eligible for. Each application is tracked separately under My Applications." },
  { q: "What is the NQF?", a: "The National Qualifications Framework (NQF) is South Africa's official system for classifying qualifications from NQF 1 (basic) to NQF 10 (doctorate), as defined by the South African Qualifications Authority (SAQA). Learnerships typically require NQF 4 to NQF 6 qualifications." },
  { q: "How do I save an opportunity?", a: "Click the 🏷 bookmark icon on any job card to save it. Saved opportunities appear under the Saved tab on the opportunities page and in your profile popup." },
  { q: "How do I change my password?", a: "Go to Settings (via your profile popup → Settings & Profile). Under Account, you can update your password by entering your current password and a new password." },
  { q: "My application shows as Pending — what does this mean?", a: "Pending means the provider has received your application and it is under review. You will be notified by email and in-app notification when the status changes to Shortlisted, Accepted or Rejected." },
];

function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq]   = useState(null);
  const [search,  setSearch]    = useState("");
  const [sent,    setSent]      = useState(false);
  const [form,    setForm]      = useState({ name: "", email: "", subject: "", message: "" });

  const filteredFaqs = FAQS.filter(f =>
    search === "" ||
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="help-wrapper">
      <header className="help-header">
        <div className="help-header-inner">
          <div className="logo" onClick={() => navigate("/applicant")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">SkillsBridge<span className="logo-accent">SA</span></span>
          </div>
          <button className="help-back-btn" onClick={() => navigate("/applicant")}>← Back</button>
        </div>
      </header>

      <section className="help-hero">
        <div className="help-hero-inner">
          <h1 className="help-title">Help & <span className="help-green">Support</span></h1>
          <p className="help-sub">Find answers to common questions or get in touch with our team.</p>
          <div className="help-search">
            <span>🔍</span>
            <input placeholder="Search for help..." value={search}
              onChange={e => setSearch(e.target.value)} className="help-search-input" />
            {search && <button onClick={() => setSearch("")} className="help-search-clear">✕</button>}
          </div>
        </div>
      </section>

      <div className="help-content">

        {/* Quick links */}
        <div className="help-quick-links">
          {[
            { icon: "👤", label: "Edit Profile",     action: () => navigate("/edit-profile") },
            { icon: "✨", label: "AI Match",          action: () => navigate("/ai-recommendations") },
            { icon: "📋", label: "My Applications",  action: () => navigate("/applicant") },
            { icon: "⚙️", label: "Settings",          action: () => navigate("/settings") },
          ].map(({ icon, label, action }) => (
            <button key={label} className="help-quick-btn" onClick={action}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="help-section">
          <h2 className="help-section-title">Frequently Asked Questions</h2>
          {filteredFaqs.length === 0 ? (
            <div className="help-no-results">No results for "{search}" — try a different search term.</div>
          ) : (
            <div className="help-faqs">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className={`help-faq ${openFaq === i ? "help-faq-open" : ""}`}>
                  <button className="help-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className="help-faq-chevron">{openFaq === i ? "▲" : "▼"}</span>
                  </button>
                  {openFaq === i && <div className="help-faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact form */}
        <div className="help-section">
          <h2 className="help-section-title">Contact Us</h2>
          {sent ? (
            <div className="help-sent">
              <span style={{ fontSize: 40 }}>✅</span>
              <h3>Message received!</h3>
              <p>We'll get back to you at <strong>{form.email}</strong> within 1-2 business days.</p>
              <button className="help-send-btn" onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }}>
                Send another message
              </button>
            </div>
          ) : (
            <div className="help-contact-card">
              <div className="help-contact-info">
                <h3 className="help-contact-title">Get in touch</h3>
                <p className="help-contact-desc">Can't find what you're looking for? Send us a message and we'll get back to you.</p>
                <div className="help-contact-details">
                  <div className="help-contact-item"><span>✉️</span><span>skillsbridgesa@gmail.com</span></div>
                  <div className="help-contact-item"><span>⏰</span><span>Response within 1-2 business days</span></div>
                  <div className="help-contact-item"><span>🌍</span><span>Based in Johannesburg, South Africa</span></div>
                </div>
              </div>
              <div className="help-contact-form">
                <input placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="help-input" />
                <input placeholder="Your email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="help-input" />
                <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="help-input" />
                <textarea placeholder="Your message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="help-textarea" rows={5} />
                <button className="help-send-btn" onClick={handleSend} disabled={!form.name || !form.email || !form.message}>
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default HelpPage;
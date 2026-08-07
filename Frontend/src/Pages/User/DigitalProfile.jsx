import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/DigitalProfile.css";
import { API_URL, getHeaders } from "../../config/api";

const TABS = [
  { key: "basic",   label: "Basic Info" },
  { key: "contact", label: "Contact" },
  { key: "social",  label: "Social" },
  { key: "bio",     label: "Bio" },
];

const DigitalProfile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");
  const [loading,   setLoading]   = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [completenessScore, setCompletenessScore] = useState(0);

  // Per-tab state
  const [basic,   setBasic]   = useState({ fullName: "", jobTitle: "", company: "" });
  const [contact, setContact] = useState({ email: "", phone: "", website: "", address: "" });
  const [social,  setSocial]  = useState({ linkedin: "", github: "", twitter: "", instagram: "" });
  const [bio,     setBio]     = useState({ bio: "" });

  // Per-tab saving/message state
  const [saving,  setSaving]  = useState({ basic: false, contact: false, social: false, bio: false });
  const [toast,   setToast]   = useState({ tab: "", msg: "", type: "" });

  // AI bio
  const [generatingBio, setGeneratingBio] = useState(false);

  const showToast = (tab, msg, type = "success") => {
    setToast({ tab, msg, type });
    setTimeout(() => setToast({ tab: "", msg: "", type: "" }), 3500);
  };

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login", { replace: true }); return; }

        const res    = await fetch(`${API_URL}/profile`, { headers: getHeaders(null) });
        const result = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
            return;
          }
          throw new Error(result.message || "Failed to load profile.");
        }

        const p = result.data?.profile || result.data || {};
        const sl = p.social_links || {};

        setBasic({
          fullName: p.full_name  || "",
          jobTitle: p.job_title  || "",
          company:  p.company    || "",
        });
        setContact({
          email:   p.public_email || "",
          phone:   p.phone        || "",
          website: p.website      || "",
          address: p.address      || "",
        });
        setSocial({
          linkedin:  sl.linkedin  || "",
          github:    sl.github    || "",
          twitter:   sl.twitter   || "",
          instagram: sl.instagram || "",
        });
        setBio({ bio: p.bio || "" });
        setProfilePhoto(p.avatar_url || null);
        setCompletenessScore(p.completeness_score || 0);
      } catch (err) {
        showToast("basic", err.message || "Unable to load profile.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedPhoto(file);
    setProfilePhoto(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!selectedPhoto) return;
    const fd = new FormData();
    fd.append("avatar", selectedPhoto);
    const res = await fetch(`${API_URL}/profile/avatar`, {
      method: "POST", headers: getHeaders(null), body: fd,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Avatar upload failed.");
    setSelectedPhoto(null);
  };

  const normalizeUrl = (v) => {
    if (!v || v.trim() === "") return "";
    const t = v.trim();
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return `https://${t}`;
  };

  // ── Save handlers (each section independently) ──────────

  const saveBasic = async (e) => {
    e.preventDefault();
    if (!basic.fullName.trim() || !basic.jobTitle.trim()) {
      showToast("basic", "Full Name and Job Title are required.", "error"); return;
    }
    setSaving(s => ({ ...s, basic: true }));
    try {
      if (selectedPhoto) await uploadAvatar();
      const res    = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders("application/json"),
        body: JSON.stringify({
          full_name: basic.fullName.trim(),
          job_title: basic.jobTitle.trim(),
          company:   basic.company.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save.");
      setCompletenessScore(result.data?.profile?.completeness_score || result.data?.completeness_score || completenessScore);
      showToast("basic", "Basic info saved successfully.");
    } catch (err) {
      showToast("basic", err.message, "error");
    } finally {
      setSaving(s => ({ ...s, basic: false }));
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSaving(s => ({ ...s, contact: true }));
    try {
      const res    = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders("application/json"),
        body: JSON.stringify({
          public_email: contact.email.trim(),
          phone:        contact.phone.trim(),
          website:      normalizeUrl(contact.website),
          address:      contact.address.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save.");
      setCompletenessScore(result.data?.profile?.completeness_score || result.data?.completeness_score || completenessScore);
      showToast("contact", "Contact info saved successfully.");
    } catch (err) {
      showToast("contact", err.message, "error");
    } finally {
      setSaving(s => ({ ...s, contact: false }));
    }
  };

  const saveSocial = async (e) => {
    e.preventDefault();
    setSaving(s => ({ ...s, social: true }));
    try {
      const res    = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders("application/json"),
        body: JSON.stringify({
          social_links: {
            linkedin:  normalizeUrl(social.linkedin),
            github:    normalizeUrl(social.github),
            twitter:   normalizeUrl(social.twitter),
            instagram: normalizeUrl(social.instagram),
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save.");
      showToast("social", "Social links saved successfully.");
    } catch (err) {
      showToast("social", err.message, "error");
    } finally {
      setSaving(s => ({ ...s, social: false }));
    }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    setSaving(s => ({ ...s, bio: true }));
    try {
      const res    = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders("application/json"),
        body: JSON.stringify({ bio: bio.bio.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save.");
      setCompletenessScore(result.data?.profile?.completeness_score || result.data?.completeness_score || completenessScore);
      showToast("bio", "Bio saved successfully.");
    } catch (err) {
      showToast("bio", err.message, "error");
    } finally {
      setSaving(s => ({ ...s, bio: false }));
    }
  };

  const generateAIBio = async () => {
    setGeneratingBio(true);
    try {
      const res    = await fetch(`${API_URL}/ai/bio`, { method: "POST", headers: getHeaders(null) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "AI unavailable");
      setBio({ bio: result.data?.bio || "" });
      showToast("bio", "AI bio generated — review and save when ready.", "info");
    } catch {
      // Fallback template
      const fallback = `${basic.fullName || "I"} is a ${basic.jobTitle || "professional"}${basic.company ? ` at ${basic.company}` : ""}, focused on delivering impactful and high-quality outcomes.`;
      setBio({ bio: fallback });
      showToast("bio", "AI unavailable — template applied. Edit and save.", "info");
    } finally {
      setGeneratingBio(false);
    }
  };

  const initials = basic.fullName
    ? basic.fullName.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "ME";

  const scoreColor = completenessScore >= 80 ? "var(--success)" : completenessScore >= 50 ? "var(--warning)" : "var(--danger)";

  if (loading) {
    return (
      <div className="digital-profile-page">
        <Sidebar />
        <main className="digital-profile-content">
          <div className="profile-loading-skeleton glass-panel">
            <div className="spinner" />
            <p style={{ color: "var(--text-secondary)" }}>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="digital-profile-page">
      <Sidebar />

      <main className="digital-profile-content">

        {/* ── Header banner ── */}
        <div className="profile-header-banner glass-panel">
          <div className="profile-header-main">
            <div className="avatar-wrapper">
              <div className="profile-avatar-large">
                {profilePhoto
                  ? <img src={profilePhoto} alt="Profile" />
                  : <span>{initials}</span>
                }
              </div>
              <label className="avatar-upload-badge" title="Change photo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="header-info">
              <h1>{basic.fullName || "Your Name"}</h1>
              <p>{basic.jobTitle || "Job Title"}{basic.company ? ` · ${basic.company}` : ""}</p>
              <div className="score-pill">
                <span className="score-bar-track">
                  <span className="score-bar-fill" style={{ width: `${completenessScore}%`, background: scoreColor }} />
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: scoreColor }}>{completenessScore}% complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab editor layout ── */}
        <div className="profile-editor-layout">

          {/* Tab sidebar */}
          <div className="profile-tabs glass-panel">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="profile-form-card glass-panel">

            {/* ── Basic Info ── */}
            {activeTab === "basic" && (
              <form onSubmit={saveBasic}>
                <div className="form-section">
                  <h2>Basic Information</h2>

                  {toast.tab === "basic" && (
                    <div className={`profile-toast ${toast.type}`}>{toast.msg}</div>
                  )}

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={basic.fullName}
                        onChange={e => setBasic(p => ({ ...p, fullName: e.target.value.replace(/[^a-zA-Z\s.'-]/g, "") }))}
                        placeholder="Rajan Kshedal"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        value={basic.jobTitle}
                        onChange={e => setBasic(p => ({ ...p, jobTitle: e.target.value }))}
                        placeholder="Backend Developer"
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Company / Organization</label>
                      <input
                        type="text"
                        value={basic.company}
                        onChange={e => setBasic(p => ({ ...p, company: e.target.value }))}
                        placeholder="QRCard Nepal"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving.basic}>
                    {saving.basic ? "Saving..." : "Save Basic Info"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Contact ── */}
            {activeTab === "contact" && (
              <form onSubmit={saveContact}>
                <div className="form-section">
                  <h2>Contact Information</h2>

                  {toast.tab === "contact" && (
                    <div className={`profile-toast ${toast.type}`}>{toast.msg}</div>
                  )}

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Public Email</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={e => setContact(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                        placeholder="9800000000"
                        maxLength="15"
                      />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="text"
                        value={contact.website}
                        onChange={e => setContact(p => ({ ...p, website: e.target.value }))}
                        onBlur={e => setContact(p => ({ ...p, website: normalizeUrl(e.target.value) }))}
                        placeholder="https://yoursite.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Address / City</label>
                      <input
                        type="text"
                        value={contact.address}
                        onChange={e => setContact(p => ({ ...p, address: e.target.value }))}
                        placeholder="Kathmandu, Nepal"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving.contact}>
                    {saving.contact ? "Saving..." : "Save Contact Info"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Social ── */}
            {activeTab === "social" && (
              <form onSubmit={saveSocial}>
                <div className="form-section">
                  <h2>Social Profiles</h2>

                  {toast.tab === "social" && (
                    <div className={`profile-toast ${toast.type}`}>{toast.msg}</div>
                  )}

                  <div className="form-grid">
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        </span>
                        <input
                          type="text"
                          value={social.linkedin}
                          onChange={e => setSocial(p => ({ ...p, linkedin: e.target.value }))}
                          onBlur={e => setSocial(p => ({ ...p, linkedin: normalizeUrl(e.target.value) }))}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>GitHub</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                        </span>
                        <input
                          type="text"
                          value={social.github}
                          onChange={e => setSocial(p => ({ ...p, github: e.target.value }))}
                          onBlur={e => setSocial(p => ({ ...p, github: normalizeUrl(e.target.value) }))}
                          placeholder="github.com/username"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Twitter / X</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </span>
                        <input
                          type="text"
                          value={social.twitter}
                          onChange={e => setSocial(p => ({ ...p, twitter: e.target.value }))}
                          onBlur={e => setSocial(p => ({ ...p, twitter: normalizeUrl(e.target.value) }))}
                          placeholder="x.com/username"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Instagram</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </span>
                        <input
                          type="text"
                          value={social.instagram}
                          onChange={e => setSocial(p => ({ ...p, instagram: e.target.value }))}
                          onBlur={e => setSocial(p => ({ ...p, instagram: normalizeUrl(e.target.value) }))}
                          placeholder="instagram.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving.social}>
                    {saving.social ? "Saving..." : "Save Social Links"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Bio ── */}
            {activeTab === "bio" && (
              <form onSubmit={saveBio}>
                <div className="form-section">
                  <h2>Bio &amp; Summary</h2>

                  {toast.tab === "bio" && (
                    <div className={`profile-toast ${toast.type}`}>{toast.msg}</div>
                  )}

                  {/* AI panel */}
                  <div className="ai-bio-panel">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ background: "var(--accent)", color: "white", borderRadius: "var(--r-sm)", padding: "2px 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em" }}>AI</span>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Gemini AI Bio Generator</strong>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                          Auto-generates a professional bio from your profile data.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="save-btn"
                        style={{ margin: 0, padding: "10px 20px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}
                        onClick={generateAIBio}
                        disabled={generatingBio || !basic.fullName || !basic.jobTitle}
                      >
                        {generatingBio ? "Generating..." : "Generate Bio →"}
                      </button>
                    </div>
                    {(!basic.fullName || !basic.jobTitle) && (
                      <p style={{ fontSize: "12px", color: "var(--warning)", marginTop: "10px", marginBottom: 0 }}>
                        Fill in Full Name and Job Title on the Basic Info tab first.
                      </p>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Your Bio</label>
                    <textarea
                      rows="6"
                      value={bio.bio}
                      onChange={e => setBio({ bio: e.target.value })}
                      placeholder="Write a brief professional summary, or generate one with AI above..."
                      maxLength={500}
                    />
                    <span className="char-count">{bio.bio.length} / 500</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving.bio}>
                    {saving.bio ? "Saving..." : "Save Bio"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default DigitalProfile;

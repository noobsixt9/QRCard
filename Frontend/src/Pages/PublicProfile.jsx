import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import "../CSS/PublicProfile.css";

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l1.17-1.17a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [toast,   setToast]   = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/public/${username}`);
        const result   = await response.json();
        if (!response.ok) throw new Error(result.message || "Profile not found");
        setProfile(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const host = API_URL.replace("/api", "");
    return `${host}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getInitials = (name) => {
    if (!name) return "QR";
    return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const downloadVCard = () => {
    if (!profile) return;
    const lines = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${profile.full_name || username}`,
      `TEL;TYPE=CELL:${profile.phone || ""}`,
      `EMAIL:${profile.public_email || ""}`,
      `URL:${profile.website || ""}`,
      "END:VCARD",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/vcard;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${username}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${profile?.full_name} — QRCard`, url: window.location.href }); }
      catch (_) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Link copied!");
      setTimeout(() => setToast(""), 2500);
    }
  };

  if (loading) {
    return (
      <div className="pp-page pp-loading-state">
        <div className="spinner" role="status" aria-label="Loading profile" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="pp-page pp-error-state">
        <div className="pp-error-emoji">¯\_(ツ)_/¯</div>
        <h1>Profile not found</h1>
        <p>{error || "This profile doesn't exist or has been removed."}</p>
        <Link to="/" className="pp-home-link">← Back to QRCard</Link>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const hasSocials = profile.social_links && Object.values(profile.social_links).some(v => v);

  return (
    <div className="pp-page">
      {toast && <div className="pp-toast">{toast}</div>}

      <div className="pp-card">
        {/* Cover */}
        <div className="pp-cover">
          <div className="pp-cover-bg" />
          <div className="pp-avatar-ring">
            {avatarUrl
              ? <img src={avatarUrl} alt={profile.full_name} className="pp-avatar-img" />
              : <div className="pp-avatar-initials">{getInitials(profile.full_name)}</div>
            }
          </div>
        </div>

        {/* Identity */}
        <div className="pp-identity">
          <h1 className="pp-name">{profile.full_name}</h1>
          {(profile.job_title || profile.company) && (
            <p className="pp-role">
              {profile.job_title}
              {profile.job_title && profile.company && <span className="pp-role-sep">·</span>}
              {profile.company}
            </p>
          )}
          {profile.bio && <p className="pp-bio">{profile.bio}</p>}
        </div>

        {/* Social links */}
        {hasSocials && (
          <div className="pp-socials">
            {profile.social_links.linkedin && (
              <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="pp-social-btn pp-social-linkedin" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
            {profile.social_links.github && (
              <a href={profile.social_links.github} target="_blank" rel="noreferrer" className="pp-social-btn pp-social-github" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </a>
            )}
            {profile.social_links.twitter && (
              <a href={profile.social_links.twitter} target="_blank" rel="noreferrer" className="pp-social-btn pp-social-twitter" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {profile.social_links.instagram && (
              <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="pp-social-btn pp-social-instagram" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Contact rows */}
        {(profile.phone || profile.public_email || profile.website) && (
          <div className="pp-contacts">
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="pp-contact-row">
                <span className="pp-contact-icon"><PhoneIcon /></span>
                <span className="pp-contact-text">{profile.phone}</span>
              </a>
            )}
            {profile.public_email && (
              <a href={`mailto:${profile.public_email}`} className="pp-contact-row">
                <span className="pp-contact-icon"><MailIcon /></span>
                <span className="pp-contact-text">{profile.public_email}</span>
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="pp-contact-row">
                <span className="pp-contact-icon"><GlobeIcon /></span>
                <span className="pp-contact-text">{profile.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pp-actions">
          <button className="pp-btn-primary" onClick={downloadVCard}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Save Contact
          </button>
          <button className="pp-btn-secondary" onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </button>
        </div>

        {/* Footer */}
        <div className="pp-footer">
          <Link to="/" className="pp-powered-by">
            <span>Powered by</span><strong>QRCard</strong>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import "../CSS/PublicProfile.css";

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/public/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load profile");
        }

        setProfile(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const host = API_URL.replace("/api", "");
    return `${host}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const downloadVCard = () => {
    if (!profile) return;

    // Helper to escape values for vCard
    const escapeVCard = (val) => {
      if (!val) return "";
      return String(val)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
    };

    // Extract family and given names
    const parts = (profile.full_name || "").trim().split(/\s+/);
    let family = "";
    let given = "";
    if (parts.length === 1) {
      family = parts[0];
    } else if (parts.length > 1) {
      family = parts.pop();
      given = parts.join(" ");
    }

    const clientUrl = window.location.href;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(profile.full_name || username)}`,
      `N:${escapeVCard(family)};${escapeVCard(given)};;;`,
    ];

    if (profile.company) lines.push(`ORG:${escapeVCard(profile.company)}`);
    if (profile.job_title) lines.push(`TITLE:${escapeVCard(profile.job_title)}`);
    if (profile.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
    if (profile.public_email) lines.push(`EMAIL:${escapeVCard(profile.public_email)}`);
    if (profile.website) lines.push(`URL:${escapeVCard(profile.website)}`);
    lines.push(`URL:${escapeVCard(clientUrl)}`);
    if (profile.bio) {
      lines.push(`NOTE:${escapeVCard(profile.bio.slice(0, 500))}`);
    }

    // Export social links to vCard
    if (profile.social_links) {
      Object.entries(profile.social_links).forEach(([key, value]) => {
        if (value) {
          lines.push(`X-SOCIALPROFILE;TYPE=${key}:${escapeVCard(value)}`);
        }
      });
    }

    lines.push("END:VCARD");
    const vcardContent = lines.join("\n");

    const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${username || "profile"}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || username}'s Digital Business Card`,
          text: `Check out ${profile?.full_name || username}'s digital profile on QRCard!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing profile:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Error copying link:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading digital profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Profile Not Found</h2>
          <p className="error-msg">{error || "The requested profile does not exist or is inactive."}</p>
          <Link to="/" className="back-home-btn">Go to Home</Link>
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profile.avatar_url);

  return (
    <div className="public-profile-container">
      <div className="public-profile-card">
        <div className="profile-card-header">
          <div className="avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.full_name} className="public-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(profile.full_name)}
              </div>
            )}
          </div>
        </div>

        <div className="profile-card-body">
          <h1 className="profile-name">{profile.full_name}</h1>
          <p className="profile-title">
            {profile.job_title} {profile.company && `at ${profile.company}`}
          </p>

          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="contact-info-list">
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-details">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">{profile.phone}</span>
                </div>
              </a>
            )}

            {profile.public_email && (
              <a href={`mailto:${profile.public_email}`} className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-details">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{profile.public_email}</span>
                </div>
              </a>
            )}

            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">🌐</span>
                <div className="contact-details">
                  <span className="contact-label">Website</span>
                  <span className="contact-value">{profile.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                </div>
              </a>
            )}

            {profile.social_links?.linkedin && (
              <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">🔗</span>
                <div className="contact-details">
                  <span className="contact-label">LinkedIn</span>
                  <span className="contact-value">View LinkedIn Profile</span>
                </div>
              </a>
            )}

            {profile.social_links?.github && (
              <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">💻</span>
                <div className="contact-details">
                  <span className="contact-label">GitHub</span>
                  <span className="contact-value">View GitHub Profile</span>
                </div>
              </a>
            )}

            {profile.social_links?.twitter && (
              <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">🐦</span>
                <div className="contact-details">
                  <span className="contact-label">Twitter / X</span>
                  <span className="contact-value">View Twitter Profile</span>
                </div>
              </a>
            )}

            {profile.social_links?.instagram && (
              <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">📸</span>
                <div className="contact-details">
                  <span className="contact-label">Instagram</span>
                  <span className="contact-value">View Instagram Profile</span>
                </div>
              </a>
            )}

            {profile.social_links?.facebook && (
              <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="contact-icon">👥</span>
                <div className="contact-details">
                  <span className="contact-label">Facebook</span>
                  <span className="contact-value">View Facebook Profile</span>
                </div>
              </a>
            )}
          </div>

          <div className="actions-container">
            <button className="add-contact-btn" onClick={downloadVCard}>
              <span>📥</span> Add to Contacts
            </button>
            <button className="share-btn" onClick={handleShare}>
              <span>🔗</span> Share Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

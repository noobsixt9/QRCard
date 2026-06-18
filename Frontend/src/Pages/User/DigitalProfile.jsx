import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/DigitalProfile.css";

const DigitalProfile = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    bio: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [message, setMessage] = useState("");

  const isProfileValid =
    profileData.fullName.trim() &&
    profileData.jobTitle.trim() &&
    profileData.email.trim() &&
    profileData.phone.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, "");
      setProfileData({ ...profileData, fullName: lettersOnly });
      return;
    }

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      setProfileData({ ...profileData, phone: numbersOnly });
      return;
    }

    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfilePhoto(imageUrl);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!isProfileValid) {
      setMessage("Please fill Full Name, Job Title, Email, and Phone Number.");
      return;
    }

    setMessage("Profile saved successfully.");

    console.log({
      ...profileData,
      profilePhoto,
    });
  };

  return (
    <div className="digital-profile-page">
      <Sidebar />

      <main className="digital-profile-content">
        <div className="profile-header">
          <div>
            <h1>Digital Profile</h1>
            <p>
              Add and update your personal, professional, contact, and social
              media details.
            </p>
          </div>
        </div>

        <div className="profile-layout">
          <section className="profile-form-card">
            <h2>Basic Information</h2>

            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </div>

              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={profileData.jobTitle}
                  onChange={handleChange}
                  placeholder="Backend Developer"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={profileData.company}
                  onChange={handleChange}
                  placeholder="QR Card Nepal"
                />
              </div>

              <div className="photo-group">
                <label>Profile Photo</label>

                <div className="photo-row">
                  <div className="profile-avatar">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" />
                    ) : (
                      "AK"
                    )}
                  </div>

                  <label className="upload-photo-btn">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="form-section-title">
                <h2>Contact Details</h2>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  placeholder="xyz@gmail.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength="15"
                  placeholder="9800000000"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  name="website"
                  value={profileData.website}
                  onChange={handleChange}
                  placeholder="www.qrcard.com"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  placeholder="Kathmandu"
                />
              </div>

              <div className="form-group full-width">
                <label>Short Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  placeholder="Write a short professional bio..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="save-profile-btn"
                disabled={!isProfileValid}
              >
                Save Profile
              </button>

              {message && (
                <p
                  className={
                    isProfileValid
                      ? "profile-save-message success-message"
                      : "profile-save-message error-message"
                  }
                >
                  {message}
                </p>
              )}
            </form>
          </section>

          <aside className="profile-side">
            <div className="profile-status-card">
              <h3>Profile Completeness</h3>
              <h1>75%</h1>

              <div className="progress-bar">
                <span></span>
              </div>

              <p className="success">✓ Basic information added</p>
              <p className="success">✓ Contact information added</p>
              <p className="error">× Social links missing</p>
              <p className="error">× Bio needs improvement</p>
            </div>

            <div className="ai-suggestion-card">
              <h3>AI Suggestion</h3>
              <p>
                Your profile can be improved by adding a stronger professional
                bio and social links.
              </p>

              <button type="button" onClick={() => navigate("/ai-bio")}>
                Generate Bio
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DigitalProfile;
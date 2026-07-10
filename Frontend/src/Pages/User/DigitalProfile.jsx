// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../../Component/User/Sidebar";
// import "../../CSS/User/DigitalProfile.css";

// const DigitalProfile = () => {
//   const navigate = useNavigate();

//   const [profileData, setProfileData] = useState({
//     fullName: "",
//     jobTitle: "",
//     company: "",
//     email: "",
//     phone: "",
//     website: "",
//     address: "",
//     bio: "",
//   });

//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [message, setMessage] = useState("");

//   const isProfileValid =
//     profileData.fullName.trim() &&
//     profileData.jobTitle.trim() &&
//     profileData.email.trim() &&
//     profileData.phone.trim();

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "fullName") {
//       const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, "");
//       setProfileData({ ...profileData, fullName: lettersOnly });
//       return;
//     }

//     if (name === "phone") {
//       const numbersOnly = value.replace(/\D/g, "");
//       setProfileData({ ...profileData, phone: numbersOnly });
//       return;
//     }

//     setProfileData({
//       ...profileData,
//       [name]: value,
//     });
//   };

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];

//     if (!file) return;

//     const imageUrl = URL.createObjectURL(file);
//     setProfilePhoto(imageUrl);
//   };

//   const handleSaveProfile = (e) => {
//     e.preventDefault();

//     if (!isProfileValid) {
//       setMessage("Please fill Full Name, Job Title, Email, and Phone Number.");
//       return;
//     }

//     setMessage("Profile saved successfully.");

//     console.log({
//       ...profileData,
//       profilePhoto,
//     });
//   };

//   return (
//     <div className="digital-profile-page">
//       <Sidebar />

//       <main className="digital-profile-content">
//         <div className="profile-header">
//           <div>
//             <h1>Digital Profile</h1>
//             <p>
//               Add and update your personal, professional, contact, and social
//               media details.
//             </p>
//           </div>
//         </div>

//         <div className="profile-layout">
//           <section className="profile-form-card">
//             <h2>Basic Information</h2>

//             <form className="profile-form" onSubmit={handleSaveProfile}>
//               <div className="form-group">
//                 <label>Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleChange}
//                   placeholder="Your Name"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Job Title</label>
//                 <input
//                   type="text"
//                   name="jobTitle"
//                   value={profileData.jobTitle}
//                   onChange={handleChange}
//                   placeholder="Backend Developer"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Company</label>
//                 <input
//                   type="text"
//                   name="company"
//                   value={profileData.company}
//                   onChange={handleChange}
//                   placeholder="QR Card Nepal"
//                 />
//               </div>

//               <div className="photo-group">
//                 <label>Profile Photo</label>

//                 <div className="photo-row">
//                   <div className="profile-avatar">
//                     {profilePhoto ? (
//                       <img src={profilePhoto} alt="Profile" />
//                     ) : (
//                       "AK"
//                     )}
//                   </div>

//                   <label className="upload-photo-btn">
//                     Upload Photo
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handlePhotoUpload}
//                     />
//                   </label>
//                 </div>
//               </div>

//               <div className="form-section-title">
//                 <h2>Contact Details</h2>
//               </div>

//               <div className="form-group">
//                 <label>Email Address</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={profileData.email}
//                   onChange={handleChange}
//                   placeholder="xyz@gmail.com"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Phone Number</label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={profileData.phone}
//                   onChange={handleChange}
//                   inputMode="numeric"
//                   maxLength="15"
//                   placeholder="9800000000"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Website</label>
//                 <input
//                   type="text"
//                   name="website"
//                   value={profileData.website}
//                   onChange={handleChange}
//                   placeholder="www.qrcard.com"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Address</label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={profileData.address}
//                   onChange={handleChange}
//                   placeholder="Kathmandu"
//                 />
//               </div>

//               <div className="form-group full-width">
//                 <label>Short Bio</label>
//                 <textarea
//                   name="bio"
//                   value={profileData.bio}
//                   onChange={handleChange}
//                   placeholder="Write a short professional bio..."
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 className="save-profile-btn"
//                 disabled={!isProfileValid}
//               >
//                 Save Profile
//               </button>

//               {message && (
//                 <p
//                   className={
//                     isProfileValid
//                       ? "profile-save-message success-message"
//                       : "profile-save-message error-message"
//                   }
//                 >
//                   {message}
//                 </p>
//               )}
//             </form>
//           </section>

//           <aside className="profile-side">
//             <div className="profile-status-card">
//               <h3>Profile Completeness</h3>
//               <h1>75%</h1>

//               <div className="progress-bar">
//                 <span></span>
//               </div>

//               <p className="success">✓ Basic information added</p>
//               <p className="success">✓ Contact information added</p>
//               <p className="error">× Social links missing</p>
//               <p className="error">× Bio needs improvement</p>
//             </div>

//             <div className="ai-suggestion-card">
//               <h3>AI Suggestion</h3>
//               <p>
//                 Your profile can be improved by adding a stronger professional
//                 bio and social links.
//               </p>

//               <button type="button" onClick={() => navigate("/ai-bio")}>
//                 Generate Bio
//               </button>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DigitalProfile;








import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/DigitalProfile.css";
import { API_URL, getHeaders } from "../../config/api";
import { createWorker } from "tesseract.js";

const cleanLine = (line) =>
  line
    .replace(/[|•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractCardInformation = (text) => {
  const rawLines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  
  let email = "";
  let website = "";
  let phone = "";
  let address = "";
  let fullName = "";
  let jobTitle = "";
  let company = "";

  const lines = [];

  for (let line of rawLines) {
    const clean = line.replace(/[|•]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) continue;

    // Try to extract email
    const emailMatch = clean.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch && !email) {
      email = emailMatch[0];
      continue;
    }

    // Try to extract website
    const webMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
    if (webMatch && !webMatch[0].includes("@") && !website) {
      website = webMatch[0];
      continue;
    }

    // Try to extract phone
    const phoneMatch = clean.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    if (phoneMatch && !phone) {
      phone = phoneMatch[0].replace(/[^\d+]/g, "");
      continue;
    }

    // Check if line contains address keywords
    if (/\b(street|road|avenue|city|kathmandu|nepal|usa|uk|india|district|zone|highway|chowk)\b/i.test(clean) && !address) {
      address = clean.replace(/^(address|location|loc|addr):/i, "").trim();
      continue;
    }

    lines.push(clean);
  }

  // Filter out lines containing email, website, phone or generic labels
  const infoLines = lines.filter(line => {
    const lower = line.toLowerCase();
    if (email && lower.includes(email.toLowerCase())) return false;
    if (website && lower.includes(website.toLowerCase())) return false;
    if (phone && lower.includes(phone)) return false;
    if (
      lower.startsWith("email:") || 
      lower.startsWith("mail:") || 
      lower.startsWith("phone:") || 
      lower.startsWith("tel:") || 
      lower.startsWith("web:") ||
      lower.startsWith("website:") ||
      lower.startsWith("mobile:") ||
      lower.startsWith("fax:")
    ) {
      return false;
    }
    return true;
  });

  // Assign remaining lines with prefix cleanups
  if (infoLines.length > 0) {
    fullName = infoLines[0].replace(/^(name|full name|fullname|mr\.|ms\.|dr\.):/i, "").trim();
  }
  if (infoLines.length > 1) {
    jobTitle = infoLines[1].replace(/^(title|job title|designation|role):/i, "").trim();
  }
  if (infoLines.length > 2) {
    company = infoLines[2].replace(/^(company|co|organization|org):/i, "").trim();
  }

  return {
    fullName,
    jobTitle,
    company,
    email,
    phone,
    website,
    address,
    rawText: text.trim(),
  };
};

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
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [completenessScore, setCompletenessScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [selectedCardFile, setSelectedCardFile] = useState(null);
  const [cardPreview, setCardPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [scanMessageType, setScanMessageType] = useState("");

  useEffect(() => {
    return () => {
      if (cardPreview) {
        URL.revokeObjectURL(cardPreview);
      }
    };
  }, [cardPreview]);

  const isProfileValid =
    profileData.fullName.trim() &&
    profileData.jobTitle.trim() &&
    profileData.email.trim() &&
    profileData.phone.trim();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: getHeaders(null),
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(result.message || "Failed to load profile.");
        }

        const profile = result.data?.profile || result.data || {};

        setProfileData({
          fullName: profile.full_name || "",
          jobTitle: profile.job_title || "",
          company: profile.company || "",
          email: profile.public_email || "",
          phone: profile.phone || "",
          website: profile.website || "",
          address: profile.address || "",
          bio: profile.bio || "",
        });

        setProfilePhoto(profile.avatar_url || null);
        setCompletenessScore(profile.completeness_score || 0);
      } catch (error) {
        console.error("Profile fetch error:", error);

        setMessage(error.message || "Unable to load profile.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMessage("");

    if (name === "fullName") {
      const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, "");

      setProfileData((previousData) => ({
        ...previousData,
        fullName: lettersOnly,
      }));

      return;
    }

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");

      setProfileData((previousData) => ({
        ...previousData,
        phone: numbersOnly,
      }));

      return;
    }

    setProfileData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      setMessageType("error");
      return;
    }

    setSelectedPhoto(file);
    setProfilePhoto(URL.createObjectURL(file));
    setMessage("");
  };

  const handleCardFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setScanMessage("Please select a JPG, PNG, or WEBP image.");
      setScanMessageType("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScanMessage("The image must be smaller than 10 MB.");
      setScanMessageType("error");
      return;
    }

    setSelectedCardFile(file);
    setCardPreview(URL.createObjectURL(file));
    setScanProgress(0);
    setScanMessage("");
    setScanMessageType("");
  };

  const handleScanCard = async () => {
    if (!selectedCardFile) {
      setScanMessage("Please choose a visiting-card image first.");
      setScanMessageType("error");
      return;
    }

    let worker;

    try {
      setScanning(true);
      setScanProgress(0);
      setScanMessage("Preparing OCR...");
      setScanMessageType("info");

      worker = await createWorker("eng", 1, {
        logger: (status) => {
          if (status.status === "recognizing text") {
            const currentProgress = Math.round((status.progress || 0) * 100);
            setScanProgress(currentProgress);
            setScanMessage(`Scanning card details: ${currentProgress}%`);
          }
        },
      });

      const result = await worker.recognize(selectedCardFile);
      const extractedText = result.data.text || "";

      if (!extractedText.trim()) {
        throw new Error("No readable text was found. Try a clearer card image.");
      }

      console.log("Extracted OCR Text:", extractedText);
      const card = extractCardInformation(extractedText);
      console.log("Parsed Card Data:", card);

      // Autofill profile inputs!
      setProfileData((prev) => ({
        ...prev,
        fullName: card.fullName || prev.fullName,
        jobTitle: card.jobTitle || prev.jobTitle,
        company: card.company || prev.company,
        email: card.email || prev.email,
        phone: card.phone || prev.phone,
        website: card.website || prev.website,
        address: card.address || prev.address,
      }));

      setScanProgress(100);
      setScanMessage("Card details scanned & filled successfully!");
      setScanMessageType("success");
    } catch (error) {
      console.error("Scan error:", error);
      setScanMessage(error.message || "Unable to read the visiting card.");
      setScanMessageType("error");
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setScanning(false);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedPhoto) return null;

    const avatarData = new FormData();
    avatarData.append("avatar", selectedPhoto);

    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: "POST",
      headers: getHeaders(null),
      body: avatarData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Profile saved, but avatar upload failed.");
    }

    return result.data;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!isProfileValid) {
      setMessage(
        "Please fill Full Name, Job Title, Email, and Phone Number."
      );
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          full_name: profileData.fullName.trim(),
          job_title: profileData.jobTitle.trim(),
          company: profileData.company.trim(),
          public_email: profileData.email.trim(),
          phone: profileData.phone.trim(),
          website: profileData.website.trim(),
          address: profileData.address.trim(),
          bio: profileData.bio.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save profile.");
      }

      const updatedProfile =
        result.data?.profile || result.data || {};

      if (selectedPhoto) {
        const avatarResult = await uploadAvatar();

        const uploadedAvatar =
          avatarResult?.avatar_url ||
          avatarResult?.profile?.avatar_url;

        if (uploadedAvatar) {
          setProfilePhoto(uploadedAvatar);
        }

        setSelectedPhoto(null);
      }

      setCompletenessScore(
        updatedProfile.completeness_score ?? completenessScore
      );

      setMessage("Profile saved successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Profile save error:", error);

      setMessage(error.message || "Unable to save profile.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const initials = profileData.fullName
    ? profileData.fullName
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  if (loading) {
    return (
      <div className="digital-profile-page">
        <Sidebar />

        <main className="digital-profile-content">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

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
                      initials
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
                />
              </div>

              <button
                type="submit"
                className="save-profile-btn"
                disabled={!isProfileValid || saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              {message && (
                <p
                  className={`profile-save-message ${
                    messageType === "success"
                      ? "success-message"
                      : "error-message"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </section>

          <aside className="profile-side">
            <div className="physical-card-scanner-card">
              <h3>Already Have a Physical Visiting Card?</h3>
              <p>
                Upload your existing printed visiting card and convert it into your
                online digital profile details automatically.
              </p>
              
              <label className="scanner-upload-area">
                {cardPreview ? (
                  <img
                    src={cardPreview}
                    alt="Selected visiting card"
                  />
                ) : (
                  <>
                    <strong>Upload your visiting card</strong>
                    <span>JPG, PNG or WEBP</span>
                  </>
                )}

                <span className="save-profile-btn" style={{ fontSize: "11px", height: "auto", padding: "6px 12px", width: "auto", marginTop: "10px", display: "inline-block" }}>
                  {cardPreview ? "Change Card Image" : "Choose Card Image"}
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCardFileChange}
                />
              </label>

              {scanning && (
                <div className="scanner-progress-track">
                  <span style={{ width: `${scanProgress}%` }} />
                </div>
              )}

              {scanMessage && (
                <p className={`scanner-message ${scanMessageType}`}>
                  {scanMessage}
                </p>
              )}

              <button
                type="button"
                className="scanner-btn"
                onClick={handleScanCard}
                disabled={!selectedCardFile || scanning}
              >
                {scanning
                  ? `Scanning ${scanProgress}%`
                  : "Scan & Autofill Details"}
              </button>
            </div>

            <div className="profile-status-card">
              <h3>Profile Completeness</h3>
              <h1>{completenessScore}%</h1>

              <div className="progress-bar">
                <span
                  style={{
                    width: `${completenessScore}%`,
                  }}
                />
              </div>

              <p className={profileData.fullName ? "success" : "error"}>
                {profileData.fullName ? "✓" : "×"} Basic information added
              </p>

              <p
                className={
                  profileData.email && profileData.phone
                    ? "success"
                    : "error"
                }
              >
                {profileData.email && profileData.phone ? "✓" : "×"} Contact
                information added
              </p>

              <p className="error">× Social links missing</p>

              <p className={profileData.bio ? "success" : "error"}>
                {profileData.bio ? "✓ Bio added" : "× Bio needs improvement"}
              </p>
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
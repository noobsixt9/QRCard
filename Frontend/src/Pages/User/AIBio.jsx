import { useEffect, useState } from "react";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/AIBio.css";

const AIBio = () => {
  const [formData, setFormData] = useState({
    profession: "",
    skills: "",
    experience: "",
    company: "",
  });

  const [tone, setTone] = useState("Professional");
  const [generatedBio, setGeneratedBio] = useState(
    "Rajan Kshedal is a backend developer with experience in building secure and scalable web applications using Node.js, Express.js, and PostgreSQL. He is passionate about creating reliable digital solutions and improving user experiences through clean system design and efficient development."
  );

  const [score, setScore] = useState(75);
  const [suggestions, setSuggestions] = useState([
    "Add LinkedIn profile link",
    "Improve your bio with stronger professional keywords",
    "Add company website for better profile completeness",
    "Include a clearer professional role title",
  ]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Fetch completeness profile score and suggestions on mount
    const fetchCompleteness = async () => {
      try {
        const response = await fetch(`${API_URL}/ai/completeness`, {
          method: "GET",
          headers: getHeaders(null),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          setScore(result.data.score);
          if (result.data.suggestions && result.data.suggestions.length > 0) {
            setSuggestions(result.data.suggestions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch completeness profile score:", err.message);
      }
    };

    fetchCompleteness();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Generate offline using local templates
  const generateOfflineBio = () => {
    const profession = formData.profession || "backend developer";
    const skills = formData.skills || "Node.js, Express.js, PostgreSQL, and REST API";
    const experience = formData.experience || "2 years of backend development experience";
    const company = formData.company || "QRCard Nepal";

    let bioText = "";

    if (tone === "Professional") {
      bioText = `${profession} with ${experience}, skilled in ${skills}. Currently associated with ${company}, focused on building secure, scalable, and user-friendly digital solutions.`;
    } else if (tone === "Friendly") {
      bioText = `Hi, I am a ${profession} with ${experience}. I enjoy working with ${skills} and creating useful digital solutions through ${company}.`;
    } else if (tone === "Creative") {
      bioText = `A passionate ${profession} turning ideas into reliable digital products. With ${experience} and skills in ${skills}, I build clean and meaningful solutions for users.`;
    } else if (tone === "Short") {
      bioText = `${profession} skilled in ${skills}, with ${experience}.`;
    }

    setGeneratedBio(bioText);
    setMessage("Bio generated successfully (Local Template).");
    setMessageType("success");
  };

  // Generate online via Backend AI / Gemini
  const generateAIBio = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/ai/bio`, {
        method: "POST",
        headers: getHeaders(null),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to generate bio via AI");
      }

      setGeneratedBio(result.data.bio);
      setMessage("AI Bio generated successfully from your profile!");
      setMessageType("success");
    } catch (err) {
      console.warn("AI generation failed, falling back to local template:", err.message);
      // Fallback to local template generation if Backend/Gemini fails
      generateOfflineBio();
    } finally {
      setGenerating(false);
    }
  };

  const copyBio = async () => {
    try {
      await navigator.clipboard.writeText(generatedBio);
      setMessage("Bio copied to clipboard.");
      setMessageType("success");
    } catch {
      setMessage("Could not copy bio.");
      setMessageType("error");
    }
  };

  const useThisBio = async () => {
    // Save to profile directly!
    try {
      setMessage("Saving bio to your profile...");
      setMessageType("info");

      // First fetch current profile so we don't clear other fields
      const getProfileRes = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: getHeaders(null),
      });

      const profileResult = await getProfileRes.json();
      if (!getProfileRes.ok) {
        throw new Error(profileResult.message || "Failed to fetch profile");
      }

      const existingProfile = profileResult.data;

      // Update profile with the new bio
      const updateRes = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          full_name: existingProfile.full_name,
          job_title: existingProfile.job_title,
          company: existingProfile.company,
          public_email: existingProfile.public_email,
          phone: existingProfile.phone,
          website: existingProfile.website,
          address: existingProfile.address,
          bio: generatedBio,
        }),
      });

      const updateResult = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateResult.message || "Failed to save bio");
      }

      setMessage("Bio successfully saved and updated in your profile!");
      setMessageType("success");

      // Reload completeness
      const compRes = await fetch(`${API_URL}/ai/completeness`, {
        method: "GET",
        headers: getHeaders(null),
      });
      const compResult = await compRes.json();
      if (compRes.ok && compResult.success) {
        setScore(compResult.data.score);
        setSuggestions(compResult.data.suggestions);
      }
    } catch (err) {
      console.error(err);
      setMessage(`Failed to update profile bio: ${err.message}`);
      setMessageType("error");
    }
  };

  return (
    <div className="ai-bio-page">
      <Sidebar />

      <main className="ai-bio-main">
        <div className="ai-bio-header">
          <h1>AI Bio Generator</h1>
          <p>
            Generate a professional bio and improve your digital profile with AI
            suggestions.
          </p>
        </div>

        <section className="ai-bio-layout">
          <div className="bio-details-card">
            <h2>Bio Generator</h2>

            <p className="card-subtitle">
              Click the main button to generate an AI bio using your profile details, or enter customized details below for local templates.
            </p>

            <form className="bio-form" onSubmit={generateAIBio}>
              <div className="bio-form-group">
                <label>Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Backend Developer"
                />
              </div>

              <div className="bio-form-group">
                <label>Skills</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="Node.js, Express.js, PostgreSQL, REST API"
                ></textarea>
              </div>

              <div className="bio-form-group">
                <label>Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="2 years in backend development"
                />
              </div>

              <div className="bio-form-group">
                <label>Company / Business</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="QRCard Nepal"
                />
              </div>

              <div className="tone-section">
                <label>Tone</label>
                <div className="tone-options">
                  {["Professional", "Friendly", "Creative", "Short"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          tone === item ? "tone-pill active" : "tone-pill"
                        }
                        onClick={() => setTone(item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="generate-bio-btn" 
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Bio"}
              </button>
            </form>
          </div>

          <div className="bio-result-column">
            <div className="generated-bio-card">
              <h2>Generated Bio Preview</h2>

              <div className="generated-bio-box">
                <p>{generatedBio}</p>
              </div>

              <div className="bio-action-buttons">
                <button
                  type="button"
                  className="use-bio-btn"
                  onClick={useThisBio}
                >
                  Use This Bio
                </button>

                <button
                  type="button"
                  className="secondary-bio-btn"
                  disabled={generating}
                  onClick={generateAIBio}
                >
                  {generating ? "Generating..." : "Regenerate"}
                </button>

                <button
                  type="button"
                  className="outline-bio-btn"
                  onClick={copyBio}
                >
                  Copy
                </button>
              </div>

              {message && (
                <p className={`bio-message ${messageType}`}>
                  {message}
                </p>
              )}
            </div>

            <div className="bio-suggestion-card">
              <h2>Profile Completeness: {score}%</h2>
              <div style={{
                background: "#e5e7eb",
                height: "8px",
                borderRadius: "4px",
                overflow: "hidden",
                margin: "12px 0 20px"
              }}>
                <div style={{
                  background: "var(--primary-color)",
                  width: `${score}%`,
                  height: "100%",
                  transition: "width 0.4s ease"
                }}></div>
              </div>

              <h2>Improvement Suggestions</h2>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIBio;
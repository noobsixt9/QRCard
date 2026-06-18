import { useState } from "react";
import Sidebar from "../../Component/User/Sidebar";
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

  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateBio = (e) => {
    e.preventDefault();

    const profession = formData.profession || "backend developer";
    const skills =
      formData.skills || "Node.js, Express.js, PostgreSQL, and REST API";
    const experience =
      formData.experience || "2 years of backend development experience";
    const company = formData.company || "QRCard Nepal";

    let bioText = "";

    if (tone === "Professional") {
      bioText = `${profession} with ${experience}, skilled in ${skills}. Currently associated with ${company}, focused on building secure, scalable, and user-friendly digital solutions.`;
    }

    if (tone === "Friendly") {
      bioText = `Hi, I am a ${profession} with ${experience}. I enjoy working with ${skills} and creating useful digital solutions through ${company}.`;
    }

    if (tone === "Creative") {
      bioText = `A passionate ${profession} turning ideas into reliable digital products. With ${experience} and skills in ${skills}, I build clean and meaningful solutions for users.`;
    }

    if (tone === "Short") {
      bioText = `${profession} skilled in ${skills}, with ${experience}.`;
    }

    setGeneratedBio(bioText);
    setMessage("Bio generated successfully.");
  };

  const copyBio = async () => {
    try {
      await navigator.clipboard.writeText(generatedBio);
      setMessage("Bio copied to clipboard.");
    } catch {
      setMessage("Could not copy bio.");
    }
  };

  const useThisBio = () => {
    setMessage("This bio is selected for your profile.");
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
            <h2>Enter Bio Details</h2>

            <p className="card-subtitle">
              Provide some details and let AI generate a professional bio for
              your profile.
            </p>

            <form className="bio-form" onSubmit={generateBio}>
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

              <button type="submit" className="generate-bio-btn">
                Generate Bio
              </button>
            </form>
          </div>

          <div className="bio-result-column">
            <div className="generated-bio-card">
              <h2>Generated Bio</h2>

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
                  onClick={generateBio}
                >
                  Regenerate
                </button>

                <button
                  type="button"
                  className="secondary-bio-btn"
                  onClick={copyBio}
                >
                  Copy
                </button>
              </div>

              {message && <p className="bio-message">{message}</p>}
            </div>

            <div className="bio-suggestion-card">
              <h2>Profile Improvement Suggestions</h2>

              <ul>
                <li>Add LinkedIn profile link</li>
                <li>Improve your bio with stronger professional keywords</li>
                <li>Add company website for better profile completeness</li>
                <li>Include a clearer professional role title</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIBio;
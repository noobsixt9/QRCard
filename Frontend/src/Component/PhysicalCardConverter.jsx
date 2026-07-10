import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorker } from "tesseract.js";
import "../CSS/PhysicalCardConverter.css";

const emptyCard = {
  fullName: "",
  jobTitle: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  rawText: "",
};

const cleanLine = (line) =>
  line
    .replace(/[|•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractCardInformation = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

  const website =
    text.match(
      /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?/i
    )?.[0] || "";

  const phoneMatches =
    text.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [];

  const phone = phoneMatches[0]
    ? phoneMatches[0].replace(/[^\d+]/g, "")
    : "";

  const excludedLines = lines.filter((line) => {
    const lowerLine = line.toLowerCase();

    return (
      line !== email &&
      line !== website &&
      !lowerLine.includes("@") &&
      !line.includes(phone) &&
      !/^\+?[\d\s().-]{7,}$/.test(line)
    );
  });

  const fullName = excludedLines[0] || "";
  const jobTitle = excludedLines[1] || "";
  const company = excludedLines[2] || "";

  const address =
    lines.find((line) =>
      /\b(street|road|avenue|city|kathmandu|nepal|usa|uk|india)\b/i.test(line)
    ) || "";

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

const PhysicalCardConverter = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [cardData, setCardData] = useState(emptyCard);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("The image must be smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setCardData(emptyCard);
    setConverted(false);
    setProgress(0);
    setMessage("");
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setMessage("Please choose a visiting-card image first.");
      return;
    }

    let worker;

    try {
      setConverting(true);
      setConverted(false);
      setProgress(0);
      setMessage("Preparing OCR...");

      worker = await createWorker("eng", 1, {
        logger: (status) => {
          if (status.status === "recognizing text") {
            const currentProgress = Math.round(
              (status.progress || 0) * 100
            );

            setProgress(currentProgress);
            setMessage(`Reading card information: ${currentProgress}%`);
          }
        },
      });

      const result = await worker.recognize(selectedFile);
      const extractedText = result.data.text || "";

      if (!extractedText.trim()) {
        throw new Error(
          "No readable text was found. Try a clearer card image."
        );
      }

      const extractedCard = extractCardInformation(extractedText);

      setCardData(extractedCard);
      setConverted(true);
      setProgress(100);
      setMessage("Card information extracted successfully.");

      localStorage.setItem(
        "physicalCardDraft",
        JSON.stringify(extractedCard)
      );
    } catch (error) {
      console.error("OCR error:", error);

      setMessage(
        error.message || "Unable to read the visiting card."
      );
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setConverting(false);
    }
  };

  const handleContinue = () => {
    localStorage.setItem(
      "physicalCardDraft",
      JSON.stringify(cardData)
    );

    const token = localStorage.getItem("token");

    if (token) {
      navigate("/digital-profile");
    } else {
      localStorage.setItem(
        "afterLoginRedirect",
        "/digital-profile"
      );

      navigate("/register");
    }
  };

  const handleMainButton = () => {
    if (converted) {
      handleContinue();
      return;
    }

    handleConvert();
  };

  const displayName = cardData.fullName || "Your Name";
  const displayJobTitle = cardData.jobTitle || "Your Job Title";

  const displayLink =
    cardData.website ||
    cardData.email ||
    "qrcard.com/your-profile";

  const initials = cardData.fullName
    ? cardData.fullName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "QR";

  return (
    <section className="physical-card-section">
      <div className="physical-card-container">
        <div className="physical-card-heading">
          <h2>Already Have a Physical Visiting Card?</h2>

          <p>
            Upload your existing printed visiting card and convert it into an
            online digital profile with a shareable QR code.
          </p>
        </div>

        <div className="physical-converter-box">
          <div className="physical-upload-column">
            <h3>Upload Physical Card</h3>

            <label className="physical-upload-area">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected visiting card"
                  className="uploaded-card-preview"
                />
              ) : (
                <>
                  <strong>Upload your visiting card</strong>
                  <span>JPG, PNG or WEBP</span>
                </>
              )}

              <span className="choose-card-button">
                {imagePreview ? "Change Card Image" : "Choose Card Image"}
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="physical-convert-arrow" aria-hidden="true">
            <span>→</span>
            <small>Convert</small>
          </div>

          <div className="online-card-column">
            <h3>Get Your Online QR Card</h3>

            <div
              className={`online-card-preview ${
                converted ? "converted-card" : ""
              }`}
              onClick={converted ? handleContinue : undefined}
              role={converted ? "button" : undefined}
              tabIndex={converted ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  converted &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  handleContinue();
                }
              }}
            >
              <div className="online-card-avatar">{initials}</div>

              <div className="online-card-information">
                <h4>{displayName}</h4>
                <p>{displayJobTitle}</p>
                <span>{displayLink}</span>
              </div>

              <div className="online-card-qr">QR</div>
            </div>
          </div>
        </div>

        {converting && (
          <div className="ocr-progress">
            <div className="ocr-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {message && (
          <p
            className={`physical-converter-message ${
              converted ? "success" : ""
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          className="convert-physical-card-button"
          onClick={handleMainButton}
          disabled={!selectedFile || converting}
        >
          {converting
            ? `Converting ${progress}%`
            : converted
              ? "Continue to Digital Profile"
              : "Convert My Physical Card"}
        </button>
      </div>
    </section>
  );
};

export default PhysicalCardConverter;
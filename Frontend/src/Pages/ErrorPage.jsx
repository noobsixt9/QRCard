import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/ErrorPage.css";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-badge">404</div>

        <h1>Page Not Found</h1>

        <p>
          The page you are looking for does not exist, has been removed, or the
          link may be incorrect.
        </p>

        <div className="error-actions">
          <button
            type="button"
            className="error-btn secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>

          <Link to="/" className="error-btn primary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
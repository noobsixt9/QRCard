/* eslint-disable react-refresh/only-export-components */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const SCRIPT_ID = "recaptcha-script";

function waitForRecaptcha() {
  return new Promise((resolve) => {
    if (window.grecaptcha?.render) {
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);

    const finish = () => {
      const poll = () => {
        if (window.grecaptcha?.render) {
          window.grecaptcha.ready(() => resolve(window.grecaptcha));
          return;
        }
        setTimeout(poll, 100);
      };
      poll();
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      finish();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = finish;
    document.body.appendChild(script);
  });
}

export function useRecaptchaScript() {
  useEffect(() => {
    waitForRecaptcha().catch((err) => {
      console.error("Failed to load reCAPTCHA:", err);
    });
  }, []);
}

const RecaptchaWidget = forwardRef(function RecaptchaWidget({ widgetKey = "default" }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getToken() {
      if (widgetIdRef.current == null) return "";
      return window.grecaptcha?.getResponse(widgetIdRef.current) || "";
    },
    reset() {
      if (widgetIdRef.current != null) {
        window.grecaptcha?.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    let cancelled = false;

    const mountWidget = async () => {
      try {
        const grecaptcha = await waitForRecaptcha();
        if (cancelled || !containerRef.current) return;

        if (widgetIdRef.current != null) {
          try {
            grecaptcha.reset(widgetIdRef.current);
          } catch {
            // ignore reset errors during remount
          }
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = "";

        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
        });
      } catch (err) {
        console.error("reCAPTCHA render failed:", err);
      }
    };

    mountWidget();

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
    };
  }, [widgetKey]);

  return (
    <div className="recaptcha-outer-container">
      <div ref={containerRef} />
    </div>
  );
});

export default RecaptchaWidget;

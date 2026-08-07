import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LflckwtAAAAAHbMia_2Wkfy3j-5FyDdCVszeu65";

export function useRecaptchaScript() {
  useEffect(() => {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);
}

const RecaptchaWidget = forwardRef(({ widgetKey = "default" }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef  = useRef(null);
  const tokenRef     = useRef(null);

  const doReset = () => {
    tokenRef.current = null;
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) {}
    }
  };

  useImperativeHandle(ref, () => ({
    // Consume the token and immediately reset the widget so it requires re-check
    getToken: () => {
      const token = tokenRef.current;
      if (token) doReset(); // single-use: reset as soon as the token is read
      return token;
    },
    reset: doReset,
  }));

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const tryRender = () => {
      if (window.grecaptcha?.render && containerRef.current && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (token) => { tokenRef.current = token; },
            "expired-callback": () => {
              tokenRef.current = null;
              try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) {}
            },
            "error-callback": () => {
              tokenRef.current = null;
            },
          });
        } catch (_) {}
        return;
      }
      if (attempts++ < maxAttempts) setTimeout(tryRender, 200);
    };

    tryRender();

    return () => {
      widgetIdRef.current = null;
      tokenRef.current    = null;
    };
  }, [widgetKey]);

  return <div ref={containerRef} />;
});

RecaptchaWidget.displayName = "RecaptchaWidget";
export default RecaptchaWidget;

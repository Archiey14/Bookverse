import { useEffect, useRef } from "react";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";
let googleScriptPromise;

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);

      if (!script) {
        script = document.createElement("script");
        script.src = GOOGLE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", resolve, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Google sign-in could not be loaded.")),
        { once: true },
      );
    });
  }

  return googleScriptPromise;
}

function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;

    let active = true;
    loadGoogleIdentity()
      .then(() => {
        if (!active || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) onCredential(credential);
            else onError("Google did not return a sign-in credential.");
          },
          auto_select: false,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: Math.min(buttonRef.current.clientWidth, 360),
        });
      })
      .catch((error) => {
        if (active) onError(error.message);
      });

    return () => {
      active = false;
      buttonRef.current?.replaceChildren();
    };
  }, [clientId, onCredential, onError]);

  if (!clientId) {
    return (
      <p className="google-setup-note">
        Google sign-in needs a Google OAuth client ID in the frontend environment.
      </p>
    );
  }

  return <div className="google-sign-in" ref={buttonRef} />;
}

export default GoogleSignInButton;

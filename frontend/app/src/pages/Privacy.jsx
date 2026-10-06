import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./Legal.css";

function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy · Bookverse";
  }, []);

  return (
    <PageLayout>
      <div className="legal-page">
        <article className="legal-container">
          <header className="legal-header">
            <span className="legal-kicker">PRIVACY & DATA PROTECTION</span>
            <h1>Privacy Policy</h1>
            <div className="legal-meta">
              <span>Effective Date: October 2026</span>
              <span>•</span>
              <span>Last Updated: October 2026</span>
            </div>
            <p className="legal-lead">
              At Bookverse, we treat your reading privacy as sacred. This Privacy
              Policy outlines the types of information we collect, how it is
              protected, and the choices you have regarding your personal data.
            </p>
          </header>

          <div className="legal-content">
            <section className="legal-section">
              <h2>
                <span className="section-num">01.</span> Our Reader-First Philosophy
              </h2>
              <p>
                We believe reading should be peaceful and free from invasive
                tracking. We never sell your personal information or reading history
                to third-party advertising brokers. Your data is used exclusively to
                power your bookstore experience, keep your wishlist synchronized, and
                deliver your orders safely.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">02.</span> Information We Collect
              </h2>
              <p>We collect information you provide directly to us:</p>
              <ul>
                <li>
                  <strong>Account Data:</strong> Your name, email address, and hashed
                  passwords when you create an account or sign in via Google OAuth.
                </li>
                <li>
                  <strong>Reading Preferences:</strong> Books saved to your wishlist,
                  items in your shopping bag, and reader reviews you choose to publish.
                </li>
                <li>
                  <strong>Order Records:</strong> Shipping addresses, contact details,
                  and itemized order receipts required for doorstep fulfillment.
                </li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">03.</span> How We Use Your Data
              </h2>
              <p>Your information is used solely for the following purposes:</p>
              <ul>
                <li>Processing book purchases and coordinating courier delivery.</li>
                <li>Synchronizing your shopping bag and wishlist across devices.</li>
                <li>Generating personalized book recommendations based on your tastes.</li>
                <li>Sending essential transactional notifications and order receipts.</li>
                <li>Maintaining the security and stability of the platform.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">04.</span> Payment Security & Third Parties
              </h2>
              <p>
                Payments are processed through PCI-DSS compliant payment gateways,
                such as Razorpay. Bookverse does not capture, store, or view your full
                credit or debit card credentials. For users opting for Google
                Authentication, Google shares verified profile details (name and email)
                strictly with your explicit permission.
              </p>
              <div className="legal-highlight-box">
                All data transmission between your browser and Bookverse is encrypted
                using industry-standard Transport Layer Security (TLS/HTTPS).
              </div>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">05.</span> Local Storage & Cookies
              </h2>
              <p>
                We use browser localStorage and essential session tokens to remember
                your login state and active bag contents. We do not deploy third-party
                tracking cookies or behavioral surveillance pixels.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">06.</span> Data Retention & Your Rights
              </h2>
              <p>
                You retain complete control over your personal data. You have the right
                to:
              </p>
              <ul>
                <li>Access and review the personal information associated with your account.</li>
                <li>Update your profile information or change your password at any time.</li>
                <li>Delete your account and request complete erasure of your profile and data.</li>
              </ul>
              <p>
                To request data deletion or an export of your information, please email
                our privacy team at <strong>privacy@bookverse.local</strong>.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">07.</span> Changes to This Policy
              </h2>
              <p>
                We may update our Privacy Policy as we introduce new features or
                regulations change. Any material revisions will be reflected on this
                page with an updated effective date.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">08.</span> Contact Us
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or how your data is
                handled, please reach out to our privacy officer at{" "}
                <strong>privacy@bookverse.local</strong>.
              </p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/terms">View Terms & Conditions →</Link>
            <Link to="/books">Back to Bookstore →</Link>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}

export default Privacy;

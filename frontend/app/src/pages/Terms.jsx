import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./Legal.css";

function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms & Conditions · Bookverse";
  }, []);

  return (
    <PageLayout>
      <div className="legal-page">
        <article className="legal-container">
          <header className="legal-header">
            <span className="legal-kicker">LEGAL DOCUMENTATION</span>
            <h1>Terms & Conditions</h1>
            <div className="legal-meta">
              <span>Effective Date: October 2026</span>
              <span>•</span>
              <span>Last Updated: October 2026</span>
            </div>
            <p className="legal-lead">
              Welcome to Bookverse. Please review these Terms and Conditions
              carefully before accessing our digital bookstore, placing orders, or
              utilizing our reading community features.
            </p>
          </header>

          <div className="legal-content">
            <section className="legal-section">
              <h2>
                <span className="section-num">01.</span> Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Bookverse website, storefront, or related
                services, you confirm that you have read, understood, and agree to be
                bound by these Terms and Conditions and our Privacy Policy. If you do
                not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">02.</span> Account Registration & Security
              </h2>
              <p>
                To access features such as shopping bags, synced wishlists, order
                tracking, and review submissions, you must create a Bookverse account.
                You are responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your login credentials.</li>
                <li>All activities that occur under your account.</li>
                <li>Providing accurate, current, and complete registration information.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that provide
                fraudulent information or violate our community standards.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">03.</span> Orders, Pricing & Inventory
              </h2>
              <p>
                All book orders placed through Bookverse are subject to acceptance
                and product availability.
              </p>
              <ul>
                <li>
                  <strong>Pricing:</strong> All listed prices are displayed in USD ($)
                  and are inclusive of applicable taxes unless stated otherwise.
                </li>
                <li>
                  <strong>Availability:</strong> We strive to maintain accurate live
                  stock records. If a book becomes unavailable following an order, we
                  will notify you promptly and issue a full refund.
                </li>
                <li>
                  <strong>Order Corrections:</strong> We reserve the right to correct
                  typographical pricing errors prior to order fulfillment.
                </li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">04.</span> Payment Processing
              </h2>
              <p>
                Payments for physical books, collector editions, and deliveries are
                securely processed through certified third-party payment gateways,
                including Razorpay. Bookverse does not store full credit or debit card
                numbers on our servers. By placing an order, you authorize the
                designated payment processor to charge the total amount due.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">05.</span> Shipping, Delivery & Tracking
              </h2>
              <p>
                We dispatch books through verified postal and courier services.
                Complimentary standard shipping applies to all orders totaling $40 or
                more. Estimated delivery timeframes are provided at checkout and are
                subject to courier handling times and regional accessibility. Real-time
                order statuses can be monitored via your personal reader portal.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">06.</span> 30-Day Returns & Refunds Policy
              </h2>
              <p>
                We want you to love every story on your shelf. If you receive a damaged,
                defective, or incorrect book, you may request a return or replacement
                within 30 days of delivery. Returned items must remain in clean, unread
                condition with original covers intact.
              </p>
              <div className="legal-highlight-box">
                To initiate a return or replacement, please contact our support team
                with your order reference number.
              </div>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">07.</span> Reader Reviews & Content Guidelines
              </h2>
              <p>
                Bookverse allows registered members to rate books and submit reader
                critiques. By posting reviews, you agree to adhere to respectful
                literary discourse. We prohibit:
              </p>
              <ul>
                <li>Hate speech, harassment, defamation, or profanity.</li>
                <li>Commercial spam, affiliate promotions, or unrelated links.</li>
                <li>Fabricated or paid reviews designed to manipulate ratings.</li>
              </ul>
              <p>
                Bookverse reserves the right to moderate or delete reviews that
                breach these standards.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">08.</span> Intellectual Property
              </h2>
              <p>
                All brand marks, logos, user interfaces, editorial copy, and website
                designs are the intellectual property of Bookverse. Book cover art,
                excerpts, and bibliographic metadata remain the copyright of their
                respective authors and publishing houses.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">09.</span> Limitation of Liability
              </h2>
              <p>
                Bookverse is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis. To the maximum extent permitted by law, Bookverse
                shall not be liable for incidental, indirect, or consequential damages
                arising from service interruptions or courier delays.
              </p>
            </section>

            <section className="legal-section">
              <h2>
                <span className="section-num">10.</span> Changes & Contact
              </h2>
              <p>
                We may revise these Terms and Conditions periodically. Continued use
                of Bookverse following published updates constitutes acceptance. For
                inquiries regarding these terms, contact us at{" "}
                <strong>support@bookverse.local</strong>.
              </p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/privacy">View Privacy Policy →</Link>
            <Link to="/books">Back to Bookstore →</Link>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}

export default Terms;

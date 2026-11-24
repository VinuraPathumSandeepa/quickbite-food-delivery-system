import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

function Contact() {
  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="Contact Us"
        subtitle="Get in touch with our food delivery team."
      />

      <section className="resource-page-section">
        <div className="resource-card">
          <h2>Contact Information</h2>
          <p>
            Have a question about your order, delivery, or account? Contact our
            team and we will help you as soon as possible.
          </p>

          <div className="resource-info-grid">
            <div>
              <h3>Email</h3>
              <p><a href="mailto:support@fooddelivery.com">support@fooddelivery.com</a></p>
            </div>

            <div>
              <h3>Phone</h3>
              <p><a href="tel:+94711234567">+94 71 123 4567</a></p>
            </div>

            <div>
              <h3>Location</h3>
              <p>Colombo, Sri Lanka</p>
            </div>
          </div>

          <div className="contact-note-box">
            <h3>Business Hours</h3>
            <p>Monday to Sunday: 9.00 AM - 10.00 PM</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

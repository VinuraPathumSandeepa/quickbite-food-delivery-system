import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

function Support() {
  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="Support"
        subtitle="Find help for orders, payments, accounts, and deliveries."
      />

      <section className="resource-page-section">
        <div className="resource-card">
          <h2>How Can We Help?</h2>
          <p>
            Our support team helps customers, admins, and delivery persons solve
            common system and order-related problems.
          </p>

          <div className="resource-info-grid">
            <div>
              <h3>Order Issues</h3>
              <p>Help with cancelled, delayed, or incorrect orders.</p>
            </div>

            <div>
              <h3>Payment Help</h3>
              <p>Support for mock card payments and cash on delivery status.</p>
            </div>

            <div>
              <h3>Account Help</h3>
              <p>Support for login, registration, and profile updates.</p>
            </div>
          </div>

          <div className="contact-note-box">
            <h3>Need Quick Help?</h3>
            <p>Contact us through email or phone for faster support.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;
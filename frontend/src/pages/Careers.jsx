import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

function Careers() {
  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="Careers"
        subtitle="Join our food delivery team and grow with us."
      />

      <section className="resource-page-section">
        <div className="resource-card">
          <h2>Work With Us</h2>
          <p>
            We are always looking for passionate people to join our food
            delivery management system. You can apply for restaurant operations,
            customer support, delivery management, and admin-related roles.
          </p>

          <div className="resource-info-grid">
            <div>
              <h3>Delivery Partner</h3>
              <p>Help customers receive their food safely and on time.</p>
            </div>

            <div>
              <h3>Customer Support</h3>
              <p>Assist customers with orders, payments, and delivery issues.</p>
            </div>

            <div>
              <h3>Restaurant Operations</h3>
              <p>Support food preparation, menu updates, and order processing.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Careers;
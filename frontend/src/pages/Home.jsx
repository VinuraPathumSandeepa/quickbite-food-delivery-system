import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FoodCard from "../components/FoodCard";
import LoadingSpinner from "../components/LoadingSpinner";

function Home() {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [collections, setCollections] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [loadingFoods, setLoadingFoods] = useState(true);

  const defaultCollections = [
    {
      id: 1,
      title: "Healthy Picks",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    },
    {
      id: 2,
      title: "Lunch Specials",
      imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088",
    },
    {
      id: 3,
      title: "Popular Meals",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    },
  ];

  const defaultFooterSettings = {
    brandIcon: "🍽",
    brandName: "QuickBite.",
    description: "Fresh meals delivered fast, easy, and reliable.",

    quickLinksTitle: "Quick Links",
    quickLink1Label: "Home",
    quickLink1Url: "/",
    quickLink2Label: "Menu",
    quickLink2Url: "/menu",
    quickLink3Label: "Orders",
    quickLink3Url: "/customer/orders",

    resourceTitle: "Resource",
    resourceLink1Label: "Careers",
    resourceLink1Url: "/careers",
    resourceLink2Label: "Contact",
    resourceLink2Url: "/contact",
    resourceLink3Label: "Support",
    resourceLink3Url: "/support",

    copyrightText: "© 2026 QuickBite. All rights reserved.",
  };

  useEffect(() => {
    loadFeaturedFoods();
    loadCollections();
    loadFooterSettings();
  }, []);

  const loadFeaturedFoods = async () => {
    try {
      setLoadingFoods(true);

      const response = await api.get("/foods/available");
      setFeaturedFoods(response.data.slice(0, 6));
    } catch (error) {
      console.error("Failed to load featured foods", error);
    } finally {
      setLoadingFoods(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await api.get("/collections");
      setCollections(response.data);
    } catch (error) {
      console.error("Failed to load collections", error);
    }
  };

  const loadFooterSettings = async () => {
    try {
      const response = await api.get("/footer-settings");
      setFooterSettings(response.data);
    } catch (error) {
      console.error("Failed to load footer settings", error);
      setFooterSettings(defaultFooterSettings);
    }
  };

  const displayCollections =
    collections.length > 0 ? collections : defaultCollections;

  const scrollingCollections = [...displayCollections, ...displayCollections];

  const footer = footerSettings || defaultFooterSettings;

  const renderFooterLink = (label, url) => {
    if (!label || !url) return null;

    if (url.startsWith("/")) {
      return (
        <Link to={url} key={label}>
          {label}
        </Link>
      );
    }

    return (
      <a href={url} key={label} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  };

  return (
    <div className="app-page">
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-badge">Fast Delivery • Fresh Meals</p>

          <h1>
            Delicious food
            <br />
            delivered to your door
          </h1>

          <p className="hero-description">
            Order your favourite meals online and enjoy fast, fresh, and
            reliable delivery with QuickBite.
          </p>

          <div className="hero-buttons">
            <Link to="/menu" className="hero-btn">
              Order Now
            </Link>

            <Link to="/register" className="outline-btn">
              Create Account
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              alt="Fresh food bowl"
            />

            <div className="hero-floating-card">
              <strong>30 mins</strong>
              <span>Average Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-title">
          <h2>Featured Meals</h2>
          <p>Freshly prepared meals loved by our customers</p>
        </div>

        {loadingFoods ? (
          <LoadingSpinner text="Loading featured meals..." />
        ) : featuredFoods.length === 0 ? (
          <div className="empty-box">
            <h2>No food items available</h2>
            <p>Food items added by admin will appear here.</p>
          </div>
        ) : (
          <div className="food-grid">
            {featuredFoods.map((food) => (
              <FoodCard food={food} key={food.id} />
            ))}
          </div>
        )}

        <div className="center-action">
          <Link to="/menu" className="hero-btn">
            View Full Menu
          </Link>
        </div>
      </section>

      <section className="collections-section">
        <div className="section-title">
          <h2>Top Collections</h2>
          <p>All our best meals in one delicious place</p>
        </div>

        <div className="collection-marquee-wrapper">
          <div className="collection-marquee-track">
            {scrollingCollections.map((collection, index) => (
              <div
                className="collection-card collection-marquee-card"
                key={`${collection.id}-${index}`}
              >
                <img src={collection.imageUrl} alt={collection.title} />
                <h3>{collection.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <h3>
            {footer.brandIcon} {footer.brandName}
          </h3>

          <p>{footer.description}</p>

          {footer.copyrightText && (
            <p className="footer-copyright">{footer.copyrightText}</p>
          )}
        </div>

        <div>
          <h4>{footer.quickLinksTitle}</h4>

          {renderFooterLink(footer.quickLink1Label, footer.quickLink1Url)}
          {renderFooterLink(footer.quickLink2Label, footer.quickLink2Url)}
          {renderFooterLink(footer.quickLink3Label, footer.quickLink3Url)}
        </div>

        <div>
          <h4>{footer.resourceTitle}</h4>

          {renderFooterLink(footer.resourceLink1Label, footer.resourceLink1Url)}
          {renderFooterLink(footer.resourceLink2Label, footer.resourceLink2Url)}
          {renderFooterLink(footer.resourceLink3Label, footer.resourceLink3Url)}
        </div>
      </footer>
    </div>
  );
}

export default Home;
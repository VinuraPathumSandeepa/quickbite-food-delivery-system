import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import FoodCard from "../components/FoodCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { foodImageSource, handleFoodImageError } from "../utils/foodImage";

function Menu() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [sortDirection, setSortDirection] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [foodError, setFoodError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const loadFoods = useCallback(() => {
    api.get("/foods/available", { timeout: 20000 })
      .then((response) => {
        if (!Array.isArray(response.data)) throw new Error("Invalid food response");
        setFoods(response.data);
      })
      .catch((error) => {
        console.error("Failed to load menu foods", error);
        setFoods([]);
        setFoodError("We couldn't load the menu. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const loadCategories = useCallback(() => {
    api.get("/categories", { timeout: 20000 })
      .then((response) => {
        if (!Array.isArray(response.data)) throw new Error("Invalid category response");
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Failed to load categories", error);
        setCategoryError("Categories are unavailable. You can still browse all meals.");
      });
  }, []);

  const retryFoods = () => {
    setLoading(true);
    setFoodError("");
    loadFoods();
  };

  const retryCategories = () => {
    setCategoryError("");
    loadCategories();
  };

  useEffect(() => {
    loadFoods();
    loadCategories();
  }, [loadFoods, loadCategories]);

  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const keyword = searchTerm.toLowerCase();

    const foodSuggestions = foods
      .filter((food) => food.name.toLowerCase().includes(keyword))
      .map((food) => ({
        id: `food-${food.id}`,
        label: food.name,
        type: "Food",
        imageUrl: food.imageUrl,
      }));

    const categorySuggestions = categories
      .filter((category) => category.name.toLowerCase().includes(keyword))
      .map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
        type: "Category",
        categoryId: category.id,
      }));

    return [...foodSuggestions, ...categorySuggestions].slice(0, 6);
  }, [searchTerm, foods, categories]);

  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (selectedCategoryId !== "ALL") {
      result = result.filter(
        (food) => String(food.category?.id) === String(selectedCategoryId)
      );
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();

      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(keyword) ||
          food.description?.toLowerCase().includes(keyword) ||
          food.category?.name?.toLowerCase().includes(keyword)
      );
    }

    if (sortDirection === "asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortDirection === "desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [foods, selectedCategoryId, searchTerm, sortDirection]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.label);
    setShowSuggestions(false);

    if (suggestion.type === "Category") {
      setSelectedCategoryId(suggestion.categoryId);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId("ALL");
    setSortDirection("");
    setShowSuggestions(false);
  };

  const selectedCategoryName =
    selectedCategoryId === "ALL"
      ? "All Categories"
      : categories.find(
          (category) => String(category.id) === String(selectedCategoryId)
        )?.name || "Selected Category";

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="Our Food Menu"
        subtitle="Choose your favourite meal and order easily."
        showBack={false}
      />

      <section className="menu-section">
        <div className="menu-filter-panel">
          <div className="filter-header">
            <div>
              <span className="filter-kicker">Explore Menu</span>
              <h2>Find your perfect meal</h2>
            </div>

            <div className="results-count">
              {loading ? "Loading items..." : foodError ? "Items unavailable" : `${filteredFoods.length} items found`}
            </div>
          </div>

          <div className="search-suggestion-wrapper">
            <div className="menu-search-box">
              <span className="search-icon">🔍</span>

              <input
                type="text"
                placeholder="Search pizza, rice, burger..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setShowSuggestions(false);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="suggestion-box">
                {searchSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    className="suggestion-item"
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-left">
                      {suggestion.imageUrl ? (
                        <img
                          src={foodImageSource(suggestion.imageUrl)}
                          alt={suggestion.label}
                          className="suggestion-image"
                          onError={handleFoodImageError}
                        />
                      ) : (
                        <div className="suggestion-icon">🍽️</div>
                      )}

                      <div>
                        <strong>{suggestion.label}</strong>
                        <span>{suggestion.type}</span>
                      </div>
                    </div>

                    <span className="suggestion-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <div className="filter-label-row">
                <span className="filter-label">Categories</span>
                <span className="filter-mini-text">{selectedCategoryName}</span>
              </div>

              <div className="category-chip-row">
                <button
                  type="button"
                  className={
                    selectedCategoryId === "ALL"
                      ? "category-chip active-category-chip"
                      : "category-chip"
                  }
                  onClick={() => setSelectedCategoryId("ALL")}
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={
                      String(selectedCategoryId) === String(category.id)
                        ? "category-chip active-category-chip"
                        : "category-chip"
                    }
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label-row">
                <span className="filter-label">Sort by Price</span>
                <span className="filter-mini-text">
                  {sortDirection === "asc"
                    ? "Low to High"
                    : sortDirection === "desc"
                    ? "High to Low"
                    : "Default"}
                </span>
              </div>

              <div className="sort-chip-row">
                <button
                  type="button"
                  className={
                    sortDirection === "asc"
                      ? "sort-chip active-sort-chip"
                      : "sort-chip"
                  }
                  onClick={() => setSortDirection("asc")}
                >
                  ↑ Low to High
                </button>

                <button
                  type="button"
                  className={
                    sortDirection === "desc"
                      ? "sort-chip active-sort-chip"
                      : "sort-chip"
                  }
                  onClick={() => setSortDirection("desc")}
                >
                  ↓ High to Low
                </button>

                <button
                  type="button"
                  className="clear-filter-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          {categoryError && (
            <div className="error-box catalog-filter-error" role="alert">
              <span>{categoryError}</span>
              <button type="button" className="outline-btn" onClick={retryCategories}>
                Retry categories
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading menu..." />
        ) : foodError ? (
          <EmptyState
            icon="⚠️"
            title="Menu is unavailable"
            text={foodError}
            actionText="Try again"
            onAction={retryFoods}
          />
        ) : foods.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No meals available"
            text="Please check back soon for new meals."
            actionText="Check again"
            onAction={retryFoods}
          />
        ) : filteredFoods.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No food items found"
            text="Try another search keyword or clear the filters."
            actionText="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="food-grid">
            {filteredFoods.map((food) => (
              <FoodCard food={food} key={food.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Menu;

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import FoodCard from "../components/FoodCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import DialogShell from "../components/DialogShell";
import { foodImageSource, handleFoodImageError } from "../utils/foodImage";

function Menu() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [sortDirection, setSortDirection] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = Number(selectedCategoryId !== "ALL") + Number(Boolean(sortDirection));
  const hasFilters = Boolean(searchTerm || activeFilterCount);
  const categoryChoices = (className) => (
    <div className={className} role="group" aria-label="Food categories">
      <button type="button" className={selectedCategoryId === "ALL" ? "category-chip active-category-chip" : "category-chip"} aria-pressed={selectedCategoryId === "ALL"} onClick={() => setSelectedCategoryId("ALL")}>All</button>
      {categories.map((category) => (
        <button type="button" key={category.id} className={String(selectedCategoryId) === String(category.id) ? "category-chip active-category-chip" : "category-chip"} aria-pressed={String(selectedCategoryId) === String(category.id)} onClick={() => setSelectedCategoryId(category.id)}>{category.name}</button>
      ))}
    </div>
  );
  const resultText = loading ? "Loading items..." : foodError ? "Items unavailable" : `${filteredFoods.length} items found`;

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
          <div className="menu-toolbar">
            <div className="search-suggestion-wrapper">
              <div className="menu-search-box">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  aria-label="Search the food menu"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(event) => { setSearchTerm(event.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(event) => { if (event.key === "Escape") setShowSuggestions(false); }}
                />
                {searchTerm && <button type="button" className="search-clear-btn" aria-label="Clear search" onClick={() => { setSearchTerm(""); setShowSuggestions(false); }}>✕</button>}
              </div>
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="suggestion-box">
                  {searchSuggestions.map((suggestion) => (
                    <button type="button" className="suggestion-item" key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                      <span className="suggestion-left">
                        {suggestion.imageUrl ? <img src={foodImageSource(suggestion.imageUrl)} alt="" className="suggestion-image" onError={handleFoodImageError} /> : <span className="suggestion-icon" aria-hidden="true">🍽️</span>}
                        <span><strong>{suggestion.label}</strong><span>{suggestion.type}</span></span>
                      </span>
                      <span className="suggestion-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="menu-filter-trigger" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => { setShowSuggestions(false); setFiltersOpen(true); }}><span aria-hidden="true">☷</span> Filters{activeFilterCount > 0 && <span className="menu-filter-count">{activeFilterCount}</span>}</button>
            <label className="menu-sort-control" htmlFor="menu-sort"><span>Sort</span><select id="menu-sort" value={sortDirection} onChange={(event) => setSortDirection(event.target.value)}><option value="">Recommended</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select></label>
            <button type="button" className="menu-clear-button" onClick={clearFilters} disabled={!hasFilters}>Clear filters</button>
            <span className="results-count" role="status" aria-live="polite">{resultText}</span>
          </div>
          <div className="menu-desktop-categories"><span>Categories</span>{categoryChoices("category-chip-row")}</div>
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
      {filtersOpen && (
        <DialogShell className="menu-filter-overlay" titleId="menu-filter-title" onClose={() => setFiltersOpen(false)}>
          <div className="menu-filter-drawer">
            <div className="menu-filter-drawer-header">
              <div><span>Explore Menu</span><h2 id="menu-filter-title">Filter Meals</h2></div>
              <button type="button" className="menu-filter-close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>✕</button>
            </div>
            <div className="menu-filter-drawer-body">
              <h3>Categories</h3>
              {categoryChoices("menu-drawer-categories")}
              <label className="menu-drawer-sort" htmlFor="menu-drawer-sort"><span>Sort by Price</span><select id="menu-drawer-sort" value={sortDirection} onChange={(event) => setSortDirection(event.target.value)}><option value="">Recommended</option><option value="asc">Low to high</option><option value="desc">High to low</option></select></label>
            </div>
            <div className="menu-filter-drawer-actions">
              <button type="button" className="menu-drawer-reset" onClick={clearFilters} disabled={!hasFilters}>Reset filters</button>
              <button type="button" className="menu-drawer-apply" onClick={() => setFiltersOpen(false)}>{loading ? "Show Results" : `Show ${filteredFoods.length} Results`}</button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}

export default Menu;

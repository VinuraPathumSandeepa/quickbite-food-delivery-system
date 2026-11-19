export const FOOD_IMAGE_FALLBACK = "/food-placeholder.svg";

export function foodImageSource(url) {
  return typeof url === "string" && url.trim() ? url : FOOD_IMAGE_FALLBACK;
}

export function handleFoodImageError(event) {
  const image = event.currentTarget;
  if (image.getAttribute("src") !== FOOD_IMAGE_FALLBACK) {
    image.src = FOOD_IMAGE_FALLBACK;
  }
}

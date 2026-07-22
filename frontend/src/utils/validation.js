export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^[0-9]{10,15}$/.test(phone);
};

export const getBackendFieldErrors = (error) => {
  return error.response?.data?.fieldErrors || {};
};

// Login validation
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.password.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
};

// Register validation
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.password.trim()) {
    errors.password = "Password is required.";
  } else if (formData.password.length < 5) {
    errors.password = "Password must be at least 5 characters.";
  }

  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = "Phone number must contain 10 to 15 digits.";
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required.";
  } else if (formData.address.trim().length < 3) {
    errors.address = "Address must be at least 3 characters.";
  }

  if (formData.role === "DELIVERY") {
    if (!formData.vehicleType.trim()) {
      errors.vehicleType = "Vehicle type is required for delivery persons.";
    }

    if (!formData.vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required for delivery persons.";
    }
  }

  return errors;
};

// Profile validation
export const validateProfileForm = (formData) => {
  const errors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = "Phone number must contain 10 to 15 digits.";
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required.";
  } else if (formData.address.trim().length < 3) {
    errors.address = "Address must be at least 3 characters.";
  }

  if (formData.role === "DELIVERY") {
    if (!formData.vehicleType.trim()) {
      errors.vehicleType = "Vehicle type is required.";
    }

    if (!formData.vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required.";
    }
  }

  return errors;
};

// Category validation
export const validateCategoryForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Category name is required.";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Category name must be at least 2 characters.";
  }

  if ((formData.description || "").length > 200) {
    errors.description = "Description cannot be longer than 200 characters.";
  }

  return errors;
};

// Food validation
export const validateFoodForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Food name is required.";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Food name must be at least 2 characters.";
  }

  if ((formData.description || "").length > 1000) {
    errors.description = "Description cannot be longer than 1000 characters.";
  }

  if (!formData.price) {
    errors.price = "Price is required.";
  } else if (Number(formData.price) <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (
    formData.rating &&
    (Number(formData.rating) < 1 || Number(formData.rating) > 5)
  ) {
    errors.rating = "Rating must be between 1 and 5.";
  }

  if (!formData.preparationTimeMinutes) {
    errors.preparationTimeMinutes = "Preparation time is required.";
  } else if (
    Number(formData.preparationTimeMinutes) < 1 ||
    Number(formData.preparationTimeMinutes) > 180
  ) {
    errors.preparationTimeMinutes =
      "Preparation time must be between 1 and 180 minutes.";
  }

  if (!formData.categoryId) {
    errors.categoryId = "Category is required.";
  }

  return errors;
};

// Checkout validation
export const validateCheckoutForm = (formData, cardData) => {
  const errors = {};

  if (!formData.deliveryAddress.trim()) {
    errors.deliveryAddress = "Delivery address is required.";
  } else if (formData.deliveryAddress.trim().length < 5) {
    errors.deliveryAddress = "Delivery address must be at least 5 characters.";
  }

  if (!formData.paymentMethod) {
    errors.paymentMethod = "Payment method is required.";
  }

  if ((formData.notes || "").length > 500) {
    errors.notes = "Notes cannot be longer than 500 characters.";
  }

  if (formData.paymentMethod === "CARD") {
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, "");

    if (!cardData.cardHolderName.trim()) {
      errors.cardHolderName = "Card holder name is required.";
    }

    if (!cleanCardNumber) {
      errors.cardNumber = "Card number is required.";
    } else if (!/^\d{16}$/.test(cleanCardNumber)) {
      errors.cardNumber = "Card number must contain 16 digits.";
    }

    if (!cardData.expiryDate.trim()) {
      errors.expiryDate = "Expiry date is required.";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate)) {
      errors.expiryDate = "Expiry date must be in MM/YY format.";
    }

    if (!cardData.cvv.trim()) {
      errors.cvv = "CVV is required.";
    } else if (!/^\d{3}$/.test(cardData.cvv)) {
      errors.cvv = "CVV must contain 3 digits.";
    }
  }

  return errors;
};

// Home collection validation
export const validateCollectionForm = (formData) => {
  const errors = {};

  if (!formData.title.trim()) {
    errors.title = "Collection title is required.";
  } else if (formData.title.trim().length < 2) {
    errors.title = "Title must be at least 2 characters.";
  }

  if ((formData.description || "").length > 500) {
    errors.description = "Description cannot be longer than 500 characters.";
  }

  if (!formData.imageUrl.trim()) {
    errors.imageUrl = "Image URL is required.";
  }

  if (formData.displayOrder === "") {
    errors.displayOrder = "Display order is required.";
  } else if (Number(formData.displayOrder) < 0) {
    errors.displayOrder = "Display order cannot be negative.";
  } else if (Number(formData.displayOrder) > 100) {
    errors.displayOrder = "Display order cannot be more than 100.";
  }

  return errors;
};
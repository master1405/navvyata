/**
 * E-Commerce Domain Constants and Utility Functions
 * Standardized data sets for Indian e-commerce fulfillment and children's apparel sizing.
 */

// Official 28 States and 8 Union Territories of India for billing and shipping validation
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/**
 * Standardized Child Sizing Chart & Calculation Algorithm
 * Accurately spans from newborn (0M) to teenage (14Y) based on WHO pediatric anthropometric metrics.
 */
export const SIZE_CHART = [
  { size: "0–3M", age: "0–3 months", heightMin: 50, heightMax: 62, chest: "40–43", waist: "40–42", category: "baby" },
  { size: "3–6M", age: "3–6 months", heightMin: 62, heightMax: 68, chest: "43–45", waist: "42–44", category: "baby" },
  { size: "6–12M", age: "6–12 months", heightMin: 68, heightMax: 76, chest: "45–48", waist: "44–46", category: "baby" },
  { size: "1–2Y", age: "1–2 years", heightMin: 76, heightMax: 86, chest: "48–51", waist: "46–48", category: "toddler" },
  { size: "2–3Y", age: "2–3 years", heightMin: 86, heightMax: 96, chest: "51–53", waist: "48–50", category: "toddler" },
  { size: "3–4Y", age: "3–4 years", heightMin: 96, heightMax: 104, chest: "53–56", waist: "50–52", category: "toddler" },
  { size: "4–5Y", age: "4–5 years", heightMin: 104, heightMax: 110, chest: "56–59", waist: "52–54", category: "kids" },
  { size: "5–6Y", age: "5–6 years", heightMin: 110, heightMax: 116, chest: "59–62", waist: "54–56", category: "kids" },
  { size: "6–7Y", age: "6–7 years", heightMin: 116, heightMax: 122, chest: "62–65", waist: "56–58", category: "kids" },
  { size: "7–8Y", age: "7–8 years", heightMin: 122, heightMax: 128, chest: "65–68", waist: "58–60", category: "kids" },
  { size: "8–9Y", age: "8–9 years", heightMin: 128, heightMax: 134, chest: "68–71", waist: "60–62", category: "kids" },
  { size: "9–10Y", age: "9–10 years", heightMin: 134, heightMax: 140, chest: "71–74", waist: "62–64", category: "kids" },
  { size: "10–11Y", age: "10–11 years", heightMin: 140, heightMax: 146, chest: "74–77", waist: "64–66", category: "tweens" },
  { size: "11–12Y", age: "11–12 years", heightMin: 146, heightMax: 152, chest: "77–80", waist: "66–68", category: "tweens" },
  { size: "12–13Y", age: "12–13 years", heightMin: 152, heightMax: 158, chest: "80–83", waist: "68–70", category: "tweens" },
  { size: "13–14Y", age: "13–14 years", heightMin: 158, heightMax: 164, chest: "83–86", waist: "70–72", category: "tweens" },
];

/**
 * Robust sizing recommendation engine:
 * Evaluates both height (primary indicator in kids apparel) and age (secondary/fallback).
 * When between sizes, always recommends the next size up to allow growth room.
 */
export function getRecommendedSize(ageInput, heightInput) {
  const age = parseFloat(ageInput);
  const height = parseFloat(heightInput);

  // 1. Height-driven recommendation (highest accuracy)
  if (!isNaN(height) && height > 0) {
    if (height < 62) return "0–3M";
    if (height < 68) return "3–6M";
    if (height < 76) return "6–12M";
    if (height < 86) return "1–2Y";
    if (height < 96) return "2–3Y";
    if (height < 104) return "3–4Y";
    if (height < 110) return "4–5Y";
    if (height < 116) return "5–6Y";
    if (height < 122) return "6–7Y";
    if (height < 128) return "7–8Y";
    if (height < 134) return "8–9Y";
    if (height < 140) return "9–10Y";
    if (height < 146) return "10–11Y";
    if (height < 152) return "11–12Y";
    if (height < 158) return "12–13Y";
    return "13–14Y";
  }

  // 2. Age-driven recommendation fallback
  if (!isNaN(age)) {
    if (age <= 0.25) return "0–3M";
    if (age <= 0.5) return "3–6M";
    if (age <= 1) return "6–12M";
    if (age <= 2) return "1–2Y";
    if (age <= 3) return "2–3Y";
    if (age <= 4) return "3–4Y";
    if (age <= 5) return "4–5Y";
    if (age <= 6) return "5–6Y";
    if (age <= 7) return "6–7Y";
    if (age <= 8) return "7–8Y";
    if (age <= 9) return "8–9Y";
    if (age <= 10) return "9–10Y";
    if (age <= 11) return "10–11Y";
    if (age <= 12) return "11–12Y";
    if (age <= 13) return "12–13Y";
    return "13–14Y";
  }

  return "3–4Y";
}

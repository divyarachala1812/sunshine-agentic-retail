import type { CategoryId, Product } from "@/types/commerce";

export const categories: Array<{
  id: CategoryId;
  label: string;
  eyebrow: string;
  colour: string;
}> = [
  { id: "women", label: "Women’s fashion", eyebrow: "Kurtas, dresses & sarees", colour: "#f6d9d6" },
  { id: "men", label: "Men’s fashion", eyebrow: "Shirts, kurtas & denim", colour: "#dbe6f4" },
  { id: "footwear", label: "Footwear & bags", eyebrow: "Daily essentials", colour: "#eadfcf" },
  { id: "electronics", label: "Electronics", eyebrow: "Work, play & connect", colour: "#d9e9e2" },
  { id: "home", label: "Home & living", eyebrow: "Comfort for every room", colour: "#f3e7bd" },
];

type ProductSeed = Omit<Product, "id" | "slug" | "categoryLabel">;

const makeProducts = (category: CategoryId, seeds: ProductSeed[]): Product[] => {
  const categoryLabel = categories.find((item) => item.id === category)?.label ?? category;

  return seeds.map((seed, index) => ({
    ...seed,
    id: `${category.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    slug: `${seed.brand}-${seed.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    category,
    categoryLabel,
  }));
};

const women = makeProducts("women", [
  { name: "Aarohi Floral Kurta Set", brand: "Anvi", category: "women", price: 1499, mrp: 2999, rating: 4.5, reviews: 1240, description: "Cotton-blend kurta set with a soft floral print and straight trousers.", colour: "Rose", sizes: ["S", "M", "L", "XL"], badge: "Bestseller", deliveryDays: 3, stock: 18 },
  { name: "Meher Cotton Midi Dress", brand: "Nila", category: "women", price: 1199, mrp: 2199, rating: 4.3, reviews: 814, description: "Breathable midi dress with a gathered waist for an easy everyday fit.", colour: "Indigo", sizes: ["XS", "S", "M", "L"], deliveryDays: 3, stock: 25 },
  { name: "Noor Chanderi Saree", brand: "Vastra", category: "women", price: 2399, mrp: 4299, rating: 4.6, reviews: 632, description: "Lightweight festive saree with a woven border and unstitched blouse piece.", colour: "Marigold", badge: "Festive pick", deliveryDays: 4, stock: 12 },
  { name: "Tara Straight Kurta", brand: "Anvi", category: "women", price: 799, mrp: 1499, rating: 4.2, reviews: 1920, description: "Printed cotton straight kurta designed for college and everyday wear.", colour: "Mint", sizes: ["S", "M", "L", "XL", "XXL"], deliveryDays: 2, stock: 31 },
  { name: "Ira Linen Co-ord Set", brand: "Nila", category: "women", price: 1899, mrp: 3499, rating: 4.4, reviews: 486, description: "Relaxed linen-blend shirt and trouser set with useful side pockets.", colour: "Sage", sizes: ["S", "M", "L", "XL"], badge: "New", deliveryDays: 4, stock: 15 },
  { name: "Ruhani Anarkali Set", brand: "Vastra", category: "women", price: 2799, mrp: 4999, rating: 4.7, reviews: 958, description: "Flowing Anarkali set with a printed dupatta for celebrations and weddings.", colour: "Wine", sizes: ["S", "M", "L", "XL"], badge: "Top rated", deliveryDays: 4, stock: 9 },
  { name: "Maya Wide-Leg Jeans", brand: "Drift", category: "women", price: 1399, mrp: 2499, rating: 4.2, reviews: 725, description: "High-rise stretch denim with a clean wide-leg silhouette.", colour: "Mid blue", sizes: ["26", "28", "30", "32", "34"], deliveryDays: 3, stock: 23 },
  { name: "Kavya Embroidered Top", brand: "Nila", category: "women", price: 699, mrp: 1299, rating: 4.1, reviews: 567, description: "Soft everyday top finished with understated tonal embroidery.", colour: "Ivory", sizes: ["XS", "S", "M", "L", "XL"], deliveryDays: 2, stock: 28 },
  { name: "Diya Silk-Blend Lehenga", brand: "Vastra", category: "women", price: 3599, mrp: 6999, rating: 4.5, reviews: 341, description: "Three-piece festive lehenga set with a comfortable adjustable waist.", colour: "Emerald", sizes: ["S", "M", "L", "XL"], deliveryDays: 5, stock: 7 },
  { name: "Sana Everyday Palazzo", brand: "Anvi", category: "women", price: 599, mrp: 1099, rating: 4.0, reviews: 1104, description: "Fluid palazzo trousers with an elasticated waistband and two pockets.", colour: "Black", sizes: ["S", "M", "L", "XL", "XXL"], deliveryDays: 2, stock: 36 },
]);

const men = makeProducts("men", [
  { name: "Arjun Oxford Shirt", brand: "Northlane", category: "men", price: 1099, mrp: 1999, rating: 4.4, reviews: 1351, description: "Regular-fit cotton Oxford shirt that works from lectures to interviews.", colour: "Sky blue", sizes: ["S", "M", "L", "XL"], badge: "Bestseller", deliveryDays: 2, stock: 32 },
  { name: "Kabir Linen Kurta", brand: "Aangan", category: "men", price: 1299, mrp: 2399, rating: 4.5, reviews: 880, description: "Breathable linen-blend kurta with a neat band collar.", colour: "Sand", sizes: ["S", "M", "L", "XL", "XXL"], deliveryDays: 3, stock: 19 },
  { name: "Rohan Tapered Jeans", brand: "Drift", category: "men", price: 1499, mrp: 2699, rating: 4.3, reviews: 966, description: "Stretch denim with a comfortable mid-rise and tapered leg.", colour: "Dark blue", sizes: ["30", "32", "34", "36", "38"], deliveryDays: 3, stock: 22 },
  { name: "Dev Textured Polo", brand: "Northlane", category: "men", price: 799, mrp: 1499, rating: 4.2, reviews: 714, description: "Soft textured polo T-shirt with a tailored everyday shape.", colour: "Forest", sizes: ["S", "M", "L", "XL"], deliveryDays: 2, stock: 27 },
  { name: "Veer Nehru Jacket", brand: "Aangan", category: "men", price: 1899, mrp: 3499, rating: 4.6, reviews: 403, description: "Structured woven jacket to layer over kurtas and formal shirts.", colour: "Navy", sizes: ["S", "M", "L", "XL"], badge: "Festive pick", deliveryDays: 4, stock: 11 },
  { name: "Aman Cargo Trousers", brand: "Drift", category: "men", price: 1199, mrp: 2199, rating: 4.1, reviews: 621, description: "Relaxed cotton cargos with six practical pockets.", colour: "Olive", sizes: ["30", "32", "34", "36"], deliveryDays: 3, stock: 24 },
  { name: "Nikhil Checked Shirt", brand: "Northlane", category: "men", price: 899, mrp: 1699, rating: 4.2, reviews: 1218, description: "Brushed cotton casual shirt in a versatile small check.", colour: "Rust", sizes: ["S", "M", "L", "XL", "XXL"], deliveryDays: 2, stock: 30 },
  { name: "Reyansh Pathani Set", brand: "Aangan", category: "men", price: 2199, mrp: 3999, rating: 4.5, reviews: 298, description: "Comfortable two-piece Pathani set with subtle tonal detailing.", colour: "Charcoal", sizes: ["S", "M", "L", "XL"], deliveryDays: 4, stock: 10 },
  { name: "Aditya Crew Sweatshirt", brand: "Drift", category: "men", price: 999, mrp: 1899, rating: 4.3, reviews: 745, description: "Midweight cotton-rich sweatshirt with a minimal embroidered mark.", colour: "Oatmeal", sizes: ["S", "M", "L", "XL"], deliveryDays: 3, stock: 20 },
  { name: "Ishaan Formal Trousers", brand: "Northlane", category: "men", price: 1399, mrp: 2499, rating: 4.4, reviews: 512, description: "Flat-front formal trousers with stretch for long workdays.", colour: "Graphite", sizes: ["30", "32", "34", "36", "38"], deliveryDays: 3, stock: 17 },
]);

const footwear = makeProducts("footwear", [
  { name: "Aero Everyday Sneakers", brand: "Stride", category: "footwear", price: 1799, mrp: 2999, rating: 4.4, reviews: 1843, description: "Cushioned everyday sneakers with a breathable knit upper.", colour: "White", sizes: ["6", "7", "8", "9", "10"], badge: "Bestseller", deliveryDays: 3, stock: 26 },
  { name: "Mira Block-Heel Sandals", brand: "Eloise", category: "footwear", price: 1299, mrp: 2299, rating: 4.3, reviews: 624, description: "Comfortable block heels with an adjustable ankle strap.", colour: "Tan", sizes: ["4", "5", "6", "7", "8"], deliveryDays: 3, stock: 18 },
  { name: "Jodhpur Leather Jutti", brand: "Karigar", category: "footwear", price: 999, mrp: 1799, rating: 4.5, reviews: 777, description: "Hand-finished leather jutti with a padded footbed.", colour: "Cognac", sizes: ["6", "7", "8", "9", "10"], badge: "Craft pick", deliveryDays: 4, stock: 13 },
  { name: "Metro Laptop Backpack", brand: "CarryCo", category: "footwear", price: 1499, mrp: 2699, rating: 4.6, reviews: 2110, description: "Water-resistant backpack with a padded 15.6-inch laptop sleeve.", colour: "Slate", badge: "Top rated", deliveryDays: 2, stock: 29 },
  { name: "Naina Woven Tote", brand: "Eloise", category: "footwear", price: 1099, mrp: 1999, rating: 4.2, reviews: 530, description: "Spacious woven-look tote with a secure zipped inner pocket.", colour: "Natural", deliveryDays: 3, stock: 21 },
  { name: "Sprint Running Shoes", brand: "Stride", category: "footwear", price: 2299, mrp: 3999, rating: 4.5, reviews: 1480, description: "Lightweight running shoes designed for daily 5K training.", colour: "Teal", sizes: ["6", "7", "8", "9", "10", "11"], deliveryDays: 3, stock: 16 },
  { name: "Campus Crossbody Bag", brand: "CarryCo", category: "footwear", price: 699, mrp: 1299, rating: 4.1, reviews: 911, description: "Compact crossbody with organised pockets for commute essentials.", colour: "Black", deliveryDays: 2, stock: 34 },
  { name: "Kasa Kolhapuri Flats", brand: "Karigar", category: "footwear", price: 849, mrp: 1499, rating: 4.4, reviews: 689, description: "Classic Kolhapuri-inspired flats with a soft anti-slip sole.", colour: "Copper", sizes: ["4", "5", "6", "7", "8"], deliveryDays: 4, stock: 14 },
  { name: "Drift Pool Slides", brand: "Stride", category: "footwear", price: 599, mrp: 999, rating: 4.0, reviews: 1205, description: "Quick-dry slides with a contoured footbed for easy comfort.", colour: "Navy", sizes: ["6", "7", "8", "9", "10"], deliveryDays: 2, stock: 38 },
  { name: "Workday Messenger Bag", brand: "CarryCo", category: "footwear", price: 1699, mrp: 2999, rating: 4.3, reviews: 445, description: "Structured messenger bag with laptop protection and luggage strap.", colour: "Espresso", deliveryDays: 3, stock: 12 },
]);

const electronics = makeProducts("electronics", [
  { name: "Nova 5G Smartphone", brand: "Astra", category: "electronics", price: 18999, mrp: 22999, rating: 4.4, reviews: 3280, description: "5G smartphone with a 120 Hz display, 50 MP camera and all-day battery.", colour: "Midnight", badge: "Great value", deliveryDays: 2, stock: 17 },
  { name: "Book Air 14 Laptop", brand: "Veda", category: "electronics", price: 54990, mrp: 62990, rating: 4.5, reviews: 842, description: "Slim 14-inch laptop with 16 GB RAM and 512 GB SSD for study and work.", colour: "Silver", badge: "Student pick", deliveryDays: 3, stock: 8 },
  { name: "Pulse ANC Earbuds", brand: "Sonic", category: "electronics", price: 2499, mrp: 4999, rating: 4.3, reviews: 5210, description: "Wireless earbuds with active noise cancellation and 32-hour total playtime.", colour: "Black", badge: "Bestseller", deliveryDays: 2, stock: 42 },
  { name: "Fit Pro Smartwatch", brand: "Astra", category: "electronics", price: 3299, mrp: 5999, rating: 4.2, reviews: 2785, description: "AMOLED smartwatch with calling, GPS and health tracking.", colour: "Graphite", deliveryDays: 2, stock: 24 },
  { name: "Beam Mini Projector", brand: "Veda", category: "electronics", price: 6999, mrp: 9999, rating: 4.1, reviews: 613, description: "Portable 1080p-supported projector for small rooms and movie nights.", colour: "Ivory", deliveryDays: 4, stock: 9 },
  { name: "Bassbox Bluetooth Speaker", brand: "Sonic", category: "electronics", price: 1899, mrp: 3499, rating: 4.4, reviews: 1902, description: "Compact waterproof speaker with warm sound and 14-hour battery.", colour: "Cobalt", deliveryDays: 2, stock: 31 },
  { name: "Tab Study 10", brand: "Astra", category: "electronics", price: 15999, mrp: 18999, rating: 4.3, reviews: 1098, description: "10-inch tablet with reading mode, stereo speakers and 128 GB storage.", colour: "Grey", deliveryDays: 3, stock: 13 },
  { name: "View 24 Monitor", brand: "Veda", category: "electronics", price: 8999, mrp: 11999, rating: 4.5, reviews: 734, description: "24-inch Full HD IPS monitor with a height-friendly reading mode.", colour: "Black", deliveryDays: 4, stock: 10 },
  { name: "ChargeGo Power Bank", brand: "Volt", category: "electronics", price: 1299, mrp: 1999, rating: 4.3, reviews: 4122, description: "10,000 mAh fast-charging power bank with USB-C input and output.", colour: "Olive", deliveryDays: 2, stock: 45 },
  { name: "Keys Compact Keyboard", brand: "Volt", category: "electronics", price: 1599, mrp: 2499, rating: 4.2, reviews: 875, description: "Quiet multi-device Bluetooth keyboard for laptop, tablet and phone.", colour: "Sand", deliveryDays: 2, stock: 28 },
]);

const home = makeProducts("home", [
  { name: "Saanjh Cotton Bedsheet", brand: "Nivasa", category: "home", price: 1199, mrp: 2199, rating: 4.5, reviews: 2034, description: "King-size 100% cotton bedsheet with two matching pillow covers.", colour: "Indigo", badge: "Bestseller", deliveryDays: 3, stock: 26 },
  { name: "Aroma Ceramic Diffuser", brand: "Mitti", category: "home", price: 899, mrp: 1499, rating: 4.3, reviews: 672, description: "Hand-glazed electric aroma diffuser with a warm ambient light.", colour: "Terracotta", deliveryDays: 3, stock: 19 },
  { name: "Chai Stoneware Set", brand: "Mitti", category: "home", price: 999, mrp: 1799, rating: 4.6, reviews: 944, description: "Set of six stackable chai cups, finished by hand in Jaipur.", colour: "Dune", badge: "Craft pick", deliveryDays: 4, stock: 16 },
  { name: "Cloud Comforter", brand: "Nivasa", category: "home", price: 1999, mrp: 3499, rating: 4.4, reviews: 816, description: "Lightweight all-season double comforter with soft microfibre fill.", colour: "Sage", deliveryDays: 4, stock: 14 },
  { name: "Orbit Study Lamp", brand: "CasaRay", category: "home", price: 1299, mrp: 2299, rating: 4.2, reviews: 1120, description: "Dimmable LED study lamp with three colour temperatures and USB charging.", colour: "White", deliveryDays: 2, stock: 23 },
  { name: "Masala Storage Box", brand: "Rasoi", category: "home", price: 749, mrp: 1299, rating: 4.4, reviews: 1562, description: "Food-safe stainless steel masala dabba with seven removable cups.", colour: "Steel", deliveryDays: 2, stock: 34 },
  { name: "Mango Wood Tray", brand: "Mitti", category: "home", price: 799, mrp: 1399, rating: 4.3, reviews: 458, description: "Responsibly sourced mango wood serving tray with raised edges.", colour: "Natural", deliveryDays: 4, stock: 12 },
  { name: "FreshLock Container Set", brand: "Rasoi", category: "home", price: 1099, mrp: 1899, rating: 4.5, reviews: 2440, description: "Ten airtight, modular containers for an organised Indian kitchen.", colour: "Clear", deliveryDays: 3, stock: 29 },
  { name: "Woven Floor Cushion", brand: "Nivasa", category: "home", price: 699, mrp: 1199, rating: 4.1, reviews: 381, description: "Firm cotton floor cushion with a removable handwoven cover.", colour: "Marigold", deliveryDays: 3, stock: 18 },
  { name: "Breeze Table Fan", brand: "CasaRay", category: "home", price: 1799, mrp: 2499, rating: 4.2, reviews: 1349, description: "Compact three-speed table fan with quiet operation and wide oscillation.", colour: "Mint", deliveryDays: 3, stock: 20 },
]);

export const products: Product[] = [...women, ...men, ...footwear, ...electronics, ...home];

export const featuredProducts = products.filter((product) => product.badge).slice(0, 10);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const initialProducts = [
  // Totes & Bags
  { name: "Upcycled Shopper Tote", category: "Totes & Bags", price: 1500, originalPrice: 1999, stock: 15, image: "https://ecokaari.org/cdn/shop/files/upcycled-beach-bag_752f542f-fd27-478d-9719-5ac12907dd67.jpg?v=1784801191&width=800", artisanRegion: "Pune, Maharashtra" },
  { name: "EcoRight Women Large Zipper Tote Bag Multi-Coloured", category: "Totes & Bags", price: 899, originalPrice: 1199, stock: 22, image: "http://ecoright.com/cdn/shop/files/315.png?v=1792673640&width=1200", artisanRegion: "Ahmedabad, Gujarat" },
  { name: "Women's Shopper Tote", category: "Totes & Bags", price: 2030, originalPrice: 2499, stock: 10, image: "http://brownliving.in/cdn/shop/files/sustainable-heart-hand-crochet-tote-bag-for-women-handmade-and-eco-friendly-by-wishing-treasure-at-brownliving-112587.png?v=1748614056", artisanRegion: "Mumbai, Maharashtra" },
  { name: "Stylish Cotton Canvas Tote Bag with Unique Artwork", category: "Totes & Bags", price: 694, originalPrice: 899, stock: 25, image: "https://brownliving.in/cdn/shop/files/upcycled-patchwork-shopping-bags-reusable-cloth-tote-iucsb-03-iraa-multicolor-3-4652523.jpg?v=1777570936", artisanRegion: "Jaipur, Rajasthan" },
  { name: "Colorful Handmade Traditional Rajasthani Bag with Mirrors", category: "Totes & Bags", price: 345, originalPrice: 599, stock: 30, image: "https://i.etsystatic.com/29042832/r/il/f5778c/6755917347/il_570xN.6755917347_fdqz.jpg", artisanRegion: "Jodhpur, Rajasthan" },

  // Crochet
  { name: "Handmade Crochet Daisy Flower Bouquet Combo", category: "Crochet", price: 499, originalPrice: 699, stock: 20, image: "https://www.zwende.com/cdn/shop/files/Colourful-Daisies-And-Roses-Bouquet-3.jpg?v=1738149474&width=800", artisanRegion: "Himachal Pradesh" },
  { name: "Gift Aura Daisy Crochet Flower Bouquet", category: "Crochet", price: 189, originalPrice: 299, stock: 25, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/bed3a3593af745839ab1be7447540997.png", artisanRegion: "Pune, Maharashtra" },
  { name: "Handmade Crochet Rose Flower - Soft Yarn Knitted", category: "Crochet", price: 119, originalPrice: 140, stock: 30, image: "https://i.etsystatic.com/28843201/r/il/c7b649/7379675483/il_1080xN.7379675483_e3u6.jpg", artisanRegion: "Manali, Himachal Pradesh" },
  { name: "Handmade Crochet Rose Flower | Knitted Forever", category: "Crochet", price: 299, originalPrice: 399, stock: 18, image: "https://i.etsystatic.com/50248523/r/il/b179a2/6814875294/il_570xN.6814875294_de58.jpg", artisanRegion: "Dehradun, Uttarakhand" },
  { name: "Handmade Crochet Pink & White Rose - Himachal Box", category: "Crochet", price: 185, originalPrice: 249, stock: 22, image: "https://himachalbox.com/wp-content/uploads/2025/05/Handmade-Crochet-Rose-%E2%80%93-Crafted-in-Himachal-Pradesh-Eco-Friendly-Floral-Gift-7-980x1307.webp", artisanRegion: "Shimla, Himachal Pradesh" },
  { name: "Mini Single Rose Crochet Flower Handmade Forever", category: "Crochet", price: 219, originalPrice: 299, stock: 24, image: "https://i.etsystatic.com/28843201/r/il/1eb2b4/4954771287/il_fullxfull.4954771287_9zyw.jpg", artisanRegion: "Jaipur, Rajasthan" },
  { name: "Phool Sutra Handmade Crochet Sunflower Bouquet", category: "Crochet", price: 349, originalPrice: 499, stock: 15, image: "https://himachalbox.com/wp-content/uploads/2026/04/Crochet-Sunflower-Bouquet-HimachalBox-980x1307.webp", artisanRegion: "Kullu, Himachal Pradesh" },
  { name: "Handmade Crochet with Flower Bouquet in Vase", category: "Crochet", price: 249, originalPrice: 349, stock: 16, image: "https://i.etsystatic.com/47099982/r/il/dfd4e7/7279507565/il_570xN.7279507565_fl5s.jpg", artisanRegion: "Bengaluru, Karnataka" },
  { name: "Handmade Crochet Sunflower Pot Decorative Home Decor", category: "Crochet", price: 249, originalPrice: 349, stock: 19, image: "https://i.etsystatic.com/47667711/r/il/518512/6730689415/il_570xN.6730689415_cnjk.jpg", artisanRegion: "Mumbai, Maharashtra" },
  { name: "Gift Aura Peony Rose Crochet Flower Bouquet", category: "Crochet", price: 469, originalPrice: 599, stock: 14, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/b03af8bc2ade40df86851c0004b764af.png", artisanRegion: "Delhi NCR" },
  { name: "Handmade Crochet Flowers Mini Potted Flowers", category: "Crochet", price: 299, originalPrice: 399, stock: 21, image: "https://i.etsystatic.com/28672469/r/il/56e95e/4287244028/il_fullxfull.4287244028_86b8.jpg", artisanRegion: "Nainital, Uttarakhand" },
  { name: "Handmade Crochet Flower for Home Decoration and Gift", category: "Crochet", price: 100, originalPrice: 150, stock: 35, image: "https://i.etsystatic.com/47099982/r/il/04b8d2/8011139975/il_570xN.8011139975_4a5p.jpg", artisanRegion: "Pune, Maharashtra" },
  { name: "13CM Handmade Crochet Sunflower Flower Pot Decorative", category: "Crochet", price: 200, originalPrice: 299, stock: 20, image: "https://sutrikaknots.in/wp-content/uploads/2026/07/Handmade-crochet-double-sunflower-plant-in-decorative-pot-scaled.webp", artisanRegion: "Chandigarh" },
  { name: "M/S STYLE MOMENTS & GIFT COLLECTION Crochet Bouquet", category: "Crochet", price: 200, originalPrice: 279, stock: 18, image: "https://i.etsystatic.com/47099982/r/il/2af663/7867794001/il_570xN.7867794001_bd1v.jpg", artisanRegion: "Indore, Madhya Pradesh" },
  { name: "Handmade Tropical Hibiscus Crochet Flower Stem", category: "Crochet", price: 350, originalPrice: 449, stock: 12, image: "https://i.etsystatic.com/50423785/r/il/a3b8c6/6171547474/il_fullxfull.6171547474_neku.jpg", artisanRegion: "Kochi, Kerala" },
  { name: "Handmade Crochet Daisy Flower Bouquet Combo in Pink Vase", category: "Crochet", price: 100, originalPrice: 149, stock: 28, image: "https://www.bbassets.com/media/uploads/p/l/40369063_1-pearlfiesta-handmade-crochet-flower-bouquet-pink-white.jpg", artisanRegion: "Lucknow, Uttar Pradesh" },

  // Kashmiri & Accessories
  { name: "Big Kashmiri Circular Box", category: "Kashmiri & Accessories", price: 899, originalPrice: 1299, stock: 12, image: "https://static.wixstatic.com/media/f4984a_8738e48eb00344faab4094c143cc7b8b~mv2.png", artisanRegion: "Srinagar, Kashmir" },
  { name: "N D Classic Leather Wallet", category: "Kashmiri & Accessories", price: 150, originalPrice: 299, stock: 40, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800", artisanRegion: "Kanpur, Uttar Pradesh" },
  { name: "Gerbera Pearl Charm", category: "Kashmiri & Accessories", price: 199, originalPrice: 599, stock: 25, image: "https://assets.winni.in/product/primary/2023/1/82149.jpeg?dpr=1&w=500", artisanRegion: "Surat, Gujarat" },

  // Ethnic Wear
  { name: "Fuchsia Embroidered Punjabi Suit Set", category: "Ethnic Wear", price: 31500, originalPrice: 39999, stock: 5, image: "https://medias.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/e/m/embroidered-taffeta-silk-punjabi-suit-in-fuchsia-v1-kch15557.jpg", artisanRegion: "Patiala, Punjab" },
  { name: "Blush Bow - Tie Cuff Top & Slit Skirt Co-ord Set", category: "Ethnic Wear", price: 3250, originalPrice: 3999, stock: 9, image: "https://images.asos-media.com/products/asos-luxe-jacquard-mini-skirt-and-corset-top-co-ord-with-satin-bow-in-pink-floral/207984715-3?$n_640w$&wid=513&fit=constrain", artisanRegion: "Jaipur, Rajasthan" },
  { name: "Berry Pop - Balloon Sleeve Co-ord Set", category: "Ethnic Wear", price: 2999, originalPrice: 3999, stock: 11, image: "https://static.cilory.com/761778-thickbox_default/hot-pink-puff-sleeves-lace-co-ord-set.jpg", artisanRegion: "Mumbai, Maharashtra" },
  { name: "Sunshine Garden - Floral Embroidered Shirt", category: "Ethnic Wear", price: 2999, originalPrice: 3999, stock: 14, image: "https://www.veromoda.in/cdn/shop/files/902148501_g7_89fc1ae8-4c64-4d3f-adcd-2afa7581a6c7.jpg?v=1757417767&width=1080", artisanRegion: "Lucknow, Uttar Pradesh" },
  { name: "Ivory Pearl - Pom Pom Kurta Co-ord Set", category: "Ethnic Wear", price: 3999, originalPrice: 4999, stock: 8, image: "https://buysuidhagha.com/wp-content/uploads/2025/02/28_3b9c47e6-c78d-486d-9cf0-359b817b3a09_1440x-700x1244.webp", artisanRegion: "Varanasi, Uttar Pradesh" },
  { name: "Mocha Lines - Beige Kantha Stitch Co-ord Set", category: "Ethnic Wear", price: 3599, originalPrice: 3999, stock: 10, image: "https://www.stylesang.com/cdn/shop/files/WhatsAppImage2025-10-29at1.18.42PM_1.jpg?v=1766491535&width=416", artisanRegion: "Bolpur, West Bengal" },
  { name: "Wine Trail - Kantha Stitch Utility Co-ord Set", category: "Ethnic Wear", price: 3899, originalPrice: 4299, stock: 9, image: "https://assets.ajio.com/medias/sys_master/root/20250304/uLtk/67c656bc59f83539801640a2/-473Wx593H-701173426-maroon-MODEL.jpg", artisanRegion: "Kolkata, West Bengal" },

  // Lippan & Paintings
  { name: "Handcrafted Lippan Art Rangoli Set - Large", category: "Lippan & Paintings", price: 2800, originalPrice: 3500, stock: 8, image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800", artisanRegion: "Bhuj, Gujarat" },
  { name: "Lippan Art Rangoli", category: "Lippan & Paintings", price: 2400, originalPrice: 2999, stock: 11, image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800", artisanRegion: "Kutch, Gujarat" },
  { name: "Nandi Shiv Canvas Painting", category: "Lippan & Paintings", price: 9999, originalPrice: 12999, stock: 4, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800", artisanRegion: "Ujjain, Madhya Pradesh" },
  { name: "Lotus Lamp", category: "Lippan & Paintings", price: 1999, originalPrice: 2499, stock: 15, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800", artisanRegion: "Moradabad, Uttar Pradesh" },
  { name: "Murlidhar Leela - Handmade Lord Krishna Flute Lippan Mirror Art", category: "Lippan & Paintings", price: 2050, originalPrice: 2999, stock: 7, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800", artisanRegion: "Nathdwara, Rajasthan" },
  { name: "Kamdenu Aura - 3D Pichwai Cow Lippan Mirror Art Canvas", category: "Lippan & Paintings", price: 3499, originalPrice: 4999, stock: 6, image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800", artisanRegion: "Udaipur, Rajasthan" },
  { name: "Divya Jagannath - Handmade Lord Jagannath Acrylic Canvas Painting", category: "Lippan & Paintings", price: 7999, originalPrice: 9999, stock: 3, image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800", artisanRegion: "Puri, Odisha" },
  { name: "Emerald Gaze - Hand-Drawn Green Parrot Color Pencil Artwork", category: "Lippan & Paintings", price: 590, originalPrice: 999, stock: 14, image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800", artisanRegion: "Pune, Maharashtra" },
  { name: "Pink Petal Pot", category: "Lippan & Paintings", price: 399, originalPrice: 549, stock: 18, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800", artisanRegion: "Khurja, Uttar Pradesh" },
  { name: "Eternal Flowers - Forever Bouquet", category: "Lippan & Paintings", price: 499, originalPrice: 699, stock: 16, image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800", artisanRegion: "Bengaluru, Karnataka" },
  { name: "Lotus Mandala Lippan Art", category: "Lippan & Paintings", price: 1800, originalPrice: 2299, stock: 9, image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800", artisanRegion: "Ahmedabad, Gujarat" },
  { name: "Handcrafted Dot Mandala Mirror", category: "Lippan & Paintings", price: 1700, originalPrice: 2199, stock: 10, image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800", artisanRegion: "Jaipur, Rajasthan" }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(initialProducts);
    console.log(`Seeded ${initialProducts.length} Kalakriti products into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();
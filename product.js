const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  stock: { type: Number, default: 15 },
  image: { type: String, required: true },
  artisanRegion: { type: String, default: 'India' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
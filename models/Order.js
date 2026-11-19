const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      qty: Number
    }
  ],
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'RuPay', 'COD'], default: 'UPI' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Packed', 'Shipped', 'Delivered'],
    default: 'Processing'
  },
  courierPartner: { type: String, default: 'Delhivery' },
  awbNumber: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

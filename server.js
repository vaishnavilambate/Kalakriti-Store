require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB (kalakriti_db)'))
  .catch(err => console.error('MongoDB connection error:', err));

function verifyOwner(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized: Owner login required' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'owner') return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function verifyCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Please login to continue' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'customer' || !decoded.customerId) {
      return res.status(403).json({ message: 'Customer access required' });
    }
    req.customerId = decoded.customerId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
}

function optionalCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'customer' && decoded.customerId) {
      req.customerId = decoded.customerId;
    }
  } catch (_) {}
  next();
}

// Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, 'owner.html'));
});

// Customer Auth & Profile Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, pincode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered. Please login.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name,
      email,
      phone,
      address: address || '',
      pincode: pincode || '',
      passwordHash
    });

    const token = jwt.sign(
      { role: 'customer', customerId: customer._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        pincode: customer.pincode
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { role: 'customer', customerId: customer._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        pincode: customer.pincode
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/customer/profile', verifyCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).select('-passwordHash');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const orders = await Order.find({ customerId: req.customerId }).sort({ createdAt: -1 });
    res.json({ customer, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/customer/profile', verifyCustomer, async (req, res) => {
  try {
    const { name, phone, address, pincode } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customerId,
      { name, phone, address, pincode },
      { new: true }
    ).select('-passwordHash');
    res.json({ message: 'Profile updated', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/customer/orders', verifyCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public Storefront Routes
app.get('/api/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/orders', optionalCustomer, async (req, res) => {
  try {
    const { customerName, phone, address, pincode, items, paymentMethod } = req.body;
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
      product.stock -= item.qty;
      await product.save();
      subtotal += product.price * item.qty;
    }

    const gstAmount = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + gstAmount;
    const invoiceNumber = 'INV-2026-' + Math.floor(100000 + Math.random() * 900000);
    const awbNumber = 'IND' + Math.floor(100000000 + Math.random() * 900000000);

    const newOrder = await Order.create({
      customerId: req.customerId || null,
      invoiceNumber,
      customerName,
      phone,
      address,
      pincode,
      items,
      subtotal,
      gstAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      awbNumber
    });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Owner-Only Routes
app.post('/api/owner/login', (req, res) => {
  const { ownerId, passcode } = req.body;
  if (ownerId === process.env.OWNER_ID && passcode === process.env.OWNER_PASS) {
    const token = jwt.sign({ role: 'owner' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid Owner Credentials' });
});

app.get('/api/owner/dashboard', verifyOwner, async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  const orders = await Order.find().sort({ createdAt: -1 });

  const totalIncome = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalGst = orders.reduce((sum, o) => sum + o.gstAmount, 0);
  const pendingCod = orders
    .filter(o => o.paymentStatus === 'Pending')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    stats: {
      totalIncome,
      totalGst,
      pendingCod,
      totalOrders: orders.length,
      lowStockCount: products.filter(p => p.stock <= 5).length
    },
    products,
    orders
  });
});

app.post('/api/owner/products', verifyOwner, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

app.patch('/api/owner/products/:id/stock', verifyOwner, async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  res.json(product);
});

app.patch('/api/owner/orders/:id', verifyOwner, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Kalakriti Server running on http://localhost:${PORT}`));

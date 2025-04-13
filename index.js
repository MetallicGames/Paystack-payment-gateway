const express = require('express');
const bodyParser = require('body-parser');
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Root route to confirm server is alive
app.get('/', (req, res) => {
  res.send('🚀 Paystack server is running!');
});

// Payment initialization route
app.post('/initialize-payment', async (req, res) => {
  const { amount, email } = req.body;

  console.log("📥 Payment request received:", req.body);

  // Basic validation
  if (!amount || !email) {
    console.error("❌ Missing 'amount' or 'email' in request body");
    return res.status(400).json({ error: "Missing 'amount' or 'email'" });
  }

  try {
    const response = await paystack.transaction.initialize({
      amount: Math.round(amount * 100), // Convert dollars to cents
      email,
      currency: 'NGN',
      callback_url: process.env.PAYSTACK_CALLBACK_URL || 'https://your-callback-url.com',
    });

    console.log("✅ Paystack response:", response);

    res.json({
      status: response.status,
      message: response.message,
      data: {
        link: response.data.authorization_url,
      },
    });

  } catch (error) {
    console.error("🔥 Paystack initialization failed:", error);
    res.status(500).json({ error: error.message || 'Something went wrong with Paystack' });
  }
});

// Paystack callback route (optional use)
app.post('/paystack-callback', async (req, res) => {
  const reference = req.body?.data?.reference;

  if (!reference) {
    return res.status(400).send('Missing payment reference');
  }

  try {
    const response = await paystack.transaction.verify(reference);

    if (response.data.status === 'success') {
      console.log('✅ Payment successful:', reference);
      // You can reward the user here
    } else {
      console.log('❌ Payment failed or incomplete:', reference);
    }

    res.send('OK');

  } catch (error) {
    console.error('🔥 Error verifying payment:', error);
    res.status(500).send('Error verifying payment');
  }
});

// Start server
app.listen(port, () => {
  console.log(`🌐 Server running on port ${port}`);
});

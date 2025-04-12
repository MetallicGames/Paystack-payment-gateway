const express = require('express');
const bodyParser = require('body-parser');
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Simple route for root to test server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Route to initialize payment
app.post('/initialize-payment', (req, res) => {
  const { amount, email } = req.body;

  // Adjusted to handle USD correctly (not multiplying by 100)
  paystack.transaction.initialize({
    amount: Math.round(amount * 100), // amount in cents (USD)
    email: email,
    currency: 'USD', // Set the currency to USD
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
  })
    .then(response => res.json(response))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Route to handle Paystack's callback
app.post('/paystack-callback', (req, res) => {
  const { reference } = req.body.data;

  // Verify the payment status
  paystack.transaction.verify(reference)
    .then(response => {
      if (response.data.status === 'success') {
        // Handle successful payment
        console.log('Payment successful');
      } else {
        // Handle failed payment
        console.log('Payment failed');
      }
      res.send('OK');
    })
    .catch(error => {
      console.error('Error verifying payment:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

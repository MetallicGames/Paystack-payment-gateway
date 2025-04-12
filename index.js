const express = require('express');
const bodyParser = require('body-parser');
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Route to initialize payment
app.post('/initialize-payment', (req, res) => {
  const { amount, email } = req.body;
  paystack.transaction.initialize({
    amount: amount * 100, // Amount in kobo
    email: email,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
  })
    .then(response => res.json(response))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Route to handle Paystack's callback
app.post('/paystack-callback', (req, res) => {
  const { reference } = req.body.data;
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

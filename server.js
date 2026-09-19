
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Joya Recharge Server is Running Successfully!');
});

// Recharge API endpoint jisse error theek ho jayega
app.post('/api/recharge', (req, res) => {
  const { mobile, operator, amount } = req.body;
  
  console.log(`Recharge Request Received: Mobile: ${mobile}, Operator: ${operator}, Amount: ${amount}`);

  res.status(200).json({
    success: true,
    message: "Recharge Successful",
    transactionId: "TXN" + Math.floor(Math.random() * 1000000000),
    mobile: mobile,
    operator: operator,
    amount: amount
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. /api/recharge endpoint
app.post('/api/recharge', (req, res) => {
  const { mobile, operator, amount } = req.body;
  
  console.log(`Recharge Received -> Mobile: ${mobile}, Operator: ${operator}, Amount: ${amount}`);
  
  // Yahan aap apna real recharge API provider (jaise TechnoPay, EkPe, etc.) integrate kar sakte hain.
  // Abhi ke liye yeh success response bhejega taaki app mein error na aaye.
  
  res.status(200).json({
    success: true,
    message: "Recharge Successful via Backend Server",
    transactionId: "TXN_" + Date.now()
  });
});

// 2. Fallback /recharge endpoint (taaki 404 error kabhi na aaye)
app.post('/recharge', (req, res) => {
  const { mobile, operator, amount } = req.body;
  
  res.status(200).json({
    success: true,
    message: "Recharge Successful via Backend Server",
    transactionId: "TXN_" + Date.now()
  });
});

// Root check route
app.get('/', (req, res) => {
  res.send("Joya Recharge Backend Server is Live & Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

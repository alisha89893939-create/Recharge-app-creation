const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration (Updated with your new token)
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';
const PAY2ALL_API_TOKEN = 't2a_43094c42_ca0a3a61223886a18985576ddb010eb0a86c9490652f1d74';

// Operator Name se Pay2All Provider ID mapping dictionary
const OPERATOR_IDS = {
  // Mobile Operators
  "1": 1, 
  "2": 2, 
  "3": 3, 
  "4": 4, 
  "vodafone": 3,
  "jio": 2,
  "airtel": 1,
  "bsnl": 4,

  // DTH Operators
  "10": 10, 
  "11": 11, 
  "12": 12, 
  "13": 13, 
  "14": 14, 
  "tata play": 10,
  "airtel digital tv": 11,
  "sun direct": 12,
  "dish tv": 13,
  "d2h": 14,

  // Electricity Operators
  "20": 20, 
  "21": 21, 
  "22": 22, 
  "23": 23,

  // Gas Operators
  "30": 30, 
  "31": 31, 
  "32": 32,

  // Broadband Operators
  "40": 40, 
  "41": 41, 
  "42": 42
};

const handleRecharge = async (req, res) => {
  try {
    const { mobile, amount, operator, client_id } = req.body;

    if (!mobile || !amount || !operator) {
      return res.status(400).json({ status: "failure", message: "Missing required fields" });
    }

    const txn_id = client_id || "TXN_" + Date.now();

    // Operator number ya string se provider_id nikalna
    const provider_id = OPERATOR_IDS[String(operator).toLowerCase()] || Number(operator) || 1;

    // Pay2All API Payload Structure
    const payload = {
      client_id: txn_id,
      provider_id: provider_id,
      number: mobile,
      amount: Number(amount)
    };

    console.log("Sending payload to Pay2All:", payload);

    // Pay2All live API Request with correct token and headers
    const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message
    });
  }
};

// Map both /api/recharge and /recharge routes
app.post('/api/recharge', handleRecharge);
app.post('/recharge', handleRecharge);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


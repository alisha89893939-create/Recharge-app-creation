const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Pay2All API Configuration (apna env ya values use karein)
const PAY2ALL_BASE_URL = process.env.PAY2ALL_BASE_URL || 'https://pay2all.in/api/v1';
const PAY2ALL_API_TOKEN = process.env.PAY2ALL_API_TOKEN || '1254_d7118cb9eae6f56eec5ef208536f982998ae0ce6';

// Operator Name se Pay2All Provider ID mapping dictionary
const OPERATOR_IDS = {
  // Mobile Operators
  "1": 1, // Airtel
  "2": 2, // Jio
  "3": 3, // Vi
  "4": 4, // BSNL
  "vodafone": 3,
  "jio": 2,
  "airtel": 1,
  "bsnl": 4,

  // DTH Operators
  "10": 10, // Tata Play
  "11": 11, // Airtel Digital TV
  "12": 12, // Sun Direct
  "13": 13, // Dish TV
  "14": 14, // D2H
  "tata play": 10,
  "airtel digital tv": 11,
  "sun direct": 12,
  "dish tv": 13,
  "d2h": 14,

  // Electricity Operators
  "20": 20, // Adani Electricity
  "21": 21, // TATA Power
  "22": 22, // SBPDCL (Bihar)
  "23": 23, // UPPCL

  // Gas Operators
  "30": 30, // Indane Gas
  "31": 31, // HP Gas
  "32": 32, // Bharat Gas

  // Broadband Operators
  "40": 40, // Airtel Xstream
  "41": 41, // JioFiber
  "42": 42  // ACT Fibernet
};

app.post(['/api/recharge', '/recharge'], async (req, res) => {
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
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


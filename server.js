const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';
const PAY2ALL_API_TOKEN = 't2a_43094c42_ca0a3a61223886a18985576ddb010eb0a86c9490652f1d74';

// Updated Provider IDs Mapping Dictionary
const OPERATOR_IDS = {
  // Mobile Recharge
  "airtel": 1,
  "jio": 2,
  "vi": 3,
  "vodafone idea": 3,
  "bsnl": 4,

  // DTH Recharge
  "tata play": 5,
  "airtel digital tv": 6,
  "dish tv": 7,
  "d2h": 8,
  "sun direct": 9,

  // Account Verification
  "bank account verify": 10,
  "verify_bank": 10,
  "upi verify": 11,
  "verify_upi": 11,

  // Recharge & Bills / Bill Payment
  "bill payment": 13,
  "bill_payment": 13,

  // Travel
  "flight booking": 14,
  "flight_booking": 14,
  "bus booking": 20,
  "bus_booking": 20,
  "tour packages": 21,
  "tour_packages": 21,

  // Money Transfer
  "dmt": 15,

  // eChallan
  "echallan lookup": 16,
  "echallan_lookup": 16,

  // CRM
  "crm": 17,

  // AEPS Banking
  "cash withdrawal": 22,
  "acw": 22,
  "balance enquiry": 23,
  "abe": 23,
  "mini statement": 24,
  "ams": 24,
  "cash deposit": 25,
  "acd": 25,

  // Direct Number keys mapping
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
  "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  "11": 11, "13": 13, "14": 14, "15": 15, "16": 16,
  "17": 17, "20": 20, "21": 21, "22": 22, "23": 23,
  "24": 24, "25": 25
};

const handleRecharge = async (req, res) => {
  try {
    const { mobile, amount, operator, client_id, endpoint_type } = req.body;

    if (!mobile || !amount || !operator) {
      return res.status(400).json({ 
        status: "failure", 
        message: "Missing required fields: mobile, amount, or operator are required." 
      });
    }

    const txn_id = client_id || "TXN_" + Date.now();

    // Map operator name/number to correct provider_id
    const normalizedOperator = String(operator).trim().toLowerCase();
    const provider_id = OPERATOR_IDS[normalizedOperator] || Number(operator) || 1;

    // Pay2All API Payload Structure
    const payload = {
      client_id: txn_id,
      provider_id: provider_id,
      number: mobile,
      amount: Number(amount)
    };

    // Determine API endpoint based on request type or default to /recharge
    let apiEndpoint = `${PAY2ALL_BASE_URL}/recharge`;
    if (endpoint_type === 'bill') {
      apiEndpoint = `${PAY2ALL_BASE_URL}/bill-pay`; // Agar bill payment ho toh endpoint adjust karein
    }

    console.log(`Sending payload to Pay2All (${apiEndpoint}):`, payload);

    const response = await axios.post(apiEndpoint, payload, {
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
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// Routes
app.post('/api/recharge', handleRecharge);
app.post('/recharge', handleRecharge);

app.get('/', (req, res) => {
  res.send("Pay2All Integration Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


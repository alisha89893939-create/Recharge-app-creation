const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = "https://pay2all.in/api/v1";
const PAY2ALL_API_TOKEN = "your_pay2all_api_token_here";

// Operator Name to Pay2All Provider ID mapping dictionary (As per Pay2All Support)
const OPERATOR_IDS = {
  "jio": 2,
  "airtel": 1,
  "vi": 3,
  "vodafone": 3,
  "bsnl": 4
};

app.post('/api/recharge', async (req, res) => {
  try {
    const { mobile, amount, operator } = req.body;

    if (!mobile || !amount || !operator) {
      return res.status(400).json({ status: "FAIL", message: "Missing required fields" });
    }

    // Operator name in lowercase karke sahi provider id nikalna
    const mapKey = operator.toLowerCase();
    const providerId = OPERATOR_IDS[mapKey];

    // Pay2All API Payload structure
    const payload = {
      client_id: "1",
      provider_id: providerId,
      number: mobile,
      amount: Number(amount)
    };

    console.log("Sending payload to Pay2All:", payload);

    // Pay2All Live API Request
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
      status: "FAIL",
      message: error.response?.data?.message || error.message
    });
  }
});

app.post('/api/recharge-margin', (req, res) => {
  req.url = '/api/recharge';
  return app._router.handle(req, res);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


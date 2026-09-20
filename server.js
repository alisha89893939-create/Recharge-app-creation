const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = "https://pay2all.in/api/v1";
const PAY2ALL_API_TOKEN = "t2a_5464fb66_e1d260b245d5e1292c0b49bfab93ba688517d70f46d585f";

// Operator Keys to Pay2All Provider ID mapping dictionary (As per Pay2All Support)
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
    console.log("Received request data:", { mobile, amount, operator });

    if (!mobile || !amount || !operator) {
      return res.status(400).json({ status: "FAIL", message: "Missing required fields" });
    }

    // Operator name ko clean aur lowercase karna
    const opKey = operator.toLowerCase().trim();
    let providerId = OPERATOR_IDS[opKey];

    // Agar direct match na ho toh check karein ki operator mein kya likha hai
    if (!providerId) {
      if (opKey.includes('jio')) providerId = 2;
      else if (opKey.includes('airtel')) providerId = 1;
      else if (opKey.includes('vi') || opKey.includes('vodafone')) providerId = 3;
      else if (opKey.includes('bsnl')) providerId = 4;
    }

    if (!providerId) {
      return res.status(400).json({ status: "FAIL", message: `Invalid operator specified: ${operator}` });
    }

    // Pay2All API payload structure
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
        "Authorization": `Bearer ${PAY2ALL_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.log("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "FAIL",
      message: error.response?.data?.message || error.message
    });
  }
});

app.get('/api/recharge-margin', (req, res) => {
  res.json({ status: "Vapi/recharge" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = "https://pay2all.in/api/v1";
const PAY2ALL_API_TOKEN = "t2a_51f7471a_c6bee77382e9009fdc9b888a446067019c55ed9ca8bb5ddf";

// Operator Keys to Operator ID mapping dictionary
const OPERATOR_IDS = {
    'airtel': 1,
    'jio': 2,
    'vi': 3,
    'vodafone': 3,
    'bsnl': 4,
    'tataplay': 10,
    'airteldth': 11,
    'sundirect': 12,
    'd2h': 13
};

app.post('/api/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator } = req.body;
        console.log("Received request data:", { mobile, amount, operator });

        if (!mobile || !amount || !operator) {
            return res.status(400).json({ status: "FAIL", message: "Missing required fields" });
        }

        let providerId;

        if (OPERATOR_IDS[operator]) {
            providerId = OPERATOR_IDS[operator];
        } else {
            const opkey = String(operator).toLowerCase().trim();
            providerId = OPERATOR_IDS[opkey];

            if (!providerId) {
                if (opkey.includes('airtel')) providerId = 1;
                else if (opkey.includes('jio')) providerId = 2;
                else if (opkey.includes('vi') || opkey.includes('vodafone')) providerId = 3;
                else if (opkey.includes('bsnl')) providerId = 4;
            }
        }

        if (!providerId) {
            return res.status(400).json({ status: "FAIL", message: "Invalid operator specified" });
        }

        const payload = {
            client_id: "1",
            provider_id: providerId,
            number: mobile,
            amount: amount
        };

        console.log("Sending payload to Pay2All:", payload);

        const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

app.get('/api/recharge/ping', (req, res) => {
    res.json({ status: "App/Recharge working" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


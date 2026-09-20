const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = "https://pay2all.in/api/v1";
const PAY2ALL_API_TOKEN = "t2a_c653923d_9c53bf9e2ea22632f4d877def2acf4349532a4ef364336ad";

// Updated Operator Name to Pay2All Provider ID mapping dictionary
const OPERATOR_IDS = {
    "jio": 2,
    "airtel": 1,
    "vi": 3,
    "vi (vodafone idea)": 3,
    "vodafone": 3,
    "bsnl": 4
};

app.post('/api/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator, client_id } = req.body;

        if (!mobile || !amount || !operator) {
            return res.status(400).json({ status: "failure", message: "Missing required fields" });
        }

        const tkn_id = client_id || 'TXN_' + Date.now();

        // Operator name ko lowercase karke sahi provider_id nikalna
        const opKey = String(operator).trim().toLowerCase();
        let providerId = OPERATOR_IDS[opKey];

        if (!providerId) {
            if (opKey.includes('jio')) providerId = 2;
            else if (opKey.includes('airtel')) providerId = 1;
            else if (opKey.includes('vi') || opKey.includes('vodafone')) providerId = 3;
            else if (opKey.includes('bsnl')) providerId = 4;
            else providerId = Number(operator) || 1;
        }

        // Pay2All API Payload structure
        const payload = {
            client_id: tkn_id,
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
            status: "failure",
            message: error.response?.data?.message || error.message
        });
    }
});

app.post('/recharge', async (req, res) => {
    req.url = '/api/recharge';
    return app._router.handle(req, res);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration (Pura aur Sahi URL)
const PAY2ALL_API_URL = "https://pay2all.in/api/v1/recharge";
const PAY2ALL_TOKEN = "YTE1NzJiMWZhNjI1ZDBlOWZhNzFiNWQwMWNmMTczMTE="; // Aapka API Token

app.post('/api/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator, client_id } = req.body;

        if (!mobile || !amount || !operator) {
            return res.status(400).json({ status: "failure", message: "Missing required fields" });
        }

        const txnId = client_id || 'TXN_' + Date.now();

        // Pay2All API ke mutabiq sahi Payload structure
        const payload = {
            client_id: txnId,
            provider_id: operator, // Jaise Jio, Airtel etc.
            number: mobile,
            amount: Number(amount)
        };

        console.log("Sending payload to Pay2All:", payload);

        // Pay2All Live API ko request bhejna
        const response = await axios.post(PAY2ALL_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log("Pay2All Success Response:", response.data);
        return res.json(response.data);

    } catch (error) {
        console.error("Pay2All API Error Response:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            status: "failure",
            message: error.response && error.response.data ? error.response.data : error.message
        });
    }
});

app.post('/recharge', async (req, res) => {
    return app._router.handle({ ...req, url: '/api/recharge' }, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration (Pura aur sahi Base URL)
const PAY2ALL_API_URL = "https://pay2all.in/api/v1/recharge";
const PAY2ALL_TOKEN = "YTE1NzJiMWZhNjI1ZDBlOWZhNzFiNWQwMWNmMTczMTE="; // Aapka API Token yahan hai

app.post('/api/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator, client_id } = req.body;

        // Basic validation (Frontend ke 'operator' field ke mutabiq)
        if (!mobile || !amount || !operator) {
            return res.status(400).json({ status_id: 0, message: "Missing required fields: mobile, amount, or operator" });
        }

        // Unique transaction ID agar client na de toh generate karein
        const txnId = client_id || 'TXN_' + Date.now();

        // Pay2All API Request Payload
        const payload = {
            client_id: txnId,
            provider_id: operator, // Frontend se aane wala operator yahan map hoga
            number: mobile,
            amount: Number(amount)
        };

        console.log("Sending request to Pay2All:", payload);

        // Call Pay2All Live Recharge API
        const response = await axios.post(PAY2ALL_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Pay2All Response:", response.data);

        // Return response back to app
        return res.json(response.data);

    } catch (error) {
        console.error("Recharge API Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            status_id: 0,
            message: "Recharge failed due to server error",
            error: error.response ? error.response.data : error.message
        });
    }
});

// Purane route ke liye backup support (/recharge)
app.post('/recharge', async (req, res) => {
    return app._router.handle({ ...req, url: '/api/recharge' }, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

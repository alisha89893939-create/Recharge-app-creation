
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration
const PAY2ALL_API_URL = "https://pay2all.in/api/v1/recharge";
const PAY2ALL_TOKEN = "T2a_f51bd7ee_0abf73a99a6f30364e8603acc10c056fe4123d7386ed69b9";

app.post('/api/recharge', async (req, res) => {
    try {
        const { number, amount, provider_id, client_id } = req.body;

        // Basic validation
        if (!number || !amount || !provider_id) {
            return res.status(400).json({ status_id: 0, message: "Missing required fields (number, amount, provider_id)" });
        }

        // Unique transaction ID agar client na de toh generate karein
        const txnId = client_id || "TXN_" + Date.now();

        // Pay2All API Request Payload
        const payload = {
            client_id: txnId,
            provider_id: Number(provider_id),
            number: number,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

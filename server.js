
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration
const PAY2ALL_API_URL = "https://pay2all.in/api/v1/recharge";
const PAY2ALL_TOKEN = "T2a_f51bd7ee_0abf73a99a6f30364e8603acc10c056fe4123d7386ed69b9";

// Operator Name to Provider ID Mapping
const providerMap = {
    "Jio": 1,
    "Airtel": 2,
    "Vi": 3,
    "BSNL": 4,
    "Tata Play": 5,
    "Airtel Digital TV": 6
};

// Common Recharge Logic Function
async function processRecharge(req, res) {
    try {
        const { number, mobile, amount, provider_id, operator, client_id } = req.body;

        const targetNumber = number || mobile;
        const targetAmount = amount;
        const targetOperator = provider_id || operator;

        console.log(`Recharge Received -> Mobile: ${targetNumber}, Operator: ${targetOperator}, Amount: ${targetAmount}`);

        if (!targetNumber || !targetAmount || !targetOperator) {
            return res.status(400).json({ 
                status_id: 0, 
                message: "Missing required fields (number/mobile, amount, provider_id/operator)" 
            });
        }

        // Map operator name to numeric provider_id if string is passed
        let finalProviderId = providerMap[targetOperator] || Number(targetOperator) || 1;

        const txnId = client_id || "TXN_" + Date.now();

        const payload = {
            client_id: txnId,
            provider_id: finalProviderId,
            number: targetNumber,
            amount: Number(targetAmount)
        };

        console.log("Sending request to Pay2All:", payload);

        const response = await axios.post(PAY2ALL_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Pay2All Response:", response.data);
        return res.json(response.data);

    } catch (error) {
        console.error("Recharge API Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            status_id: 0,
            message: "Recharge failed due to server error",
            error: error.response ? error.response.data : error.message
        });
    }
}

// Endpoints
app.post('/api/recharge', processRecharge);
app.post('/recharge', processRecharge);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

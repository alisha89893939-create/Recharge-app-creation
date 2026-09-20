const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration
const PAY2ALL_TOKEN = "t2a_17b193fd_ee29014459bb0d0ef1e98bb13f7a1f02c30ede8f9392aebd"; 
const PAY2ALL_BASE_URL = "https://pay2all.in/api/v1";

app.post('/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator, client_id } = req.body;

        if (!mobile || !amount || !operator) {
            return res.status(400).json({ status: "failure", message: "Missing required fields" });
        }

        const txn_id = client_id || "TXN" + Date.now();

        // Pay2All API Payload structure
        const payload = {
            client_id: txn_id,
            provider_id: operator, 
            number: mobile,
            amount: Number(amount)
        };

        console.log("Sending payload to Pay2All:", payload);

        // Pay2All Live API request
        const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


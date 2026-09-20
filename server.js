const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

const PAY2ALL_TOKEN = 't2a_51f7471a_c6bee77382e9009fdc9b888a446067019c55ed9ca8bb5ddf';
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';

// Operator Name se Pay2All Provider ID mapping dictionary (Updated)
const OPERATOR_IDS = {
    // Mobile Operators
    "Jio": 2,
    "Airtel": 1,
    "Vi": 3,
    "BSNL": 4,

    // DTH Operators
    "Tata Play": 10,
    "Airtel Digital TV": 11,
    "Sun Direct": 12,
    "Dish TV": 13,
    "D2H": 14
};

const handleRecharge = async (req, res) => {
    try {
        console.log('--- INCOMING RECHARGE REQUEST ---');
        console.log('Request Body:', req.body);

        const { mobile, amount, operator, client_id } = req.body;

        if (!mobile || !amount || !operator) {
            return res.status(400).json({
                status: 'failure',
                message: 'Missing required fields (mobile, amount, or operator)'
            });
        }

        let providerId;
        const opKey = String(operator).trim();

        if (!isNaN(opKey)) {
            providerId = Number(opKey);
        } else {
            // Case-insensitive match check
            const matchedKey = Object.keys(OPERATOR_IDS).find(
                key => key.toLowerCase() === opKey.toLowerCase()
            );
            providerId = matchedKey ? OPERATOR_IDS[matchedKey] : null;
        }

        if (!providerId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Invalid operator specified'
            });
        }

        const payload = {
            client_id: client_id || "1",
            provider_id: providerId,
            number: mobile,
            amount: amount
        };

        console.log('Sending payload to Pay2All:', payload);

        const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Pay2All Success Response:', response.data);
        return res.json(response.data);

    } catch (error) {
        console.error('Pay2All API Error:', error.response?.data || error.message);
        return res.status(500).json({
            status: 'failure',
            message: error.response?.data?.message || error.message
        });
    }
};

app.post('/api/recharge', handleRecharge);

app.get('/api/recharge/ping', (req, res) => {
    res.json({ status: 'App/Recharge working' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


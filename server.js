const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Pay2All API Configuration
const PAY2ALL_TOKEN = 't2c_i7b... apna token yahan rakhein'; 
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';

app.post('/recharge', async (req, res) => {
    try {
        const { mobile, amount, operator, client_id } = req.body;

        // Validation check
        if (!mobile || !amount || !operator) {
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Missing required fields (mobile, amount, or operator)' 
            });
        }

        const txn_id = client_id || 'TXN' + Date.now();

        // Pay2All API Payload structure
        const payload = {
            client_id: txn_id,
            provider_id: operator,
            number: mobile,
            amount: Number(amount)
        };

        console.log('Sending payload to Pay2All:', payload);

        // Pay2All Live API Request
        const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
            headers: {
                'Authorization': `Bearer ${PAY2ALL_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Pay2All Success Response:', response.data);
        return res.status(200).json(response.data);

    } catch (error) {
        console.error('Pay2All API Error Response:', error.response?.data || error.message);
        
        return res.status(500).json({
            status: 'failure',
            message: error.response?.data?.message || error.message || 'An error occurred during recharge'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


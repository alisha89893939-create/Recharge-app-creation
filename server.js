const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const PAY2ALL_TOKEN = 't2a_c653923d_9c53bf9e2ea22632f4d877def2acf4349532a4ef364336ad'; 
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';

app.post('/recharge', async (req, res) => {
    try {
        console.log('Incoming Request Body:', req.body); // Yeh check karne ke liye ki app se kya data aa raha hai

        const { mobile, amount, operator, provider_id, provider, operator_id, client_id } = req.body;

        // Agar app se koi operator id nahi aa rahi, toh by default 1 (Jio/Operator ID) le lega taaki NaN na ho
        const rawProvider = operator || provider_id || provider || operator_id || 1;
        const finalProviderId = Number(rawProvider);

        if (!mobile || !amount || isNaN(finalProviderId)) {
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Invalid or missing fields (mobile, amount, or operator)' 
            });
        }

        const txn_id = client_id || 'TXN' + Date.now();

        const payload = {
            client_id: txn_id,
            provider_id: finalProviderId,
            number: String(mobile),
            amount: Number(amount)
        };

        console.log('Sending payload to Pay2All:', payload);

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


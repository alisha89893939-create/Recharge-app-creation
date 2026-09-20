const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const PAY2ALL_TOKEN = 't2a_c653923d_9c53bf9e2ea22632f4d877def2acf4349532a4ef364336ad'; 
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';

// Operator Name se Pay2All Provider ID mapping dictionary
const OPERATOR_IDS = {
    // Mobile Operators
    "Jio": 1,         
    "Airtel": 2,
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

        // Operator name ko numeric provider_id me convert karein
        let providerId = OPERATOR_IDS[operator];
        
        if (!providerId) {
            providerId = Number(operator) || 1; 
        }

        const txn_id = client_id || 'TXN' + Date.now();

        const payload = {
            client_id: txn_id,
            provider_id: providerId,
            number: String(mobile),
            amount: Number(amount)
        };

        console.log('Sending mapped payload to Pay2All:', payload);

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
            message: error.response?.data?.message || error.message || 'Recharge failed from operator gateway'
        });
    }
};

// Routes
app.post('/recharge', handleRecharge);
app.post('/api/recharge', handleRecharge);
app.post('/*/recharge', handleRecharge);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



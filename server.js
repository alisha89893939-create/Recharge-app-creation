const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const PAY2ALL_TOKEN = 't2a_c653923d_9c53bf9e2ea22632f4d877def2acf4349532a4ef364336ad'; 
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';

// Common recharge logic function
const handleRecharge = async (req, res) => {
    try {
        console.log('--- SUCCESSFUL INCOMING REQUEST ---');
        console.log('Requested URL Path:', req.path);
        console.log('Incoming Request Body:', req.body);

        const { mobile, amount, operator, provider_id, provider, operator_id, client_id } = req.body;

        // Operator name ko provider_id me map karne ke liye
        let finalProviderId = 1; // Default fallback
        const opName = String(operator || provider || '').toLowerCase();

        if (opName.includes('jio')) {
            finalProviderId = 1; // Apne Pay2All dashboard ke hisab se Jio ka ID yahan set karein
        } else if (opName.includes('airtel')) {
            finalProviderId = 2; // Airtel ID
        } else if (opName.includes('vi') || opName.includes('vodafone')) {
            finalProviderId = 3; // Vi ID
        } else {
            // Agar pehle se koi number ya provider_id bheja hai toh usko use karein
            const rawProvider = provider_id || operator_id || operator;
            if (!isNaN(rawProvider) && rawProvider !== '') {
                finalProviderId = Number(rawProvider);
            }
        }

        if (!mobile || !amount) {
            return res.status(400).json({ 
                status: 'failure', 
                message: 'Invalid or missing fields (mobile or amount)' 
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
};

// Sabhi possible routes ko handle karega
app.post('/recharge', handleRecharge);
app.post('/api/recharge', handleRecharge);
app.post('/*/recharge', handleRecharge);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Ye CORS ki problem ko hata dega

// Root route (Server check karne ke liye)
app.get('/', (req, res) => {
    res.send('Recharge Server is Live and Running!');
});

// Recharge ke liye route
app.post('/api/recharge', async (req, res) => {
    try {
        const { mobile, operator, amount } = req.body;

        // Yahan Pay2All ka original API URL aur Token dalein
        const pay2allResponse = await axios.post('https://api.pay2all.in/v1/recharge', {
            mobile: mobile,
            operator: operator,
            amount: amount
        }, {
            headers: {
                'Authorization': 'Bearer AAPKA_PAY2ALL_API_TOKEN',
                'Content-Type': 'application/json'
            }
        });

        // Pay2All ka response wapas aapke mobile app ko bhej diya jayega
        res.json(pay2allResponse.data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

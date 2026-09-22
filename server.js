const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Pay2All API Configuration
const PAY2ALL_BASE_URL = 'https://pay2all.in/api/v1';
const PAY2ALL_API_TOKEN = process.env.PAY2ALL_API_TOKEN || 't2a_43094c42_ca0a3a61223886a18985576ddb010eb0a86c9490652f1d74';

// Operator & Service ID Mapping Dictionary
const OPERATOR_IDS = {
  // Mobile Operators
  "jio": 2,
  "airtel": 1,
  "vi": 3,
  "vodafone": 3,
  "bsnl": 4,

  // DTH Operators
  "tata play": 5,
  "tata sky": 5,
  "airtel digital tv": 6,
  "airtel dth": 6,
  "dish tv": 7,
  "d2h": 8,
  "sun direct": 9,

  // Bank Account & UPI Verification
  "bank verify": 10,
  "bank account verify": 10,
  "verify_bank": 10,
  "upi verify": 11,
  "verify_upi": 11,

  // Electricity & Bill Payments
  "electricity": 13,
  "electricity bill": 13,
  "bill payment": 13,
  "bill_payment": 13
};

const handleTransaction = async (req, res) => {
  try {
    const { mobile, number, amount, operator, client_id, endpoint_type } = req.body;
    
    const targetNumber = mobile || number;

    if (!targetNumber || !amount || !operator) {
      return res.status(400).json({ 
        status: "failure", 
        message: "Missing required fields: mobile/number, amount, or operator." 
      });
    }

    const txn_id = client_id || "TXN_" + Date.now();

    // Operator name/number mapping
    const normalizedOperator = String(operator).trim().toLowerCase();
    let provider_id = OPERATOR_IDS[normalizedOperator] || Number(operator) || 1;

    // Determine correct API endpoint based on service type
    let apiEndpoint = `${PAY2ALL_BASE_URL}/recharge`;
    
    if (endpoint_type === 'bill' || normalizedOperator.includes('electricity') || normalizedOperator.includes('bill')) {
      apiEndpoint = `${PAY2ALL_BASE_URL}/bill-pay`;
    } else if (normalizedOperator.includes('verify') || provider_id === 10 || provider_id === 11) {
      apiEndpoint = `${PAY2ALL_BASE_URL}/verification`;
    }

    // Pay2All API Payload Structure
    const payload = {
      client_id: txn_id,
      provider_id: Number(provider_id),
      number: targetNumber,
      amount: Number(amount)
    };

    console.log(`Sending payload to Pay2All (${apiEndpoint}):`, payload);

    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// API Routes
app.post('/api/recharge', handleTransaction);
app.post('/recharge', handleTransaction);
app.post('/api/bill-pay', handleTransaction);

app.get('/', (req, res) => {
  res.send("Pay2All Multi-Service Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// API Routes
app.post('/api/recharge', handleTransaction);
app.post('/recharge', handleTransaction);
app.post('/api/bill-pay', handleTransaction);

app.get('/', (req, res) => {
  res.send("Pay2All Multi-Service Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// API Routes
app.post('/api/recharge', handleTransaction);
app.post('/recharge', handleTransaction);
app.post('/api/bill-pay', handleTransaction);

app.get('/', (req, res) => {
  res.send("Pay2All Multi-Service Server (Recharge, DTH, Electricity, Bank Verify) is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

        message: "Missing required fields: mobile, amount, or operator are required." 
      });
    }

    // 1. Strict Mobile Number Validation (Must be exactly 10 digits)
    const cleanMobile = String(mobile).trim();
    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({ 
        status: "failure", 
        message: "Enter a valid 10-digit mobile number." 
      });
    }

    const txn_id = client_id || "TXN_" + Date.now();

    // 2. Safe Operator Mapping Lookup
    const normalizedOperator = String(operator).trim().toLowerCase();
    let provider_id = OPERATOR_IDS[normalizedOperator] || Number(operator);

    // 3. Safety Fallback: If operator is invalid or incorrectly resolves to bank verify (10) during a normal recharge, fallback safely to Airtel (1)
    if (!provider_id || isNaN(provider_id) || provider_id === 10) {
      provider_id = 1; 
    }

    // Pay2All API Payload Structure
    const payload = {
      client_id: txn_id,
      provider_id: Number(provider_id),
      number: cleanMobile,
      amount: Number(amount)
    };

    let apiEndpoint = `${PAY2ALL_BASE_URL}/recharge`;
    if (endpoint_type === 'bill') {
      apiEndpoint = `${PAY2ALL_BASE_URL}/bill-pay`;
    }

    console.log(`Sending verified payload to Pay2All (${apiEndpoint}):`, payload);

    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// Routes
app.post('/api/recharge', handleRecharge);
app.post('/recharge', handleRecharge);

app.get('/', (req, res) => {
  res.send("Pay2All Integration Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

    const provider_id = OPERATOR_IDS[normalizedOperator] || Number(operator) || 1;

    // Pay2All API Payload Structure
    const payload = {
      client_id: txn_id,
      provider_id: provider_id,
      number: mobile,
      amount: Number(amount)
    };

    // Determine API endpoint based on request type or default to /recharge
    let apiEndpoint = `${PAY2ALL_BASE_URL}/recharge`;
    if (endpoint_type === 'bill') {
      apiEndpoint = `${PAY2ALL_BASE_URL}/bill-pay`; // Agar bill payment ho toh endpoint adjust karein
    }

    console.log(`Sending payload to Pay2All (${apiEndpoint}):`, payload);

    const response = await axios.post(apiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${PAY2ALL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  } catch (error) {
    console.error("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "failure",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// Routes
app.post('/api/recharge', handleRecharge);
app.post('/recharge', handleRecharge);

app.get('/', (req, res) => {
  res.send("Pay2All Integration Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


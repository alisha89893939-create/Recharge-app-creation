app.post('/api/recharge', async (req, res) => {
  try {
    const { mobile, amount, operator } = req.body;
    console.log("Received request data:", { mobile, amount, operator });

    if (!mobile || !amount || !operator) {
      return res.status(400).json({ status: "FAIL", message: "Missing required fields" });
    }

    // Operator name ko clean aur lowercase karna
    const opKey = operator.toLowerCase().trim();
    let providerId = OPERATOR_IDS[opKey];

    // Agar direct match na ho toh check karein ki operator mein kya likha hai
    if (!providerId) {
      if (opKey.includes('jio')) providerId = 2;
      else if (opKey.includes('airtel')) providerId = 1;
      else if (opKey.includes('vi') || opKey.includes('vodafone')) providerId = 3;
      else if (opKey.includes('bsnl')) providerId = 4;
    }

    if (!providerId) {
      return res.status(400).json({ status: "FAIL", message: `Invalid operator specified: ${operator}` });
    }

    // Pay2All API payload structure
    const payload = {
      client_id: "1",
      provider_id: providerId,
      number: mobile,
      amount: Number(amount)
    };

    console.log("Sending payload to Pay2All:", payload);

    // Pay2All Live API Request
    const response = await axios.post(`${PAY2ALL_BASE_URL}/recharge`, payload, {
      headers: {
        "Authorization": `Bearer ${PAY2ALL_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    console.log("Pay2All Success Response:", response.data);
    return res.json(response.data);

  }chym catch (error) {
    console.log("Pay2All API Error Response:", error.response?.data || error.message);
    return res.status(500).json({
      status: "FAIL",
      message: error.response?.data?.message || error.message
    });
  }
});



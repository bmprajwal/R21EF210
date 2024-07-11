require("dotenv").config()
const express = require("express");
const router = express.Router();

const WINDOW_SIZE = 10;
let window = [];

router.get("/:numberid", async (req, res) => {
	const { numberid } = req.params;

	if (!["p", "f", "e", "r"].includes(numberid)) {
		return res.status(400).json({ error: "Invalid number ID" });
	}

	try {
		const response = await fetchNumbersFromTestServer(numberid);

		if (!response) {
			return res.status(500).json({ error: "Failed to fetch numbers" });
		}

		const numbers = response.data.numbers;
		updateWindow(numbers);

		const avg = calculateAverage(window);
		res.json({
			numbers,
			windowPrevState: window.slice(0, -numbers.length),
			windowCurrState: window,
			avg,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const fetchNumbersFromTestServer = async (numberid) => {
	const id = getId(numberid);
	const testServerUrl = `https://20.244.56.144/test/${id}`;
  console.log(process.env.AUTH_TOKEN);
	try {
		const response = await axios.get(testServerUrl, {
			headers: {
				Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
			},
			timeout: 500,
		});
		return response;
	} catch (error) {
		if (error.code === "ECONNABORTED") {
			console.error("Test server response took longer than 500 ms");
		}
		return null;
	}
};

const getId = (numberId) => {
	switch (numberId) {
		case "p":
			return "primes";
		case "f":
			return "fibo";
		case "e":
			return "even";
		case "r":
			return "random";
	}
};

const updateWindow = (numbers) => {
	for (let number of numbers) {
		if (!window.includes(number)) {
			window.push(number);
			if (window.length > WINDOW_SIZE) {
				window.shift();
			}
		}
	}
};

const calculateAverage = (numbers) => {
	const sum = numbers.reduce((acc, num) => acc + num, 0);
	return sum / numbers.length;
};

module.exports = router;


const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ordersFile = path.join(__dirname, 'orders.json');

// Product prices are controlled by the server
const products = {
    "Glow Face Serum": 599,
    "Beauty Moisturizer": 449,
    "Beauty Essentials": 799
};

// Receive customer orders
app.post('/api/orders', (req, res) => {
    const { name, email, address, items } = req.body;

    if (!name || !email || !address ||
        !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Please provide valid order details."
        });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
        const price = products[item.name];

        if (!price || !Number.isInteger(item.quantity) ||
            item.quantity < 1 || item.quantity > 100) {
            return res.status(400).json({
                message: "Invalid product or quantity."
            });
        }

        total += price * item.quantity;

        orderItems.push({
            name: item.name,
            price: price,
            quantity: item.quantity
        });
    }

    const order = {
        id: Date.now(),
        name,
        email,
        address,
        items: orderItems,
        total,
        createdAt: new Date().toISOString()
    };

    try {
        let orders = [];

        if (fs.existsSync(ordersFile)) {
            orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        }

        orders.push(order);

        fs.writeFileSync(
            ordersFile,
            JSON.stringify(orders, null, 2)
        );

        res.status(201).json({
            message: "Order successfully placed!",
            orderId: order.id,
            total: order.total
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not save your order."
        });
    }
});

app.listen(PORT, () => {
    console.log(`GlowBelle server running on port ${PORT}`);
});



let cart = JSON.parse(localStorage.getItem("glowBelleCart")) || [];

function addToCart(productName, price) {
    let existingProduct = cart.find(item => item.name === productName);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById("cart-items");
    let total = 0;
    let count = 0;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>₹${item.price}</span>
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    document.getElementById("cart-total").textContent =
        "Total: ₹" + total;

    document.getElementById("cart-count").textContent = count;
    localStorage.setItem("glowBelleCart", JSON.stringify(cart));
    document.getElementById("checkout-total").textContent =
    "Total: ₹" + total;
}

function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    displayCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    displayCart();
}

function clearCart() {
    cart = [];
    displayCart();
}

displayCart();


document.getElementById("checkout-form").addEventListener("submit", async function(event) {

    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("customer-name").value;
    const email = document.getElementById("customer-email").value;
    const address = document.getElementById("customer-address").value;

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                name,
                email,
                address,
                items: cart
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        document.getElementById("order-message").textContent =
            "Thank you, " + name +
            "! Your order #" + result.orderId +
            " has been received. Total: ₹" + result.total;

        cart = [];
        displayCart();

        document.getElementById("checkout-form").reset();

    } catch (error) {
        alert("Order failed: " + error.message);
        console.error(error);
    }
});



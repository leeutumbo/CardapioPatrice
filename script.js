// Seleção dos elementos pelo ID
const menu = document.getElementById("menu-hamburgers");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const spanItem = document.getElementById("data-span");

let cart = [];

// Evento para abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
    cartModal.style.display = "flex";
    displayCartItems();
    updateCartTotal();
});

// Evento para fechar o modal do carrinho ao clicar fora dele
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Evento para fechar o modal do carrinho ao clicar no botão de fechar
closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

// Evento para adicionar itens ao carrinho quando o botão é clicado
menu.addEventListener("click", function (event) {
    const parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        addItemToCart(name, price);
        updateCartCount();
        displayCartItems();
        checkCheckoutAvailability();
    }
});

// Função para adicionar itens ao carrinho
function addItemToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartTotal();
}

// Função para exibir itens no carrinho
function displayCartItems() {
    cartItemsContainer.innerHTML = "";
    cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("flex", "justify-between", "items-center", "mb-2");

        cartItem.innerHTML = `
            <span class="font-bold">${item.name}</span>
            <span class="font-bold">(${item.quantity})</span>
            <span>${(item.price * item.quantity).toFixed(2)} MZN</span>
            <div>
                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });
}

// Função para atualizar o total do carrinho
function updateCartTotal() {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2);
}

// Função para atualizar a contagem de itens no carrinho
function updateCartCount() {
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = itemCount;
}

// Função para verificar se o botão de checkout deve estar habilitado
function checkCheckoutAvailability() {
    const cartNotEmpty = cart.length > 0;
    checkoutBtn.disabled = !cartNotEmpty;
    checkoutBtn.classList.toggle("disabled", !cartNotEmpty);
}

// Evento para finalizar o pedido
checkoutBtn.addEventListener("click", function () {
    const address = addressInput.value.trim();

    if (cart.length === 0) {
        alert("Adicione itens ao carrinho antes de finalizar o pedido.");
        applyShakeAnimation(checkoutBtn);
        return;
    }

    if (!checkRestaurantOpen()) {
        Toastify({
            text: "O restaurante está fechado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "left",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    if (address === "") {
        showAddressWarning();
    } else {
        hideAddressWarning();
        sendOrderToWhatsApp(address);
        resetCart();
    }
});

// Função para enviar o pedido via WhatsApp
function sendOrderToWhatsApp(address) {
    const phone = "842024060"; // Número de telefone para onde enviar o pedido
    const cartItems = cart.map(item => `${item.name} - Quantidade: ${item.quantity} - Preço: ${(item.price * item.quantity).toFixed(2)} MZN`).join("\n");
    const message = `Pedido:\n${cartItems}\n\nTotal: ${cartTotal.textContent} MZN\n\nEndereço de entrega: ${address}`;
    const encodedMessage = encodeURIComponent(message);

    // URL modificada para abrir a mensagem pronta no WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, "_blank");
}

// Evento para remover item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemFromCart(name);
        displayCartItems();
        updateCartCount();
        checkCheckoutAvailability();
    }
});

// Evento para monitorar a digitação no campo de endereço
addressInput.addEventListener("input", function () {
    if (addressInput.value.trim() !== "") {
        hideAddressWarning();
    }
});

// Função para remover item do carrinho
function removeItemFromCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        const item = cart[index];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartTotal();
    }
    checkCheckoutAvailability();
}

// Função para verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpen = currentHour >= 8 && currentHour < 22;

    spanItem.textContent = isOpen ? "ABERTO" : "FECHADO";
    spanItem.classList.toggle("text-green-500", isOpen);
    spanItem.classList.toggle("text-red-500", !isOpen);

    return isOpen;
}

// Chamada para verificar o status de abertura do restaurante ao carregar a página
window.onload = checkRestaurantOpen;

// Função para mostrar aviso de endereço
function showAddressWarning() {
    addressWarn.style.display = "block";
    addressWarn.textContent = "Digite seu endereço completo!";
    addressInput.classList.add("border-red-500");
    applyShakeAnimation(addressInput);
}

// Função para esconder aviso de endereço
function hideAddressWarning() {
    addressWarn.style.display = "none";
    addressInput.classList.remove("border-red-500");
}

// Função para adicionar animação de shake
function applyShakeAnimation(element) {
    element.classList.add("shake");
    setTimeout(() => element.classList.remove("shake"), 500);
}

// Função para resetar o carrinho após o checkout
function resetCart() {
    cart = [];
    updateCartTotal();
    updateCartCount();
    cartItemsContainer.innerHTML = "";
    cartModal.style.display = "none";
    checkCheckoutAvailability();
}

// Função para adicionar animação de hover em botões
function addHoverAnimation(buttons) {
    buttons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            button.classList.add("hovered");
        });

        button.addEventListener("mouseleave", () => {
            button.classList.remove("hovered");
        });
    });
}

// Adiciona animação de hover aos botões de adicionar ao carrinho e checkout
addHoverAnimation(document.querySelectorAll(".add-to-cart-btn, #checkout-btn"));

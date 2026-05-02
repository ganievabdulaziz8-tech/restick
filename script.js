const menuData = [
  { id: "pizza", name: "Пицца Маргарита", price: 650, note: "Томатный соус, моцарелла, базилик" },
  { id: "paste", name: "Паста Карбонара", price: 540, note: "Бекон, сливочный соус, пармезан" },
  { id: "salad", name: "Цезарь с курицей", price: 490, note: "Романо, курица, фирменный соус" },
  { id: "soup", name: "Том Ям", price: 560, note: "Креветки, кокосовое молоко, лемонграсс" },
  { id: "burger", name: "Бургер BBQ", price: 470, note: "Мраморная говядина, соус BBQ" },
  { id: "dessert", name: "Чизкейк Нью-Йорк", price: 320, note: "Классический сливочный десерт" }
];

const menuList = document.getElementById("menuList");
const totalPriceNode = document.getElementById("totalPrice");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const deliveryForm = document.getElementById("deliveryForm");
const deliveryMessage = document.getElementById("deliveryMessage");

function renderMenu() {
  menuList.innerHTML = menuData
    .map(
      (item) => `
      <article class="menu-item">
        <div>
          <h4>${item.name}</h4>
          <p>${item.note}</p>
          <p><strong>${item.price} ₽</strong></p>
        </div>
        <label>
          <input type="checkbox" data-price="${item.price}" data-name="${item.name}" />
          В заказ
        </label>
      </article>
    `
    )
    .join("");
}

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function getSelectedItems() {
  return Array.from(menuList.querySelectorAll('input[type="checkbox"]:checked')).map((el) => ({
    name: el.dataset.name,
    price: Number(el.dataset.price)
  }));
}

function updateTotal() {
  const total = getSelectedItems().reduce((sum, item) => sum + item.price, 0);
  totalPriceNode.textContent = formatPrice(total);
}

function saveOrder(type, payload) {
  const storageKey = type === "booking" ? "restaurantBookings" : "restaurantDeliveryOrders";
  const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
  current.push({ ...payload, createdAt: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(current));
}

menuList.addEventListener("change", updateTotal);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const booking = Object.fromEntries(formData.entries());

  saveOrder("booking", booking);
  bookingMessage.textContent = `Бронь подтверждена, ${booking.name}! Ждем вас ${booking.date} в ${booking.time}.`;
  bookingMessage.style.color = "#0b7a37";
  bookingForm.reset();
});

deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedItems = getSelectedItems();

  if (selectedItems.length === 0) {
    deliveryMessage.textContent = "Выберите хотя бы одно блюдо из меню.";
    deliveryMessage.style.color = "#b42318";
    return;
  }

  const formData = new FormData(deliveryForm);
  const order = Object.fromEntries(formData.entries());
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  saveOrder("delivery", {
    ...order,
    items: selectedItems,
    total
  });

  deliveryMessage.textContent = `Заказ оформлен, ${order.name}! К оплате ${formatPrice(total)}.`;
  deliveryMessage.style.color = "#0b7a37";
  deliveryForm.reset();

  Array.from(menuList.querySelectorAll('input[type="checkbox"]')).forEach((el) => {
    el.checked = false;
  });
  updateTotal();
});

renderMenu();
updateTotal();

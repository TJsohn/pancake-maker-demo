function loadOrders() {
  console.log("Loading orders...");

  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) {
    console.error("ordersContainer element not found!");
    return;
  }
  ordersContainer.innerHTML = "";

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem("orders")) || [];
  } catch (error) {
    console.error("Error parsing orders from localStorage", error);
  }

  console.log("Orders from localStorage:", orders);

  if (!orders.length) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  const searchInput = document.getElementById("searchInput");
  const searchQuery = searchInput?.value?.trim().toLowerCase();

  const filteredOrders = searchQuery
    ? orders.filter((order) => {
        if (!order || !order.customerName) return false;
        const orderId = order.id?.toString() || "";
        const customerName = order.customerName?.toLowerCase() || "";
        return (
          orderId.includes(searchQuery) || customerName.includes(searchQuery)
        );
      })
    : orders;

  if (filteredOrders.length === 0) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  const sortedOrders = filteredOrders.sort((a, b) => {
    const statusOrder = { waiting: 0, ready: 1, delivered: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  sortedOrders.forEach((order) => {
    let orderCard = document.createElement("div");

    const orderStatus = order.status || "waiting";
    orderCard.className = `order-card ${orderStatus}`;

    const orderId = document.createElement("h2");
    orderId.textContent = `Order #${order.id}`;

    const customer = createParagraph("Customer", order.customerName);
    const pancake = createParagraph("Pancake", order.selectedPancake);
    const toppings = createParagraph(
      "Toppings",
      Array.isArray(order.toppings) ? order.toppings.join(", ") : order.toppings
    );
    const extras = createParagraph(
      "Extras",
      order.extras && Array.isArray(order.extras) && order.extras.length > 0
        ? order.extras.join(", ")
        : order.extras || "None"
    );

    const delivery = createParagraph("Delivery", order.deliveryMethod);
    const price = createParagraph("Price", `€${order.totalPrice}`);

    const statusContainer = document.createElement("p");
    const statusLabel = document.createElement("strong");
    statusLabel.textContent = "Status: ";
    const statusText = document.createElement("span");
    statusText.classList.add("status-text");
    statusText.textContent = order.status;
    statusContainer.appendChild(statusLabel);
    statusContainer.appendChild(statusText);

    const statusDropdown = document.createElement("select");
    statusDropdown.classList.add("status-dropdown");

    const statuses = ["waiting", "ready", "delivered"];
    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (order.status === status) option.selected = true;
      statusDropdown.appendChild(option);
    });

    statusDropdown.addEventListener("change", function () {
      updateOrderStatus(order.id, this.value, orderCard, statusText);
    });

    if (order.status === "delivered") {
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove Order";
      removeButton.classList.add("remove-button");
      removeButton.addEventListener("click", function () {
        removeOrder(order.id);
        ordersContainer.removeChild(orderCard);
      });
      orderCard.appendChild(removeButton);
    }

    orderCard.appendChild(orderId);
    orderCard.appendChild(customer);
    orderCard.appendChild(pancake);
    orderCard.appendChild(toppings);
    orderCard.appendChild(extras);
    orderCard.appendChild(delivery);
    orderCard.appendChild(price);
    orderCard.appendChild(statusContainer);
    orderCard.appendChild(statusDropdown);

    ordersContainer.appendChild(orderCard);
  });

  console.log("Orders loaded successfully.");
}

document.addEventListener("DOMContentLoaded", loadOrders);

document.getElementById("searchInput").addEventListener("input", loadOrders);

function createParagraph(label, value) {
  const p = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = label + ": ";
  p.appendChild(strong);
  p.appendChild(document.createTextNode(value));
  return p;
}

function updateOrderStatus(orderId, newStatus, orderCard, statusText) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  orders = orders.map((order) =>
    order.id === orderId ? { ...order, status: newStatus } : order
  );

  localStorage.setItem("orders", JSON.stringify(orders));

  statusText.textContent = newStatus;
  orderCard.className = `order-card ${newStatus}`;

  loadOrders();
}

function removeOrder(orderId) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const newOrders = orders.filter((order) => order.id !== orderId);
  localStorage.setItem("orders", JSON.stringify(newOrders));

  console.log("Order removed!");
  loadOrders();
}

// content load first time and cart in local storage
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (localStorage.getItem("product-in-cart")) {
    cart = JSON.parse(localStorage.getItem("product-in-cart"));
    cartDraw();
  }
});

//fetch all products
const fetchData = async () => {
  try {
    const res = await fetch("http://localhost:3001/api/products");
    const data = await res.json();
    productDraw(data);
    dataButtons(data);
  } catch (error) {
    console.log(error);
  }
};

//filter fetch
const search = () => {
  const input = document.getElementById("filterSearch").value; 
  
  if(input !== null){
    const filterData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/filter?category=${input}`
        );
        const data = await res.json();
        productDraw(data);
        dataButtons(data);
      } catch (error) {
        console.log(error);
      }
    };
    document.getElementById("filterSearch").value = "";
    return filterData();
  }else{
    document.getElementById("filterSearch").value = "";
     return fetchData();
  }
  
};

const productsContainer = document.querySelector("#product-container");
const productDraw = (data) => {
  productsContainer.innerHTML = "";
  const template = document.querySelector("#template-products").content;
  const fragment = document.createDocumentFragment();
  // console.log(template)
  data.forEach((product) => {
    // console.log(producto)
    template.querySelector("img").setAttribute("src", product.url_image);
    template.querySelector("h5").textContent = product.name;
    template.querySelector("p span").textContent = product.price;
    template.querySelector("button").dataset.id = product.id;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });
  productsContainer.appendChild(fragment);
};

let cart = {};

const dataButtons = (data) => {
  const buttons = document.querySelectorAll(".card button");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {      
      const product = data.find((item) => item.id === parseInt(btn.dataset.id));
      product.amount = 1;
      if (cart.hasOwnProperty(product.id)) {
        product.amount = cart[product.id].amount + 1;
      }
      cart[product.id] = { ...product };      
      cartDraw();
    });
  });
};

const items = document.querySelector("#items");
const cartDraw = () => { 
  items.innerHTML = "";
  const template = document.querySelector("#template-cart").content;
  const fragment = document.createDocumentFragment();

  Object.values(cart).forEach((product) => {    
    template.querySelector("th").textContent = product.id;
    template.querySelectorAll("td")[0].textContent = product.name;
    template.querySelectorAll("td")[1].textContent = product.amount;
    template.querySelector("span").textContent =
      product.price * product.amount;

    //buttons
    template.querySelector(".btn-info").dataset.id = product.id;
    template.querySelector(".btn-danger").dataset.id = product.id;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });

  items.appendChild(fragment);

  pintarFooter();
  buttonsAction();
  localStorage.setItem("product-in-cart", JSON.stringify(cart));
};

const footer = document.querySelector("#footer-cart");
const pintarFooter = () => {
  footer.innerHTML = "";

  if (Object.keys(cart).length === 0) {
    footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `;
    return;
  }

  const template = document.querySelector("#template-footer").content;
  const fragment = document.createDocumentFragment();

  // sumar amount y sumar totales
  const nAmount = Object.values(cart).reduce(
    (acc, { amount }) => acc + amount,
    0
  );
  const nPrecio = Object.values(cart).reduce(
    (acc, { amount, price }) => acc + amount * price,
    0
  );
  // console.log(nPrecio)

  template.querySelectorAll("td")[0].textContent = nAmount;
  template.querySelector("span").textContent = nPrecio;

  const clone = template.cloneNode(true);
  fragment.appendChild(clone);

  footer.appendChild(fragment);

  const boton = document.querySelector("#emptyCart");
  boton.addEventListener("click", () => {
    cart = {};
    cartDraw();
  });
};

const buttonsAction = () => {
  const addButton = document.querySelectorAll("#items .btn-info");
  const removeButton = document.querySelectorAll("#items .btn-danger");

  // console.log(botonesAgregar)

  addButton.forEach((btn) => {
    btn.addEventListener("click", () => {     
      const product = cart[btn.dataset.id];
      product.amount++;
      cart[btn.dataset.id] = { ...product };
      cartDraw();
    });
  });

  removeButton.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log('eliminando...')
      const product = cart[btn.dataset.id];
      product.amount--;
      if (product.amount === 0) {
        delete cart[btn.dataset.id];
      } else {
        cart[btn.dataset.id] = { ...product };
      }
      cartDraw();
    });
  });
};

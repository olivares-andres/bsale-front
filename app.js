document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    console.log(carrito);
    pintarCarrito();
  }
});

const fetchData = async () => {
  try {
    const res = await fetch("http://localhost:3001/api/products");
    const data = await res.json();
    pintarProductos(data);
    detectarBotones(data);
  } catch (error) {
    console.log(error);
  }
};

//fetch filtrado
const search = () =>{
  const input = document.getElementById("filterSearch").value
  console.log(input)
  const filterData = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/filter?category=${input}`);
      const data = await res.json();
      pintarProductos(data);
      detectarBotones(data);
    } catch (error) {
      console.log(error);
    }
  };
  return filterData()
}



const contendorProductos = document.querySelector("#contenedor-productos");
const pintarProductos = (data) => {
  contendorProductos.innerHTML = ""
  const template = document.querySelector("#template-productos").content;
  const fragment = document.createDocumentFragment();
  // console.log(template)
  data.forEach((producto) => {
    // console.log(producto)
    template.querySelector("img").setAttribute("src", producto.url_image);
    template.querySelector("h5").textContent = producto.name;
    template.querySelector("p span").textContent = producto.price;
    template.querySelector("button").dataset.id = producto.id;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });
  contendorProductos.appendChild(fragment);
};

let carrito = {};

const detectarBotones = (data) => {
  const botones = document.querySelectorAll(".card button");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log(btn.dataset.id)
      const producto = data.find(
        (item) => item.id === parseInt(btn.dataset.id)
      );
      producto.cantidad = 1;
      if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
      }
      carrito[producto.id] = { ...producto };
      // console.log('carrito', carrito)
      pintarCarrito();
    });
  });
};

const items = document.querySelector("#items");

const pintarCarrito = () => {
  //pendiente innerHTML
  items.innerHTML = "";

  const template = document.querySelector("#template-carrito").content;
  const fragment = document.createDocumentFragment();

  Object.values(carrito).forEach((producto) => {
    // console.log('producto', producto)
    template.querySelector("th").textContent = producto.id;
    template.querySelectorAll("td")[0].textContent = producto.name;
    template.querySelectorAll("td")[1].textContent = producto.cantidad;
    template.querySelector("span").textContent =
      producto.price * producto.cantidad;

    //botones
    template.querySelector(".btn-info").dataset.id = producto.id;
    template.querySelector(".btn-danger").dataset.id = producto.id;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });

  items.appendChild(fragment);

  pintarFooter();
  accionBotones();
  localStorage.setItem("carrito", JSON.stringify(carrito));
};

const footer = document.querySelector("#footer-carrito");
const pintarFooter = () => {
  footer.innerHTML = "";

  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `;
    return;
  }

  const template = document.querySelector("#template-footer").content;
  const fragment = document.createDocumentFragment();

  // sumar cantidad y sumar totales
  const nCantidad = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const nPrecio = Object.values(carrito).reduce(
    (acc, { cantidad, price }) => acc + cantidad * price,
    0
  );
  // console.log(nPrecio)

  template.querySelectorAll("td")[0].textContent = nCantidad;
  template.querySelector("span").textContent = nPrecio;

  const clone = template.cloneNode(true);
  fragment.appendChild(clone);

  footer.appendChild(fragment);

  const boton = document.querySelector("#vaciar-carrito");
  boton.addEventListener("click", () => {
    carrito = {};
    pintarCarrito();
  });
};

const accionBotones = () => {
  const botonesAgregar = document.querySelectorAll("#items .btn-info");
  const botonesEliminar = document.querySelectorAll("#items .btn-danger");

  // console.log(botonesAgregar)

  botonesAgregar.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log(btn.dataset.id)
      const producto = carrito[btn.dataset.id];
      producto.cantidad++;
      carrito[btn.dataset.id] = { ...producto };
      pintarCarrito();
    });
  });

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log('eliminando...')
      const producto = carrito[btn.dataset.id];
      producto.cantidad--;
      if (producto.cantidad === 0) {
        delete carrito[btn.dataset.id];
      } else {
        carrito[btn.dataset.id] = { ...producto };
      }
      pintarCarrito();
    });
  });
};

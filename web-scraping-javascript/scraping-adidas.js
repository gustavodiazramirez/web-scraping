const { chromium } = require("playwright");
const fs = require("fs"); // Importar el módulo fs

(async () => {
  // Lanzar navegador
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Función para hacer scroll hasta el fondo de la página
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 500;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
    });
  }

  let allShoes = [];
  let hasMorePages = true;
  let pageIndex = 0;
  const pageSize = 48;

  while (hasMorePages) {
    // Navegar a la página de Adidas con paginación
    const url = `https://www.adidas.cl/x?start=${pageIndex * pageSize}`;
    await page.goto(url);

    // Hacer scroll hasta el fondo para cargar todos los elementos
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await autoScroll(page);
      await page.waitForTimeout(2000); // Esperar un poco para que cargue más contenido
      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === previousHeight) break; // Si no hay más contenido, salir del bucle
    }

    // Esperar a que los elementos de las zapatillas se carguen
    await page.waitForSelector("p.glass-product-card__title");
    await page.waitForSelector("div.gl-price-item");
    await page.waitForSelector("div.gl-price-item.gl-price-item--sale.notranslate");
    await page.waitForSelector("p.glass-product-card__category");
    await page.waitForSelector("img.product-card-image.glass-product-card__image.performance-item.glass-product-card__primary-image");
    await page.waitForSelector("a.glass-product-card__assets-link");

    // Extraer los títulos de las zapatillas
    const shoeTitles = await page.$$eval(
      "p.glass-product-card__title",
      (elements) => elements.map((element) => element.innerText)
    );

    // Extraer los precios de las zapatillas
    const shoePrices = await page.$$eval(
      "div.gl-price-item, div.gl-price-item.gl-price-item--sale.notranslate",
      (elements) => elements.map((element) => element.innerText)
    );

    // Extraer los estados de agotamiento
    const outOfStockStatuses = await page.$$eval(
      "div.gl-price-item",
      (elements) => elements.map((element) => element.innerText.includes("agotado") ? "agotado" : "")
    );

    // Extraer las descripciones de las zapatillas
    const shoeDescriptions = await page.$$eval(
      "p.glass-product-card__category",
      (elements) => elements.map((element) => element.innerText)
    );

    // Extraer las imágenes de las zapatillas
    const shoeImages = await page.$$eval("img.product-card-image.glass-product-card__image.performance-item.glass-product-card__primary-image, img.product-card-image.glass-product-card__image.glass-product-card__primary-image, img.product-card-image.glass-product-card__image.glass-product-card__primary-image", (elements) =>
      elements.map((element) => element.src)
    );

    // Extraer las URL de las imágenes de las zapatillas
    const shoeUrl = await page.$$eval(
      "a.glass-product-card__assets-link",
      (elements) => elements.map((element) => element.href)
    );

    // Combinando los títulos, precios, descripciones y URL de imágenes en un solo objeto por zapatilla
    const shoes = shoeTitles.map((title, index) => ({
      marca: "Adidas",
      title,
      price: outOfStockStatuses[index] === "agotado" ? "Agotado" : (shoePrices[index] || "Sin precio"), // Manejar caso donde el precio podría faltar o estar agotado
      description: shoeDescriptions[index] || "Sin descripción", // Manejar caso donde la descripción podría faltar
      image: shoeImages[index] || "Sin imagen", // Manejar caso donde la imagen podría faltar
      brandLogo:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png",
      url: shoeUrl[index] || "Sin URL", // Manejar caso donde la URL podría faltar
    }));

    // Añadir zapatos extraídos a la lista general
    allShoes = allShoes.concat(shoes);

    // Verificar si hay más páginas
    const hasNextPage = await page.$(
      "a.gl-pagination__page-link.gl-pagination__page-link--next"
    );
    if (!hasNextPage) {
      hasMorePages = false;
    } else {
      pageIndex++;
    }
  }

  // Convertir el objeto a formato JSON
  const jsonContent = JSON.stringify(allShoes, null, 2);

  // Guardar el JSON en un archivo de texto en la carpeta actual
  fs.writeFileSync("shoes-info-adidas.json", jsonContent, "utf8");

  // Imprimir el contenido en la consola
  console.log("Información guardada en 'shoes-info-adidas.json'");

  // Cerrar navegador
  await browser.close();
})();

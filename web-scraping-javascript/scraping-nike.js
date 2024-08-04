const { chromium } = require("playwright");
const fs = require("fs"); // Importar el módulo fs

(async () => {
  // Lanzar navegador
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navegar a la página de Nike
  await page.goto("https://www.nike.cl/hombre/zapatillas/futbol");

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

  // Llamar a la función de auto-scroll hasta que no se carguen más elementos
  let previousHeight;
  while (true) {
    previousHeight = await page.evaluate("document.body.scrollHeight");
    await autoScroll(page);
    await page.waitForTimeout(4000); // Esperar un poco para que cargue más contenido
    let newHeight = await page.evaluate("document.body.scrollHeight");
    if (newHeight === previousHeight) break; // Si no hay más contenido, salir del bucle
  }

  // Esperar a que los elementos de las zapatillas se carguen
  await page.waitForSelector("span.vtex-product-summary-2-x-productBrand");
  await page.waitForSelector("div.vtex-flex-layout-0-x-flexColChild");
  await page.waitForSelector("div.nikecl-store-components-0-x-productSummaryDescriptionText");
  await page.waitForSelector("img.vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image");
  await page.waitForSelector("a.vtex-product-summary-2-x-clearLink.vtex-product-summary-2-x-clearLink--product-card.vtex-product-summary-2-x-clearLink--product-card--normal");

  // Extraer los títulos de las zapatillas
  const shoeTitles = await page.$$eval(
    "span.vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body",
    (elements) => elements.map((element) => element.innerText)
  );

  // Extraer los precios de las zapatillas
  const shoePrices = await page.$$eval(
    "div.vtex-flex-layout-0-x-flexColChild.vtex-flex-layout-0-x-flexColChild--selling-price-container.pb0",
    (elements) => elements.map((element) => element.innerText)
  );

  // Extraer las descripciones de las zapatillas
  const shoeDescriptions = await page.$$eval(
    "div.nikecl-store-components-0-x-productSummaryDescriptionText.c-muted-1",
    (elements) => elements.map((element) => element.innerText)
  );

  // Extraer las img de las imágenes de las zapatillas
  const shoeImages = await page.$$eval(
    "img.vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image",
    (elements) => elements.map((element) => element.src)
  );

  // Extraer las URL de las imágenes de las zapatillas
  const shoeUrl = await page.$$eval(
    "a.vtex-product-summary-2-x-clearLink.vtex-product-summary-2-x-clearLink--product-card.vtex-product-summary-2-x-clearLink--product-card--normal",
    (elements) => elements.map((element) => element.href)
  );
  // Combinando los títulos, precios y descripciones en un solo objeto por zapatilla
  const shoes = shoeTitles.map((title, index) => ({
    marca: "Nike",
    title,
    price: shoePrices[index] || "Sin precio", // Manejar caso donde el precio podría faltar
    description: shoeDescriptions[index] || "Sin descripción", // Manejar caso donde la descripción podría faltar
    image: shoeImages[index] || "Sin imagen", // Manejar caso donde la imagen podría faltar
    brandLogo:
      "https://i.pinimg.com/originals/96/fe/8b/96fe8be11b44e43f01b2bf325d4b35ad.jpg",
    url: shoeUrl[index] || "Sin url",
  }));

  // Convertir el objeto a formato JSON
  const jsonContent = JSON.stringify(shoes, null, 2);

  // Guardar el JSON en un archivo de texto en la carpeta actual
  fs.writeFileSync("shoes-info-nike.json", jsonContent, "utf8");

  // Imprimir el contenido en la consola
  console.log("Información guardada en 'shoes-info.txt'");

  // Cerrar navegador
  await browser.close();
})();

import React, { useState, useEffect } from "react";

interface Shoe {
  marca: string;
  title: string;
  price: string;
  description: string;
  image?: string; // Imagen opcional
  brandLogo?: string; // Logo de la marca opcional
  url?: string; // URL opcional del producto
}

const CardShoe = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [filteredShoes, setFilteredShoes] = useState<Shoe[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [selectedBrand, setSelectedBrand] = useState<string>("All"); // Estado para la marca seleccionada

  useEffect(() => {
    // Cargar los datos de Nike y Adidas
    const fetchData = async () => {
      try {
        const nikeResponse = await fetch("src/data/shoes-info-nike.json");
        if (!nikeResponse.ok)
          throw new Error("Network response was not ok for Nike");
        const nikeData: Shoe[] = await nikeResponse.json();

        const adidasResponse = await fetch("src/data/shoes-info-adidas.json");
        if (!adidasResponse.ok)
          throw new Error("Network response was not ok for Adidas");
        const adidasData: Shoe[] = await adidasResponse.json();

        // Combinar los datos de Nike y Adidas
        const combinedData = [...nikeData, ...adidasData];

        // Añadir el logo de la marca cuando no haya imagen
        const updatedData = combinedData.map((shoe) => ({
          ...shoe,
          image:
            shoe.image ||
            (shoe.marca === "Nike"
              ? "https://i.pinimg.com/originals/96/fe/8b/96fe8be11b44e43f01b2bf325d4b35ad.jpg"
              : shoe.marca === "Adidas"
              ? "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png"
              : undefined),
        }));

        setShoes(updatedData);
        setFilteredShoes(updatedData); // Inicialmente muestra todos los zapatos
      } catch (error) {
        console.error("Error al cargar los datos de las zapatillas", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrar y ordenar los zapatos según el término de búsqueda, el orden y la marca seleccionada
    const filterAndSortShoes = () => {
      let filtered = shoes.filter(
        (shoe) =>
          (selectedBrand === "All" || shoe.marca === selectedBrand) &&
          (shoe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shoe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shoe.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shoe.marca.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      filtered = filtered.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ""));
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });

      setFilteredShoes(filtered);
    };

    filterAndSortShoes();
  }, [searchTerm, sortOrder, shoes, selectedBrand]);

  return (
    <>
      <h1 className="text-white font-light text-5xl text-center p-16">
      Encuentra el mejor precio de zapatillas en el mercado
      </h1>
      <div className="w-full max-w-6xl flex flex-wrap justify-center lg:justify-start gap-0 lg:gap-4 xl:gap-4 p-4 mx-auto">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:w-auto p-2 border border-gray-300 rounded mb-4 lg:mb-0"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full lg:w-auto p-2 border border-gray-300 rounded mb-4 lg:mb-0"
        >
          <option value="asc">Menor a Mayor</option>
          <option value="desc">Mayor a Menor</option>
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full lg:w-auto p-2 border border-gray-300 rounded mb-4 lg:mb-0"
        >
          <option value="All">Todas las marcas</option>
          <option value="Nike">Nike</option>
          <option value="Adidas">Adidas</option>
        </select>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-6xl flex flex-wrap justify-center">
          {filteredShoes.map((shoe, index) => (
            <a
              key={index}
              href={shoe.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3 p-2"
            >
              <div className="h-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg bg-white flex flex-col transition-transform transform hover:scale-95 hover:shadow-xl">
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-center">
                    {shoe.image ? (
                      <img
                        className="w-full h-auto"
                        src={shoe.image}
                        alt={`${shoe.title} image`}
                      />
                    ) : (
                      <img
                        className="w-20 h-auto"
                        src={
                          shoe.brandLogo || "https://via.placeholder.com/150"
                        } // Imagen de logo por defecto si no hay marca
                        alt={`${shoe.marca} logo`}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xl mb-2 p-4">
                      {shoe.title}
                    </div>
                    <p className="text-gray-700 text-base px-4">
                      {shoe.description} {shoe.marca}
                    </p>
                    <p className="text-gray-900 text-lg font-bold p-4">
                      {shoe.price}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default CardShoe;

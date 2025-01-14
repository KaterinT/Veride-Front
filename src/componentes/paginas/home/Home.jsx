import { React, useState, useEffect, useContext } from "react";
import axios from "axios";
//import Vistaprodhome from "../../subComponentes/vistaprodhome/Vistaprodhome";
import NavBarHome from "../../subComponentes/navBar/NavBarHome";
import "./Home.scss";
import VPH from "../../subComponentes/vistaprodhome/VPH/VPH";
import Categorias from "../../subComponentes/categorias/Categorias";

//import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Footer from "../../subComponentes/footer/Footer";

import { SearchContext } from "../../../context/SearchContext";
import SliderInfinito from "../../subComponentes/sliderinfinito/SliderInfinito";


export default function Home({user}) {
  // mostrar CATEGORIAS desde la API
  const [categorias, setCategorias] = useState([]);
  const cargarCategorias = () => {
    axios
      .get("https://country-app-v3.herokuapp.com/categories")
      .then((data) => {
        //Data de Categorias al useState
        setCategorias(data.data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      window.location.pathname = "/inicio-sesion";
    }

    cargarCategorias();
  }, []);

  //mostrar PRODUCTOS y MAS VENDIDOS desde la API
  const [productos, setProductos] = useState([]);
  const [vendidos, setVendidos] = useState([]);


  //Almacena el contenido del CONTEXT en una CONSTANTE
  const searchContext = useContext(SearchContext);
  console.log(searchContext.query); // para pruebas del CONTEXT

  const [isContext, setIsContext] = useState([]);

  const cargarProductos = (e) => {
    axios
      .get("https://country-app-v3.herokuapp.com/api/v1/products")
      .then((data) => {
        data = data.data;

        //Filtrado con el input del BUSCADOR
        const searchResult = data && data.filter((item) => item.name.toLowerCase().includes(e.query));

        //Data de Productos al useState
        //setProductos(data.data);
        setProductos(searchResult);

      })
      .catch((error) => console.log(error));
  };

  const cargarVendidos = (e) => {

    if(!e.query){
      axios
      .get("https://country-app-v3.herokuapp.com/api/v1/products")
      .then((data) => {
        //Data de Mas Vendidos; lo cual, es un RANDOM de 10 de la Data de Productos
        var cont = 4;
        var shuffled = data.data.sort(function () {
          return 0.5 - Math.random();
        });
        var selected = shuffled.slice(0, cont);
        setVendidos(selected);
      })
      .catch((error) => console.log(error));
    }

  };

  useEffect(() => {
    cargarProductos(searchContext); // Todos los Productos
    cargarVendidos(searchContext); // Los Mas Vendidos - muestra de manera Random
    setIsContext(searchContext.query); // valor del CONTEXT al useState
  }, [searchContext]);

  // Filtrado por categoria
  const [selectedCategorias, setSelectedCategorias] = useState([]);

  return (
    <section className="section">
      <NavBarHome user={user}/>
      <SliderInfinito/>

      <article className={`article-destacados ${isContext ? "hidden" : ""}`}>
        <h2>Más Vendidos</h2>
        <div className="masVendidos">
          {" "}
          {/* container-destacados */}
          {vendidos.map((prod) => {
            return <VPH key={prod.id} prod={prod} categorias={categorias} />;
          })}
        </div>
      </article>

      <article className="article-categorias">
        <h2>Categorías</h2>
        <div className="container-categorias">
          {categorias.map((prod) => {
            return (
              <Categorias
                key={prod.id}
                prod={prod}
                setSelectedCategorias={setSelectedCategorias}
                selectedCategorias={selectedCategorias}
              />
            );
          })}
        </div>
      </article>

      <article className="article-productos">
        <h2>Todos los productos</h2>
        <div className="todosProductos">
          {" "}
          {/* container-productos */}
          {/* Filtros activados => muestra solo la(s) categoria(s) elegida(s) */}
          {selectedCategorias.length > 0 &&
            productos
              .filter((p) =>
                selectedCategorias.some((c) => c === p.category_id)
              )
              .map((prod) => {
                return (
                  <VPH key={prod.id} prod={prod} categorias={categorias} />
                );
              })}
          {/* Estado inicial => muestra todo */}
          {selectedCategorias.length === 0 &&
            productos.map((prod) => {
              return <VPH key={prod.id} prod={prod} categorias={categorias} />;
            })}
        </div>
      </article>
      <Footer />
    </section>
  );
}

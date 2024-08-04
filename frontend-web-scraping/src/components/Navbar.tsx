import React, { useEffect, useState, type PropsWithChildren } from "react";

const NavbarLandingPage = () => {
  useEffect(() => {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    menuToggle?.addEventListener("click", () => {
      mobileMenu?.classList.toggle("hidden");
    });
  }, []);

  return (
    <nav className="fixed top-0 w-full z-20">
      <div className="flex items-center justify-between px-4 lg:px-6 py-2 lg:py-4 bg-white shadow-md">
        <div className="flex items-center">
          <h1 className="text-lg pl-2 font-bold text-black">El mejor precio</h1>
        </div>
        <div className="hidden lg:flex items-center gap-8 font-extralight">
          <a href="/" className="nav-link">
            INICIO
          </a>
          <a href="/about-us" className="nav-link">
            ¿QUIÉNES SOMOS?
          </a>
          <a href="/contact" className="nav-link">
            CONTACTO
          </a>
        </div>
        <div className="flex items-center lg:hidden">
          <button id="menu-toggle" className="menu-toggle">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex items-center">
          <a href="/login" className="login-button">
            Inicio Sesión
          </a>
        </div>
      </div>
      <div className="lg:hidden px-4 bg-bgBlue shadow-md">
        <div id="mobile-menu" className="hidden">
          <a href="/" className="nav-link-mobile">
            Inicio
          </a>
          <a href="/about-us" className="nav-link-mobile">
            ¿Quiénes somos?
          </a>
          <a href="/contact" className="nav-link-mobile">
            Contacto
          </a>
          <a href="/inicio" className="nav-link-mobile">
            Inicio
          </a>
          <a href="/login" className="nav-link-mobile">
            Iniciar sesión
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLandingPage;

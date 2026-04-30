'use strict';

document.addEventListener("DOMContentLoaded", () => {

    let currentProducts = [];

    /* NAV MOBILE */
    const nav    = document.getElementById("nav");
    const toggle = document.getElementById("menu-toggle");

    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    /* AFFICHAGE PRODUITS */
    function displayProducts(list) {
        const container = document.getElementById("product");
        if (!container) return;

        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = "<p>Aucun produit trouvé.</p>";
            return;
        }

        list.forEach(p => {
            container.innerHTML += `
                <div class="card fade-in">
                    <img src="${p.image}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>${p.price.toLocaleString()} FCFA</p>
                    <a href="product.html?id=${p.id}" class="btn">Voir</a>
                </div>
            `;
        });

        initAnimation();
    }

    /* INIT PRODUITS */
    if (typeof products !== "undefined") {
        currentProducts = [...products];
        displayProducts(currentProducts);
    }

    /* FILTRE CATEGORIE */
    window.filterCategory = function(cat) {
        if (cat === "all") {
            currentProducts = [...products];
        } else {
            currentProducts = products.filter(p => p.category === cat);
        }
        displayProducts(currentProducts);
    };

    /* RECHERCHE */
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const value = this.value.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(value)
            );
            displayProducts(filtered);
        });
    }

    /* FILTRE PRIX */
    window.filterByPrice = function() {
        const select = document.getElementById("priceFilter").value;

        let filtered = [...products];

        if (select === "low")  filtered = products.filter(p => p.price < 100000);
        if (select === "mid")  filtered = products.filter(p => p.price >= 100000 && p.price <= 200000);
        if (select === "high") filtered = products.filter(p => p.price > 200000);

        displayProducts(filtered);
    };

    /* DETAIL PRODUIT */
    const params = new URLSearchParams(window.location.search);
    const id     = params.get("id");
    const detail = document.getElementById("productDetail");

    if (detail && id && typeof products !== "undefined") {
        const p = products.find(x => x.id == id);

        if (p) {
            const message = `Bonjour, je suis intéressé(e) par ${p.name} à ${p.price.toLocaleString()} FCFA`;
            const whatsappUrl = "https://api.whatsapp.com/send?phone=237652173188&text=" +
                encodeURIComponent(message);

            detail.innerHTML = `
                <div class="product-box">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="product-info">
                        <h2>${p.name}</h2>
                        <p>${p.description}</p>
                        <h3>${p.price.toLocaleString()} FCFA</h3>
                        <a class="btn" href="${whatsappUrl}" target="_blank">
                            Commander sur WhatsApp
                        </a>
                    </div>
                </div>
            `;
        } else {
            detail.innerHTML = "<p>Produit introuvable.</p>";
        }
    }

    /* ANIMATION FADE-IN */
    function initAnimation() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll(".fade-in").forEach(el => {
            observer.observe(el);
        });
    }

    initAnimation();
});

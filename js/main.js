'use strict';

document.addEventListener("DOMContentLoaded", () => {

    const PRODUCTS_PER_PAGE = 12;

    const state = {
        search: "",
        category: "all",
        price: "all",
        page: 1
    };

    /* ─── UTILITAIRES ───────────────────────────────────── */
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    function formatPrice(price) {
        return price > 0
            ? `${price.toLocaleString("fr-FR")} FCFA`
            : "Prix sur devis";
    }

    /* ─── NAV MOBILE ────────────────────────────────────── */
    const nav    = document.getElementById("nav");
    const toggle = document.getElementById("menu-toggle");

    if (toggle && nav) {
        toggle.setAttribute("aria-expanded", "false");

        toggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("active");
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.textContent = isOpen ? "✕" : "☰";
        });

        document.addEventListener("click", (e) => {
            if (nav.classList.contains("active") &&
                !nav.contains(e.target) &&
                !toggle.contains(e.target)) {
                nav.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
                toggle.textContent = "☰";
            }
        });
    }

    /* ─── CATALOGUE : uniquement si la page en a besoin ─── */
    const productContainer = document.getElementById("product");

    if (productContainer && typeof products !== "undefined") {

        function getFilteredProducts() {
            let list = [...products];

            if (state.category !== "all") {
                list = list.filter(p => p.category === state.category);
            }

            if (state.price !== "all") {
                // Les articles "sur devis" (prix = 0) ne sont pas comparables
                // à une fourchette de prix : on les exclut de ce filtre.
                list = list.filter(p => p.price > 0);
                if (state.price === "low")  list = list.filter(p => p.price < 200000);
                if (state.price === "mid")  list = list.filter(p => p.price >= 200000 && p.price <= 350000);
                if (state.price === "high") list = list.filter(p => p.price > 350000);
            }

            const q = state.search.trim().toLowerCase();
            if (q) {
                list = list.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                );
            }

            return list;
        }

        function displayProducts(list) {
            if (list.length === 0) {
                productContainer.innerHTML =
                    `<p class="empty-state">Aucun produit trouvé. Essayez une autre recherche ou réinitialisez les filtres.</p>`;
                return;
            }

            productContainer.innerHTML = list.map(p => `
                <div class="card fade-in">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    <h3>${p.name}</h3>
                    <p class="price ${p.price === 0 ? "price--quote" : ""}">${formatPrice(p.price)}</p>
                    <a href="product.html?id=${p.id}" class="btn">Voir</a>
                </div>
            `).join("");

            initAnimation();
        }

        function renderResultsCount(total) {
            const el = document.getElementById("resultsCount");
            if (!el) return;
            el.textContent = total > 0
                ? `${total} produit${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`
                : "";
        }

        function createPageButton(label, page, { disabled = false, isActive = false } = {}) {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.disabled = disabled;
            if (isActive) {
                btn.classList.add("active");
                btn.setAttribute("aria-current", "page");
            }
            btn.addEventListener("click", () => {
                state.page = page;
                render();
                productContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            return btn;
        }

        function renderPagination(totalItems) {
            const container = document.getElementById("pagination");
            if (!container) return;

            container.innerHTML = "";
            const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
            if (totalPages <= 1) return;

            container.appendChild(
                createPageButton("‹", state.page - 1, { disabled: state.page === 1 })
            );

            for (let i = 1; i <= totalPages; i++) {
                container.appendChild(
                    createPageButton(i, i, { isActive: i === state.page })
                );
            }

            container.appendChild(
                createPageButton("›", state.page + 1, { disabled: state.page === totalPages })
            );
        }

        function render() {
            const filtered = getFilteredProducts();
            const start = (state.page - 1) * PRODUCTS_PER_PAGE;
            const pageItems = filtered.slice(start, start + PRODUCTS_PER_PAGE);

            displayProducts(pageItems);
            renderResultsCount(filtered.length);
            renderPagination(filtered.length);
        }

        /* Filtres catégorie (boutons data-cat) */
        const filterButtons = document.querySelectorAll(".filter-btn");
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                state.category = btn.dataset.cat;
                state.page = 1;
                render();
            });
        });

        /* Filtre prix */
        const priceFilter = document.getElementById("priceFilter");
        if (priceFilter) {
            priceFilter.addEventListener("change", () => {
                state.price = priceFilter.value;
                state.page = 1;
                render();
            });
        }

        /* Recherche (avec debounce pour éviter de re-render à chaque frappe) */
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", debounce((e) => {
                state.search = e.target.value;
                state.page = 1;
                render();
            }, 250));
        }

        render();
    }

    /* ─── DETAIL PRODUIT ────────────────────────────────── */
    const params = new URLSearchParams(window.location.search);
    const id     = params.get("id");
    const detail = document.getElementById("productDetail");

    if (detail && id && typeof products !== "undefined") {
        const p = products.find(x => x.id == id);

        if (p) {
            // URL absolue de la photo : WhatsApp génère un aperçu miniature
            // automatiquement quand le message contient un lien direct vers une image.
            const imageUrl = new URL(p.image, window.location.href).href;

            const message =
                `Bonjour, je suis intéressé(e) par ce produit :\n` +
                `${p.name}` +
                (p.price > 0 ? ` - ${p.price.toLocaleString("fr-FR")} FCFA` : " - Prix sur devis") +
                `\n${imageUrl}`;

            const whatsappUrl = "https://api.whatsapp.com/send?phone=237652173188&text=" +
                encodeURIComponent(message);

            detail.innerHTML = `
                <div class="product-box">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="product-info">
                        <h2>${p.name}</h2>
                        <p>${p.description}</p>
                        <h3>${formatPrice(p.price)}</h3>
                        <a class="btn" href="${whatsappUrl}" target="_blank" rel="noopener">
                            Commander sur WhatsApp
                        </a>
                    </div>
                </div>
            `;
        } else {
            detail.innerHTML = "<p class=\"empty-state\">Produit introuvable.</p>";
        }
    }

    /* ─── ANIMATION FADE-IN ─────────────────────────────── */
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
// Numéro WhatsApp Business (Format international sans le +)
const MON_NUMERO = "237652173188"; 

// 1. Fonction d'envoi de commande WhatsApp
function commanderWhatsApp(nomProduit, prixProduit) {
    const message = `Bonjour MINISTER'S DEKO ! 🌟\nJe suis intéressé par le modèle suivant vu sur votre site :\n- *Produit* : ${nomProduit}\n- *Prix* : ${prixProduit}\n\nPouvons-nous discuter des dimensions et de la livraison ?`;
    const url = `https://wa.me/${MON_NUMERO}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// 2. Gestion du Menu Mobile
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => nav.classList.toggle('active'));
    }

    // 3. Recherche et Filtres Dynamiques du Catalogue
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    function filterProducts() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const activeCatBtn = document.querySelector('.filter-btn.active');
        const selectedCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const category = card.getAttribute('data-category');

            const matchSearch = title.includes(query);
            const matchCat = (selectedCat === 'all' || category === selectedCat);

            if (matchSearch && matchCat) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });
});
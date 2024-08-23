// Variable pour stocker tous les travaux
let allWorks = [];

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");

    // Récupérer les travaux (images)
    fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur HTTP ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            allWorks = data;
            afficherImages(data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
        });

    // Récupérer les catégories et créer les filtres
    fetch('http://localhost:5678/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur HTTP ' + response.status);
            }
            return response.json();
        })
        .then(categories => {
            const filtersContainer = document.querySelector('.filters');

            if (!token) { // Afficher les catégories uniquement si le token n'est pas présent
                filtersContainer.style.display = 'flex';
                filtersContainer.style.justifyContent = 'center';
                filtersContainer.style.margin = '40px 0';

                // Ajouter le bouton "Tous"
                const allButton = document.createElement('button');
                allButton.textContent = 'Tous';
                allButton.dataset.categoryId = 'all';
                allButton.classList.add('filter__btn');
                allButton.addEventListener('click', () => afficherImages(allWorks));
                filtersContainer.appendChild(allButton);

                // Ajouter des boutons pour chaque catégorie
                categories.forEach(category => {
                    const button = document.createElement('button');
                    button.textContent = category.name;
                    button.dataset.categoryId = category.id;
                    button.classList.add('filter__btn');
                    button.addEventListener('click', filterImages);
                    filtersContainer.appendChild(button);
                });
            } else {
                // Si le token est présent, supprimer les catégories
                filtersContainer.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des catégories :', error);
        });
});

// Fonction pour afficher les images
function afficherImages(images) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    images.forEach(work => {
        if (work.imageUrl) {
            const figure = document.createElement('figure');
            figure.dataset.categoryId = work.categoryId;
            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title || 'Image';

            const caption = document.createElement('figcaption');
            caption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(caption);
            gallery.appendChild(figure);
        } else {
            console.warn('Pas de URL d\'image pour:', work);
        }
    });
}

// Fonction pour filtrer les images
function filterImages(event) {
    const categoryId = event.target.dataset.categoryId;
    if (categoryId === 'all') {
        afficherImages(allWorks);
    } else {
        const filteredWorks = allWorks.filter(work => work.categoryId == categoryId);
        afficherImages(filteredWorks);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");

    // Gérer l'ouverture et la fermeture de la première modale
    const modale = document.getElementById("modale");
    const openModaleButton = document.querySelector(".js-modale");
    const closeButtons = document.querySelectorAll(".js-modale-close");

    if (token) {
        openModaleButton.addEventListener("click", (e) => {
            e.preventDefault();
            modale.style.display = "flex";
            modale.setAttribute("aria-hidden", "false");
            document.querySelector("body").style.overflow = "hidden";

            // Charger les travaux depuis l'API et les afficher dans la galerie photo
            fetch('http://localhost:5678/api/works')
                .then(response => response.json())
                .then(data => {
                    const photoGallery = document.querySelector('.photo-gallery');
                    photoGallery.innerHTML = ''; // Vider la galerie avant d'ajouter les travaux
                    data.forEach(work => {
                        addImageToGallery(work.imageUrl, work.title, work.id);
                    });
                })
                .catch(error => console.error('Erreur lors de la récupération des travaux :', error));
        });

        // Fermer la modale
        closeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                closeModale(modale);
            });
        });

        modale.addEventListener("click", (e) => {
            if (e.target === modale) {
                closeModale(modale);
            }
        });

        function closeModale(modale) {
            modale.style.display = "none";
            modale.setAttribute("aria-hidden", "true");
            document.querySelector("body").style.overflow = "auto";
        }
    }

    // Gérer l'ouverture, le remplissage, et la soumission du formulaire d'ajout de photo
    const openAddPhotoModaleButton = document.querySelector(".add-photo-btn");
    const addPhotoModale = document.getElementById("modale-add-photo");
    const uploadBtn = document.getElementById("upload-btn");
    const photoUploadInput = document.getElementById("file");
    const categorySelect = document.getElementById("category");
    const submitPhotoButton = document.getElementById("submit-photo");
    const titleInput = document.getElementById("title");

    // Ouvrir le sélecteur de fichier lorsque le bouton est cliqué
    uploadBtn.addEventListener("click", () => {
        photoUploadInput.click();
    });

    // Afficher l'image sélectionnée dans la section image-placeholder
    photoUploadInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            // Vérifiez que le fichier est bien une image
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner un fichier image.');
                return;
            }

            // Créez un objet URL pour l'image sélectionnée
            const imgURL = URL.createObjectURL(file);

            // Créez un élément <img> pour afficher l'image
            const imgElement = document.createElement('img');
            imgElement.src = imgURL;
            imgElement.alt = 'Image téléchargée';
            imgElement.style.maxWidth = '55%'; // S'adapte à la largeur du conteneur
            imgElement.style.maxHeight = '180px'; // Limite la hauteur de l'image
            imgElement.style.marginLeft = '118px'; // doit être placer au centtre de la section 
            imgElement.style.objectFit = 'cover'; // Assure que l'image couvre toute la zone définie en conservant ses proportions
            imgElement.style.overflow = 'hiden '; // Assure que les images sont coupées si elles dépassent les dimensions définies 

            // Récupérez la section image-placeholder
            const placeholder = document.querySelector('.image-placeholder');

            // Videz la section et ajoutez l'image
            placeholder.innerHTML = ''; // Supprime l'icône, le bouton et le texte d'aide
            placeholder.appendChild(imgElement);

            // Vérifier si tous les champs sont remplis
            checkFormCompletion();
        }
    });

    // Fonction pour vérifier si tous les champs sont remplis pour activer le bouton de soumission
    function checkFormCompletion() {
        if (photoUploadInput.files.length > 0 && titleInput.value.trim() !== '' && categorySelect.value !== '') {
            submitPhotoButton.disabled = false;
            submitPhotoButton.style.backgroundColor = '#1D6154'; // Changer la couleur du bouton
        } else {
            submitPhotoButton.disabled = true;
            submitPhotoButton.style.backgroundColor = ''; // Réinitialiser la couleur du bouton
        }
    }

    // Ajout d'écouteurs pour vérifier les changements dans les champs de texte et le sélecteur de catégorie
    titleInput.addEventListener('input', checkFormCompletion);
    categorySelect.addEventListener('change', checkFormCompletion);

    // Gérer la soumission du formulaire
    submitPhotoButton.addEventListener("click", (e) => {
        e.preventDefault();

        const file = photoUploadInput.files[0];
        const title = titleInput.value.trim();
        const categoryId = categorySelect.value;

        if (!file || !title || !categoryId) {
            alert("Veuillez remplir tous les champs !");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('category', categoryId);

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.id) {
                alert('Photo ajoutée avec succès !');
                addImageToGallery(data.imageUrl, title, data.id);  // Ajouter l'image à la galerie dynamiquement
                regenerateForm(); // Régénérer le formulaire après l'ajout de la photo
                closeModale(addPhotoModale);
            } else {
                alert('Erreur lors de l ajout de la photo.');
            }
        })
        .catch(error => console.error('Erreur lors de l ajout de la photo :', error));
    });

    // Fonction pour régénérer le formulaire
    function regenerateForm() {
        // Réinitialiser le formulaire
        document.getElementById('uploadForm').reset();

        // Vider la section image-placeholder
        const placeholder = document.querySelector('.image-placeholder');
        placeholder.innerHTML = `<i class="fa fa-image"></i>
                                 <div class="aj-ft-bt">
                                     <button class="upload-btn" id="upload-btn" type="button">+ Ajouter une photo</button>
                                 </div>
                                 <p class="help-text">jpg, png : 4mo max</p>`;

        // Réinitialiser l'état du bouton de soumission
        submitPhotoButton.disabled = true;
        submitPhotoButton.style.backgroundColor = '';

        // Réattacher l'événement de clic pour le nouveau bouton "Ajouter une photo"
        document.getElementById('upload-btn').addEventListener("click", () => {
            photoUploadInput.click();
        });
    }

    // Fonction pour ajouter l'image nouvellement ajoutée dans la galerie
    function addImageToGallery(imageUrl, title, id) {
        const photoGallery = document.querySelector('.photo-gallery');

        // Créez un nouvel élément pour le projet
        const photoItem = document.createElement('div');
        photoItem.classList.add('photo-item');

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = title || 'Image';
        photoItem.appendChild(imgElement);

        // Ajouter l'icône de suppression (si nécessaire)
        const deleteIcon = document.createElement('div');
        deleteIcon.classList.add('delete-icon');
        deleteIcon.innerHTML = '<i class="fa fa-trash"></i>';
        deleteIcon.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment supprimer cette image ?')) {
                // Supprimer l'image via l'API
                fetch(`http://localhost:5678/api/works/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem("token")}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        photoItem.remove(); // Retirer l'image de la galerie
                    } else {
                        alert('Erreur lors de la suppression de l image.');
                    }
                })
                .catch(error => console.error('Erreur lors de la suppression de l image :', error));
            }
        });
        photoItem.appendChild(deleteIcon);

        // Ajouter le nouvel élément à la galerie
        photoGallery.appendChild(photoItem);
    }

    function closeModale(modale) {
        modale.style.display = "none";
        modale.setAttribute("aria-hidden", "true");
        document.querySelector("body").style.overflow = "auto";
    }
});

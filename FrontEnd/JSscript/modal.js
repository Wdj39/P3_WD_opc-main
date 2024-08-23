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
                        const photoItem = document.createElement('div');
                        photoItem.classList.add('photo-item');

                        const imgElement = document.createElement('img');
                        imgElement.src = work.imageUrl;
                        imgElement.alt = work.title || 'Image';
                        photoItem.appendChild(imgElement);

                        // Ajouter l'icône de suppression
                        const deleteIcon = document.createElement('div');
                        deleteIcon.classList.add('delete-icon');
                        deleteIcon.innerHTML = '<i class="fa fa-trash"></i>';
                        deleteIcon.addEventListener('click', () => {
                            if (confirm('Voulez-vous vraiment supprimer cette image ?')) {
                                // Supprimer l'image via l'API
                                fetch(`http://localhost:5678/api/works/${work.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
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

                        photoGallery.appendChild(photoItem);
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
    const photoUploadInput = document.getElementById("photo-upload");
    const categorySelect = document.getElementById("photo-category");
    const submitPhotoButton = document.getElementById("submit-photo");

    if (openAddPhotoModaleButton) {
        openAddPhotoModaleButton.addEventListener("click", (e) => {
            e.preventDefault();
            addPhotoModale.style.display = "flex";
            addPhotoModale.setAttribute("aria-hidden", "false");
            document.querySelector("body").style.overflow = "hidden";

            // Charger les catégories depuis l'API
            fetch('http://localhost:5678/api/categories')
                .then(response => response.json())
                .then(categories => {
                    categorySelect.innerHTML = ''; // Vider le sélecteur avant d'ajouter des options
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
        });

        // Gérer la fermeture de la modale
        closeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                closeModale(addPhotoModale);
            });
        });

        addPhotoModale.addEventListener("click", (e) => {
            if (e.target === addPhotoModale) {
                closeModale(addPhotoModale);
            }
        });

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
                imgElement.style.maxWidth = '100%'; // S'adapte à la largeur du conteneur
                imgElement.style.maxHeight = '300px'; // Limite la hauteur de l'image

                // Récupérez la section image-placeholder
                const placeholder = document.querySelector('.image-placeholder');

                // Videz la section et ajoutez l'image
                placeholder.innerHTML = ''; // Supprime l'icône, le bouton et le texte d'aide
                placeholder.appendChild(imgElement);
            }
        });

        // Gérer la soumission du formulaire
        submitPhotoButton.addEventListener("click", () => {
            const file = photoUploadInput.files[0];
            const title = document.getElementById("photo-title").value;
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
            .then(response => {
                if (response.ok) {
                    alert('Photo ajoutée avec succès !');
                    closeModale(addPhotoModale);
                    // Vous pouvez également rafraîchir la galerie d'images ici si nécessaire
                } else {
                    alert('Erreur lors de l ajout de la photo.');
                }
            })
            .catch(error => console.error('Erreur lors de l ajout de la photo :', error));
        });
    }

    function closeModale(modale) {
        modale.style.display = "none";
        modale.setAttribute("aria-hidden", "true");
        document.querySelector("body").style.overflow = "auto";
    }
});
s
fetch('http://localhost:5678/api/works')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur HTTP ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log('Données récupérées :', data); // Log des données pour vérification
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    data.forEach(work => {
      if (work.imageUrl) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title || 'Image'; // Ajout d'un attribut alt pour l'accessibilité

        const caption = document.createElement('figcaption');
        caption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
      } else {
        console.warn('Pas de URL d\'image pour:', work); // Avertissement si l'image n'est pas trouvée
      }
    });
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des données :', error);
  });

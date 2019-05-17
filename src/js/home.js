console.log('hola mundo!');
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban";

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre;
}

function camelize(s) {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const getUserAll = new Promise((todoBien, todoMal) => {
  setTimeout(() => {
    todoBien('se acabo el tiempo 5');
    //todoMal('se acabo el tiempo');
  }, 5000);
});

const getUser = new Promise((todoBien, todoMal) => {
  setTimeout(() => {
    todoBien('se acabo el tiempo 3');
    //todoMal('se acabo el tiempo');
  }, 3000);
});

// getUser
//   .then(() => {
//     console.log('todo está bien en la vida');
//   })
//   .catch((message)=>{
//     console.log(message + ' todo mal :(');
//   });

//Promise.all([
Promise.race([
  getUser,
  getUserAll
])
  .then((message) => console.log(message))
  .catch((message) => {
    console.log(message);
  });

// $.ajax('https://randomuser.me/api/4545', {
//   method: 'GET',
//   success: function (data) {
//     console.log(data);
//   },
//   error: function (error) {
//     console.log(error);
//   }
// });

// fetch('https://randomuser.me/api/sdfsf')
//   .then(response => { return response.json() })
//   .then((user) => console.log(user))
//   .catch(() => console.log('algo fallo'));

(async function load() {
  async function getData(url, tipo) {
    const response = await fetch(url);
    const data = await response.json();
    switch (tipo) {
      case 'movie': {
        if (data.data.movie_count > 0) {
          return data;
        }
        //si no hay pelicula
        throw new Error('No se encontró ningún resultado');
      }
      default: {
        //playlist friends
        return data.results;
      }
    }
  }
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');

  const $featuringContainer = document.getElementById('featuring');

  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }
  const BASE_API = 'https://yts.am/api/v2/';
  const BASE_API_FRIENDS = 'https://randomuser.me/api/';

  function featuringTemplate(peli) {
    return (
      `<div class="featuring">
      <div class="featuring-image">
        <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">${peli.title}</p>
      </div>
    </div>
    `
    );
  }



  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    $featuringContainer.classList.remove('home-featuring-inactive');
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50
    });
    $featuringContainer.append($loader);

    const data = new FormData($form);
    //destructuracion peli.data.movies[0]
    try {
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`, 'movie');
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;

    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
      $featuringContainer.classList.add('home-featuring-inactive');
    }
  });

  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    );
  }

  function myPlaylistItemTemplate(movie) {
    return (`<li class="myPlaylist-item" data-id="${movie.id}">
    <a href="#">
      <span>
        ${movie.title_long}
      </span>
    </a>
  </li>`
    );
  }

  function friendItemTemplate(friend) {
    const name = capitalize(friend.name.title) + ' ' + capitalize(friend.name.first) + ' ' + capitalize(friend.name.last);
    return (
      `<li class="playlistFriends-item" data-uuid ="${friend.login.uuid}" >
        <a href="#" >
          <img src="${friend.picture.thumbnail}" alt="${name}" />
          <span>
           ${name}
          </span>
        </a>
      </li>
    `
    );
  }

  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function addEventClick($element, tipo) {
    $element.addEventListener('click', () => {
      switch (tipo) {
        case 'movie': {
          showModal($element);
        }
        default: {
          showModalFriend($element);
        }
      }
    });
  }

  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach(movie => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(movieElement, 'movie');
    });
  }

  function renderNewMovieList(list, $container) {
    $container.children[0].remove();
    list.forEach(movie => {
      const HTMLString = myPlaylistItemTemplate(movie);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      addEventClick(movieElement, 'movie');
    });
  }

  function renderPlaylistFriends(list, $container) {
    $container.children[0].remove();
    list.forEach(friend => {
      const HTMLString = friendItemTemplate(friend);
      const friendElement = createTemplate(HTMLString);
      $container.append(friendElement);
      const image = friendElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(friendElement, 'friend');
    });
  }


  let terrorList;
  getData(`${BASE_API}list_movies.json?genre=terror`, 'movie')
    .then((data) => {
      //console.log('terrorList', data);
      terrorList = data;
    });
  /*console.log('actionList', actionList);
  console.log('dramaList', dramaList);
  console.log('animationList', animationList);
  console.log('terrorList', terrorList);*/

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);
    if (cacheList) {
      return JSON.parse(cacheList);
    }
    const { data: { movies: list } } = await getData(`${BASE_API}list_movies.json?genre=${category}`, 'movie');
    window.localStorage.setItem(listName, JSON.stringify(list));
    return list;
  }

  // const { data: { movies: actionList } } = await getData(`${BASE_API}list_movies.json?genre=action`, 'movie');
  const actionList = await cacheExist('action');
  // window.localStorage.setItem('actionList', JSON.stringify(actionList));
  const $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, 'action');

  // const { data: { movies: dramaList } } = await getData(`${BASE_API}list_movies.json?genre=drama`, 'movie');
  const dramaList = await cacheExist('drama');
  // window.localStorage.setItem('dramaList', JSON.stringify(dramaList));
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  // const { data: { movies: animationList } } = await getData(`${BASE_API}list_movies.json?genre=animation`, 'movie');
  const animationList = await cacheExist('animation');
  // window.localStorage.setItem('animationList', JSON.stringify(animationList));
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');

  const { data: { movies: newMovieList } } = await getData(`${BASE_API}list_movies.json?query_term=2019&limit=9`, 'movie');
  window.localStorage.setItem('newMovieList', JSON.stringify(newMovieList));
  const $sidebarPlaylistContainer = document.getElementById('sidebarPlaylist');
  renderNewMovieList(newMovieList, $sidebarPlaylistContainer);

  //playlist de amigos
  const playlistfriendList = await getData(`${BASE_API_FRIENDS}?results=10`, 'friend');
  window.localStorage.setItem('playlistfriendList', JSON.stringify(playlistfriendList));
  const $playlistfriendContainer = document.getElementById('playlistFriends');
  renderPlaylistFriends(playlistfriendList, $playlistfriendContainer);

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');
  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findBydId(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10));
  }
  function findMovie(id, category) {
    switch (category) {
      case 'action': {
        return findBydId(actionList, id);
      }
      case 'drama': {
        return findBydId(dramaList, id);
      }
      case 'animation': {
        return findBydId(animationList, id);
      }
      default: {
        return findBydId(newMovieList, id);
      }
    }
  }

  function findFriend(uuid) {
    return playlistfriendList.find(friend => friend.login.uuid === uuid);
  }

  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const { id, category } = $element.dataset;
    const data = findMovie(id, category);
    /*const id = $element.dataset.id;
    const category = $element.dataset.category;*/
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;

  }

  function showModalFriend($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const { uuid } = $element.dataset;
    const friend = findFriend(uuid);
    $modalTitle.textContent = capitalize(friend.name.title) + ' ' + capitalize(friend.name.first) + ' ' + capitalize(friend.name.last);
    $modalImage.setAttribute('src', friend.picture.large);
    const description = `<strong>age: </strong> ${friend.dob.age}
                        <br><strong>email: </strong> ${friend.email}
                        <br><strong>state: </strong> ${friend.location.state}
                        <br><strong>city: </strong> ${friend.location.city}
                        <br><strong>street: </strong> ${friend.location.street}`;
    //const descriptionHTML = createTemplate(description);

    $modalDescription.innerHTML = description;

  }

  $hideModal.addEventListener('click', hideModal);
  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';

  }

})();
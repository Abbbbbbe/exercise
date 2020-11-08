// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = [] // 電影總清單
let filteredMovies = [] // 儲存符合篩選
const MOVIES_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const searchFoam = document.querySelector('#search-foam')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
// 增加觀看模式
const switchMode = document.querySelector('#switch-mode')
let page = 1
let displayMode = 1 // 1: card; 0: list


// function
// 觀看模式 function
function switchToListMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <table class="table">
        <tbody>
          <tr>
            <td>
              <h6 class="movie-name" data-id="${item.id}">${item.title}</h6>
            </td>
            <td class="d-flex justify-content-end">
              <button class="btn btn-primary btn-show-movie mr-2" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </td>
          </tr>
        </tbody>
      </table>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function switchToCardMode(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieList(data) {
  displayMode === 1 ? switchToCardMode(data) : switchToListMode(data)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    // console.log(data.description)
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  // console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 從 localStorage 取出電影，若無則回傳空陣列
  const movie = movies.find((movie) => movie.id === id) // 用 find 去電影總表找出與 id 相同的電影物件回傳，並存在 movie
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!') // some 用來檢查陣列裡有沒有 item 通過檢查並回傳布林值
  }
  list.push(movie) // 將找到的電影放入 list
  localStorage.setItem('favoriteMovies', JSON.stringify(list)) // 將更新後的 list 同步到 local storage
}

function getMoviesByPage(page) {
  // 計算起始 index
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 製作 template
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  // 放回HTML
  paginator.innerHTML = rawHTML
}

// 監聽卡片或清單模式
switchMode.addEventListener('click', function onSwitchModeClicked(event) {
  if (event.target.matches('.fa-th')) {
    displayMode = 1
    switchToCardMode(getMoviesByPage(page))
  } else if (event.target.matches('.fa-bars')) {
    displayMode = 0
    switchToListMode(getMoviesByPage(page))
  }
})

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽送出表單
searchFoam.addEventListener('submit', function onSearchFoamSubmitted(event) {
  event.preventDefault() // 避免頁面刷新
  // console.log('click')
  const keyword = searchInput.value.trim().toLowerCase() // 取得搜尋關鍵字
  // if (!keyword.length) {
  //   return alert('請輸入有效字串!')
  // } // 錯誤處理
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  ) // 條件篩選
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

// 監聽 paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 更新畫面
  renderMovieList(getMoviesByPage(page))
})

// let filteredMovies =[]
// for-of
// for (const movie of movies) {
//   if (movie.title.toLowerCase().includes(keyword)) {
//     filteredMovies.push(movie)
//   }
// }
// let numbers = [1, 2, 3, 4, 5, 6]
// function isLessThan3(number) {
//   return number < 3
// }
// console.log(numbers.filter(isLessThan3)) // [1,2] ，小於 3 的項目才會被保留

// axios
axios
  .get(INDEX_URL)
  .then((response) => {
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    movies.push(...response.data.results)
    // console.log(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

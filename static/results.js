const socket = io() 
document.addEventListener('DOMContentLoaded', ()=>{
  const position = ['st', 'nd', 'rd', 'th', 'th',]
  const comments = ['You Won !! Good Job', 'So close, yet so far!', 'Better luck next time!!', 'Better luck next time!!', 'Better luck next time!!']
    let onResult = true
    let filterResults = []
    function getCookieValue(cookieName) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Check if the cookie starts with the desired name
          if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1); // +1 to skip the equals sign
          }
        }
        return null; // Cookie not found
    }

    const userDetails = {
      roomName: `${getCookieValue('roomId')}`,
      userId: getCookieValue('userId'),
      name: getCookieValue('userName')
    }

    socket.emit('joinRoom', userDetails)
    socket.on('results', (results)=>{
      if(onResult == false){}else{
        if(results.length != 0){
          filterResults = results.filter((el)=> { return el.room == getCookieValue('roomId')})
          displayResults(filterResults)
        }else{
          document.querySelector('.main').innerHTML = ''
        }
      }
      onResult = false
    })
    function displayResults(results){
      console.log(results)
      document.querySelector('.loading').classList.add('remove')
      console.log(results)
      const myUser = results.find((el) => el.userId == getCookieValue('userId'))
      const myPosition = +results.indexOf(myUser) + 1
      console.log(myPosition)
      document.querySelector('.your-position h1').innerHTML = `${myPosition}${position[+myPosition - 1]} Place`
      if(+myPosition == results.length){
        document.querySelector('.your-position .comment').innerHTML = 'YOU LOST!!!'
      }else{
        document.querySelector('.your-position .comment').innerHTML = comments[+myPosition - 1]
      }
      displayPlayers(results)
    }

    function displayPlayers(results){
      const standings = document.querySelector('.standings-overflow')
      standings.innerHTML = ''
      results.forEach((element, index) => {
        const playerElem = `
          <div class="player player${index}">
            <div class="position">
                ${+index + 1}${position[index]}
            </div>
            <div class="name">
                <p>${element.userName}</p>
            </div>
          </div>
        `
        standings.innerHTML += playerElem
      });

      document.querySelectorAll('.player').forEach((player, index) => {
          console.log(player)
          if(results[index].length == 'undefined' || results[index].length == undefined){ }else{
            const playNo = `
              <div class="card-no">
                ${results[index].length}
              </div>    `
            player.innerHTML += playNo
          }
      })

    }
    document.querySelector('.restart-btn').addEventListener('click', ()=>{
      socket.emit('reset', getCookieValue('roomId'))
    })

    socket.on('restart', (reset)=>{
      location.href = `/restart/${reset}`
    })
})


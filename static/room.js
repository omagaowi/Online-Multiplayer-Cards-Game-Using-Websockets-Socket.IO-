  const socket = io()
import { myCardAllocation } from "./shuffle.js"
import { getMyStackCard, renderStandardCard, getUserCard } from "./components.js"
import { displaySpecialAlert } from "./specialAlerts.js"

// console.log(document.cookie)
const playersContainer = document.querySelector('.players-overflow')
const mineContainer = document.querySelector('.mine-overflow')
const generalCards = document.querySelector('.general-cards.pile')
// const timingAnimation = document.querySelector('.timer-animation')
const alertsElem = document.querySelector('.alerts')
document.addEventListener('DOMContentLoaded', ()=>{
    const powerCards = [1, 2, 5, 8, 14, 20]
    let usersList = []
    let startedList = []
    let roomQty
    let CardAllocation
    let myCards = []
    let generalPile = []
    let standardCard
    let turn
    let fullTurn
    let myIndex
    let hasEmitted = false
    let susOkay = false
  
    // let timer
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
    function convertSentenceCase(sentence){
      const newSentence = sentence.split('').map((el, index)=>{
        if(index == 0){
          return el.toUpperCase()
        }else{
          return el.toLowerCase()
        }
      }).join('')
      return newSentence
    }
    const roomName = getCookieValue('roomId')
    const userName = getCookieValue('userName')
    const userId = getCookieValue('userId')
    const userDetails = {
      name: userName,
      userId: userId,
      roomName: roomName
    }

    if(roomName == 'undefined' || document.cookie == '' || roomName == null){
        location.href = '/'
        console.log('un')
    }else{
      document.querySelector('.error-bg').classList.add('show')
        socket.on('hasStarted', (hasStarted)=>{
            console.log(hasStarted)
            startedList = hasStarted
        })
        socket.on('userLength', (users)=>{
          roomQty = users.filter(function(el){return el.room == getCookieValue('roomId')}).length
          console.log(roomQty)
        })
        
        console.log(startedList)
        setTimeout(()=>{;
          if(startedList.includes(roomName) || roomQty >= 5){
            // document.querySelector('.sus-window').classList.remove('show')
            if(roomQty >= 5){
              console.log('nope')
              document.querySelector('.error-window').classList.add('show')
              document.querySelector('.loading-window').classList.add('remove')
              document.querySelector('.error-window h3').innerHTML = 'This game is full'
            }else{
               document.querySelector('.error-window').classList.add('show')
              document.querySelector('.loading-window').classList.add('remove')
              document.querySelector('.error-window h3').innerHTML = 'This game is started.'
            }
          }else{
            document.querySelector('.error-bg').classList.remove('show')
            document.querySelector('.room-id').classList.add('show')
            document.querySelector('.room-id p').innerHTML = `room${roomName}`
             document.querySelector(".room-id").dataset.roomId = roomName
            socket.emit('joinRoom', userDetails)
            socket.on('users', (users)=>{
              console.log(users)
              usersList = users.users.filter((el)=> {return el.room == roomName})
              const adminName = usersList[0].userName          
              document.title = `${convertSentenceCase(adminName)}'s Playroom`
              myIndex = usersList.indexOf(usersList.find(el => el.userId == userId))
              if(myIndex == 0){
                document.querySelector('.startBtn').classList.remove('hide')
                document.querySelector('.endGame').classList.remove('hide')
              }else{
                document.querySelector('.startBtn').classList.add('hide')
                document.querySelector('.endGame').classList.add('hide')
              }
              alertsElem.classList.add(users.joinAction)
              if(usersList.indexOf(usersList.find(el => el.userId == users.concern.userId)) == myIndex){
                alertsElem.classList.add('reveal')
                alertsElem.innerHTML =`<span class="join-name">you</span> ${users.joinAction}!`
                setTimeout(function(){ 
                  alertsElem.classList.remove('reveal')
                  alertsElem.classList.remove('joined')
                  alertsElem.classList.remove('left')
              }, 2000)
              }else{
                alertsElem.classList.add('reveal')
                alertsElem.innerHTML =`<span class="join-name">${users.concern.userName}</span> ${users.joinAction}!`
                setTimeout(function(){ 
                  alertsElem.classList.remove('reveal')
                  alertsElem.classList.remove('joined')
                  alertsElem.classList.remove('left')
              }, 2000)
              }

              // console.log(newName)
              renderUsers(users.users)
              document.querySelectorAll('.player-card').forEach((card, index) => {
                if(index == myIndex){
                  card.classList.add('you')
                }else{
                  card.classList.remove('you')
                }
              })
              document.querySelectorAll('.mobile-name').forEach((card, index) => {
                if(index == myIndex){
                  card.classList.add('you')
                }else{
                  card.classList.remove('you')
                }
              })
            })
            socket.on('user-finished', (emitUsers)=>{
              // console.log('finn', emitUsers)
              usersList = emitUsers.users.filter((el)=> {return el.room == roomName})
              const stillUsers = usersList.filter(function(el){return el.finished == false})
              alert(`${emitUsers.concern.userName} has check up!`)
              if(stillUsers.length <= 1){
                document.querySelector('.error-bg').classList.add('show')
                document.querySelector('.loading-window').classList.remove('remove')
                setTimeout(function(){
                  alertsElem.classList.add('reveal')
                  alertsElem.innerHTML = 'The game has ended!'
                  setTimeout(function(){
                    if(stillUsers[0] == usersList[myIndex]){
                      socket.emit('last-one', stillUsers[0])
                      setTimeout(function(){
                        location.href = '/results'
                      }, 700)
                    }else{
                      setTimeout(function(){
                        location.href = '/results'
                      }, 700)
                    }
                  }, 1000)
              }, 1300)
              }else{
                renderUsers(emitUsers.users)
                document.querySelectorAll('.player-card').forEach((card, index) => {
                  if(index == myIndex){
                    card.classList.add('you')
                  }else{
                    card.classList.remove('you')
                  }
                })
                document.querySelectorAll('.mobile-name').forEach((card, index) => {
                  if(index == myIndex){
                    card.classList.add('you')
                  }else{
                    card.classList.remove('you')
                  }
                })
              }
            })
            socket.on('game-end', (end)=>{
              alertsElem.innerHTML = 'pile is exausted, GAME OVER !!'
              document.querySelector('.error-bg').classList.add('show')
              document.querySelector('.loading-window').classList.remove('remove')
              setTimeout(function(){
                location.href = '/results'
              }, 1000)
            })
            document.querySelector('.startBtn').addEventListener('click', ()=>{
              console.log('start')
              if(usersList.length < 2){
                document.querySelector('.small-errors h3').innerHTML = 'At least 2 players are required to start a game'
                document.querySelector('.small-errors').classList.add('show')
                setTimeout(()=>{
                  document.querySelector('.small-errors').classList.remove('show')
                }, 1500)
              }else{
                socket.emit('startGame', roomName)
                document.querySelector('.small-errors').classList.remove('show')
              }
            })
            socket.on('shuffle', (cards)=>{
              window.onbeforeunload = function() { return "Your work will be lost."; };
              window.history.pushState(null, "", window.location.href)
              window.onpopstate = function (){
                window.history.pushState(null, "", window.location.href)
                // console.log('disable')
              }
              document.querySelector('.startBtn').classList.add('inactive')
              myIndex = usersList.indexOf(usersList.find(el => el.userId == userId))
             const noOfUsers = usersList.length
              console.log(cards)
              CardAllocation = myCardAllocation(noOfUsers, +myIndex + 1, cards)
              myStack(CardAllocation)
              standardCard = CardAllocation.standardCard
              generalPile = CardAllocation.generalPile
              let standardDigit = +generalPile.length - 1
              setStandardCard(standardCard, standardDigit)


             document.querySelector('.endGame').addEventListener('click', ()=>{
                document.querySelector('.error-bg').classList.add('show')
                document.querySelector('.loading-window').classList.add('remove')
                document.querySelector('.error-window').classList.remove('show')
                document.querySelector('.leave-window').classList.add('show')
          
                document.querySelector('.leave-window .close').addEventListener('click', ()=>{
                  document.querySelector('.error-bg').classList.remove('show')
                  document.querySelector('.leave-window').classList.remove('show')
                })
          
                document.querySelector('.leave-window button').addEventListener('click', ()=>{
                  document.querySelector('.loading-window').classList.remove('remove')
                  document.querySelector('.leave-window').classList.remove('show')
                  setTimeout(function(){
                    socket.emit('endGame', roomName)
                  }, 1000)
                })
          
              })
            })
          }
        }, 3000)
    }

    socket.on('ended', (endGame)=>{
      document.querySelector('.error-bg').classList.add('show')
      document.querySelector('.loading-window').classList.remove('remove')
      alertsElem.classList.remove('reveal')
      setTimeout(function(){ alertsElem.classList.add('reveal')}, 300)
      alertsElem.innerHTML = 'The game been ended !'
      setTimeout(function(){
        location.href = '/ended'
      }, 2000)
    })

    socket.on('next-turn', (onTurn)=>{
      // timingAnimation.classList.remove('animate')
      // clearTimeout(timer)
      fullTurn = onTurn
      // console.log(fullTurn)
      turn = onTurn.gameTurn
      standardCard = onTurn.myCard
      console.log(standardCard)
      document.querySelector('.general-cards.standard').innerHTML = renderStandardCard(standardCard)
      console.log('next')
      alertsElem.classList.remove('reveal')
      alertsElem.classList.remove('player0')
      alertsElem.classList.remove('player1')
      alertsElem.classList.remove('player2')
      alertsElem.classList.remove('player3')
      alertsElem.classList.remove('player4')
      alertsElem.classList.remove('pending')
      
      setTimeout(function(){
          document.querySelector(".full-loader").classList.remove("show");
        checkGameTurn(turn, myIndex) 
        alertsElem.classList.add(`player${turn}`)
      }, 500)
      // setTimeout(function(){}, 400)
    })

    function renderUsers(players){
      playersContainer.innerHTML = ''
      document.querySelector('.mobile-overflow').innerHTML = ''
      players = players.filter(function(el){return el.room == getCookieValue('roomId')})
      players.forEach((player, index) => {
        const userCard = getUserCard(player, index)
        playersContainer.innerHTML += userCard;
      });
      document.querySelector('.mobile-bar span').innerHTML = players.length
      players.forEach((player, index)=>{
        if(players.indexOf(player) == myIndex){
            const userCard = `
              <div class="mobile-name player${index} you">
                  <div class="mobile-p-name">
                      <p>${player.userName}</p>
                  </div>
                  <div class="card-qty">
                      0
                  </div>
              </div>
            `
            document.querySelector('.mobile-overflow').innerHTML += userCard
        }else{
          const userCard = `
            <div class="mobile-name player${index} other">
              <p>${player.userName}</p>
            </div>
          `
          document.querySelector('.mobile-overflow').innerHTML += userCard
        }
      })
    }

    function setStandardCard(standardCardP, standardDigit){
      console.log(standardCardP)
      if(powerCards.includes(standardCardP.number) || standardCardP.shape == 'WHOT'){
        generalPile.push(standardCardP)
        standardDigit -= 1;
        generalPile.splice(standardDigit, 1)
        standardCard = generalPile[standardDigit - 1]
        console.log(standardDigit)
        setStandardCard(standardCard, standardDigit)
      }else{
        console.log('standard')
        document.querySelector('.general-cards.standard').innerHTML = renderStandardCard(standardCard)
        console.log('pre-turn', turn)
        turn = 0;
        console.log('turn check', turn)
          fullTurn = {
           myCard: standardCard,
           roomName: getCookieValue("roomId"),
           player: 0,
           gameTurn: turn,
           special: null,
         };

        // console.log(standardCard)
        alertsElem.classList.add(`player${turn}`)
        checkGameTurn(turn, myIndex)
      }
    }

    function myStack(CardAllocation){
      // console.log(CardAllocation)
      mineContainer.innerHTML = ''
      myCards = CardAllocation.stack
      myCards.forEach((mine, index)=>{
        const myCard = getMyStackCard(mine, index)
        mineContainer.innerHTML += myCard
      })
    }


    function checkGameTurn(turn, myIndex){
        document.querySelector(".full-loader").classList.remove("show");
      if(turn >= usersList.length){
        document.querySelector('.small-errors h3').innerHTML = 'An Error Occured! A turn may be skipped'
        document.querySelector('.small-errors').classList.add('show')
        setTimeout(()=>{
          document.querySelector('.small-errors').classList.remove('show')
        }, 1500)
        console.log('false')
        if(myIndex == 1){
          turn = 0;
          console.log('turn check', turn);
          const playInfo = {
            myCard: standardCard,
            roomName: getCookieValue('roomId'),
            player: fullTurn.player,
            gameTurn: turn,
            special: null
          }
          document.querySelector('.full-loader').classList.add('show')
          socket.emit('change-turn', playInfo)
        }
      }
      displaySpecialAlert(turn, myIndex, fullTurn, usersList)
      document.querySelector('.demand-bg').classList.remove('show')
      document.querySelector('.player-card.you .card-qty').innerHTML = myCards.length
      document.querySelector('.mobile-name.you .card-qty').innerHTML = myCards.length
      // timingAnimation.classList.add('animate')
      alertsElem.classList.add('reveal')

      document.querySelectorAll('.player-card').forEach((card, playerInd)=>{
        if(playerInd == turn){
          card.classList.add('my-turn')
        }else{
          card.classList.remove('my-turn')
        }

        card.addEventListener('click', ()=>{
          document.querySelectorAll('.player-card').forEach((card, playerInd)=>{
            card.classList.remove('my-turn')
          })
        })
      })

      document.querySelectorAll('.mobile-name').forEach((card, playerInd)=>{
        if(playerInd == turn){
          card.classList.add('my-turn')
        }else{
          card.classList.remove('my-turn')
        }
      })

      document.querySelector('.pile-qty').innerHTML = generalPile.length
        generalCards.querySelector('p').innerHTML = `Tap to pick one`
        if(standardCard.action == 'pile' && !fullTurn.genInit){
          // console.log('pile')
          console.log('p1')
          generalPile.pop()
          document.querySelector('.pile-qty').innerHTML = generalPile.length
          console.log(generalPile)
          alertsElem.innerHTML = `<span class="join-name">${fullTurn.player}</span> picked one`
          setTimeout(function(){ 
            if(turn == myIndex){
              alertsElem.innerHTML = `<span class="join-name">your</span> turn!`
            }else{
              alertsElem.innerHTML = `<span class="join-name">${usersList[turn].userName}'s</span> turn!`
            }
          }, 1100)
          generalCards.classList.add('shake')
          setTimeout(function(){ generalCards.classList.remove('shake')}, 500)
        }else if(standardCard.action == 'pile 2'){
          console.log('p2')
          generalPile.pop()
          generalPile.pop()
          document.querySelector('.pile-qty').innerHTML = generalPile.length
          console.log(generalPile)
          alertsElem.innerHTML = `<span class="join-name">${fullTurn.player}</span> picked two`
          setTimeout(function(){ 
            if(turn == myIndex){
              alertsElem.innerHTML = `<span class="join-name">your</span> turn!`
            }else{
              alertsElem.innerHTML = `<span class="join-name">${usersList[turn].userName}'s</span> turn!`
            }
          }, 1100)
          generalCards.classList.add('shake')
          setTimeout(function(){ generalCards.classList.remove('shake')}, 500)
        }else if(standardCard.action == 'pile 3'){
          console.log('p3')
          generalPile.pop()
          generalPile.pop()
          generalPile.pop()
          document.querySelector('.pile-qty').innerHTML = generalPile.length
          console.log(generalPile)
          alertsElem.innerHTML = `<span class="join-name">${fullTurn.player}</span> picked three`
          setTimeout(function(){ 
            if(turn == myIndex){
              alertsElem.innerHTML = `<span class="join-name">your</span> turn!`
            }else{
              alertsElem.innerHTML = `<span class="join-name">${usersList[turn].userName}'s</span> turn!`
            }
          }, 1100)
          generalCards.classList.add('shake')
          setTimeout(function(){ generalCards.classList.remove('shake')}, 500)
        }else{
          if(turn == myIndex){
            alertsElem.innerHTML = `<span class="join-name">your</span> turn!`
          }else{
            alertsElem.innerHTML = `<span class="join-name">${usersList[turn].userName}'s</span> turn!`
          }
        }

        if(turn == myIndex){
          console.log(usersList)
          if(usersList[myIndex].finished == true){
            if(usersList.length - myIndex <= 1){
              console.log('pre-turn', turn)
              turn = 0;
              console.log('turn check', turn);
              const playInfo = {
                myCard: standardCard,
                roomName: getCookieValue('roomId'),
                player: fullTurn.player,
                gameTurn: turn,
                special: null
              }
                document.querySelector(".full-loader").classList.add("show");
              socket.emit('change-turn', playInfo)
            }else{
              console.log('pre turn', turn)
              turn ++;
              console.log('check turn error', turn)
              const playInfo = {
                myCard: standardCard,
                roomName: getCookieValue('roomId'),
                player:  fullTurn.player,
                gameTurn: turn,
                special: null
              }
                document.querySelector(".full-loader").classList.add("show");
              socket.emit('change-turn', playInfo)
            }
          }else{
            hasEmitted = true
            susOkay = true
              if (standardCard.action == 'suspension'){
                const susAct = standardCard.action
                alert(`${fullTurn.player} you on ${susAct}`)
                    if(usersList.length - myIndex <= 1){
                      console.log('pre-turn', turn)
                      console.log(susOkay)
                      if(susOkay == true){
                        turn = 0;
                        console.log('turn check', turn);
                        standardCard.action = null
                        const playInfo = {
                          myCard: standardCard,
                          roomName: getCookieValue('roomId'),
                          player: getCookieValue('userName'),
                          gameTurn: turn,
                          special: null
                        }
                          document.querySelector('.full-loader').classList.add('show')
                        socket.emit('change-turn', playInfo)
                        susOkay = false
                        document.querySelector('.error-bg').classList.remove('show')
                        document.querySelector('.sus-window').classList.remove('show')
                      }else{
                       
                      }
                    }else{
                      console.log('pre turn', turn)
                      console.log('okay 1', susOkay)
                        console.log('okay 3', susOkay)
                        turn ++;
                        console.log('check turn error', turn)
                        standardCard.action = null
                        const playInfo = {
                          myCard: standardCard,
                          roomName: getCookieValue('roomId'),
                          player: getCookieValue('userName'),
                          gameTurn: turn,
                          special: null
                        }
                          document.querySelector('.full-loader').classList.add('show')
                        socket.emit('change-turn', playInfo)
                        console.log('emit')
                        susOkay = false
                        document.querySelector('.error-bg').classList.remove('show')
                        document.querySelector('.sus-window').classList.remove('show')
                        console.log(susOkay)
                    }
                // alert(`${fullTurn.player} put you on ${susAct}`)
              }else if(standardCard.action == 'hold on'){
                    const susAct = standardCard.action;
                    alert(`${fullTurn.player} you on ${susAct}`);
                    if (myIndex == 0) {
                      console.log("pre-turn", turn);
                      console.log(susOkay);
                      if (susOkay == true) {
                        turn = usersList.length - 1;
                        console.log("turn check", turn);
                        standardCard.action = null;
                        const playInfo = {
                          myCard: standardCard,
                          roomName: getCookieValue("roomId"),
                          player: getCookieValue("userName"),
                          gameTurn: turn,
                          special: null,
                        };
                        socket.emit("change-turn", playInfo);
                        susOkay = false;
                        document
                          .querySelector(".error-bg")
                          .classList.remove("show");
                        document
                          .querySelector(".sus-window")
                          .classList.remove("show");
                      } else {
                      }
                    } else {
                      console.log("pre turn", turn);
                      console.log("okay 1", susOkay);
                      console.log("okay 3", susOkay);
                      turn = myIndex - 1;
                      console.log("check turn error", turn);
                      standardCard.action = null;
                      const playInfo = {
                        myCard: standardCard,
                        roomName: getCookieValue("roomId"),
                        player: getCookieValue("userName"),
                        gameTurn: turn,
                        special: null,
                      };
                      socket.emit("change-turn", playInfo);
                      console.log("emit");
                      susOkay = false;
                      document
                        .querySelector(".error-bg")
                        .classList.remove("show");
                      document
                        .querySelector(".sus-window")
                        .classList.remove("show");
                      console.log(susOkay);
                    }
              }
              else if (standardCard.demand != null){
                setTimeout(function(){
                  alertsElem.innerHTML = `${fullTurn.player} demands for ${standardCard.demand}`
                  alertsElem.classList.add('pending')
                }, 600)
              }
              console.log(turn)

              if (fullTurn.genInit || standardCard.action == 'go gen'){
                setTimeout(function(){
                  alertsElem.innerHTML = 'go gen'
                  alertsElem.classList.add('pending')
                }, 600)
                generalCards.classList.add('demandpend')
                generalCards.querySelector('p').innerHTML = `Tap to pick one`
                document.querySelectorAll('.mine-overflow .my-card').forEach(card => {
                  card.classList.add('disable')
                })
              }else if(standardCard.action == 'pick 2' || standardCard.action == 'pick 3'){
                  setTimeout(function(){
                  alertsElem.innerHTML = standardCard.action
                  alertsElem.classList.add('pending')
                }, 600)
                generalCards.classList.remove('demandpend')
                document.querySelectorAll('.mine-overflow .my-card').forEach(card => {
                  card.classList.remove('disable')
                })
                generalCards.querySelector('p').innerHTML = `Tap to ${standardCard.action}`
              }else{
                generalCards.classList.remove('demandpend')
                document.querySelectorAll('.mine-overflow .my-card').forEach(card => {
                  card.classList.remove('disable')
                })
              }
          }
        // alertsElem.innerHTML = `<span class="join-name">your</span> turn!`
          console.log(myCards)
          const allMyCards = document.querySelectorAll('.mine-overflow .my-card')
          console.log('my turn')
          allMyCards.forEach((card, index)=>{
            // card.classList.remove('disable')
            card.addEventListener('click', ()=>{
              const theCard = myCards.find(el => el.id == card.dataset.id)
              // console.log(theCard)
              if(theCard == 'undefined' || undefined){
                console.log('ERROR FINDING CARD')
              }else{
                if(myCards.length == 1){
                  if(powerCards.includes(theCard.number)){
                    console.log('cannnot checkup with a power card!')
                    alert('cannot check up with a power card!')
                  }else{
                    //check up
                    const isCheckUp = true
                    cardTrueEvent(index, isCheckUp, theCard)
                  }
                }else{
                  //not last card
                  const isCheckUp = false
                  cardTrueEvent(index, isCheckUp, theCard)
                }
              }
            })
          })
        }else{
          generalCards.classList.remove('demandpend')
          hasEmitted = false
          console.log('not my turn')
          alertsElem.classList.add('reveal')
          alertsElem.classList.add(`player${turn}`)
          console.log('turnn', turn)
          alertsElem.innerHTML = `<span class="join-name">${usersList[turn].userName}'s</span> turn!`
          socket.on('lastCard', (details)=>{
              
            if(details.index == myIndex){
                 document.querySelector(".special-alerts").innerHTML = `<span>YOU</span> are on your last card`;
            }else{
              document.querySelector(".special-alerts").innerHTML = `<span>${details.name}</span> is on last card`;
            }
            document.querySelector('.special-alerts').classList.add('reveal')
            setTimeout(()=>{
                document.querySelector('.special-alerts').classList.remove('reveal')
             }, 3500)
          })
          const allMyCards = document.querySelectorAll('.mine-overflow .my-card')
          allMyCards.forEach((card, index)=>{
            card.classList.add('disable')
          })
        }
    }

    function cardTrueEvent(index, isCheckUp, theCard){
      if(standardCard.demand != null){
        console.log('demand')
        if(theCard.shape == standardCard.demand){
          document.querySelectorAll('.mine-overflow .my-card').forEach(card => {
            card.classList.add('disable')
          })
          console.log('true')
          if(usersList.length - myIndex <= 1){
            // console.log('pre-turn', turn)
            turn = 0;
            // console.log('turn check', turn)
             if(theCard.action =='go gen'){
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
            }else{
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
            }
          }else{
            turn ++;
            console.log('check turn error', turn)
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          }
        }else if(theCard.demand == 'demand1'){
          const demandNo = 'demand1'
          demandLogic(index, demandNo)
        }else if(theCard.demand == 'demand2'){
          const demandNo = 'demand2'
          demandLogic(index, demandNo)
        }else if(theCard.demand == 'demand3'){
          const demandNo = 'demand3'
          demandLogic(index, demandNo)
        }else if(theCard.demand == 'demand4'){
          const demandNo = 'demand4'
          demandLogic(index, demandNo)
        }else if(theCard.demand == 'demand5'){
          const demandNo = 'demand5'
          demandLogic(index, demandNo)
        }
        else{
        console.log('false')
      }
      }else if (standardCard.action == "pick 2") {
        if (theCard.action == "pick 3" || theCard.action == "pick 2" || theCard.action == 'go gen') {
          if (usersList.length -  myIndex <= 1) {
            console.log("pre-turn", turn);
            turn = 0;
            console.log("turn check", turn);
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          } else {
            console.log("pre turn", turn);
            turn++;
            console.log("check turn error", turn);
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          }
        }
      } else if (standardCard.action == "pick 3") {
        if (theCard.action == "pick 3" || theCard.action == 'go gen') {
          if (usersList.length - myIndex <= 1) {
            console.log("pre-turn", turn);
            turn = 0;
            console.log("turn check", turn);
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          } else {
            console.log("pre turn", turn);
            turn++;
            console.log("check turn error", turn);
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          }
        }
      } else {
        console.log("no demand");
        if (
          theCard.number == standardCard.number ||
          theCard.shape == standardCard.shape
        ) {
          console.log("true");
          document.querySelectorAll(".mine-overflow .my-card").forEach((card) => {
              card.classList.add("disable");
            });
          if (usersList.length - myIndex <= 1) {
            console.log("pre-turn", turn);
            turn = 0;
            console.log("turn check", turn);
            if(theCard.action =='go gen'){
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
            }else{
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: usersList.length - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
            }
          } else {
            console.log("pre turn", turn);
            turn++;
            console.log("check turn error", turn);
             if (theCard.action == "go gen") {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 genInit: myIndex,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             } else {
               const playInfo = {
                 myCard: theCard,
                 roomName: getCookieValue("roomId"),
                 player: getCookieValue("userName"),
                 gameTurn: turn,
                 special: powerCards.includes(theCard.number)
                   ? {
                       reciver: turn,
                       action: standardCard.action,
                       giver: turn - 1,
                     }
                   : null,
               };
               myCards = myCards.filter(function (el) {
                 return el != theCard;
               });
               mineContainer.innerHTML = "";
               myCards.forEach((mine, mIndex) => {
                 const myCard = getMyStackCard(mine, mIndex);
                 mineContainer.innerHTML += myCard;
               });
               // playInfo.myCard.action = 'pick 2'
               checkLastCard(myCards);
               if (isCheckUp == true) {
                 document
                   .querySelector(".section.mine")
                   .classList.add("check-up");
                 socket.emit("change-turn", playInfo);
                 socket.emit("i-finished", usersList[myIndex]);
                 alertsElem.classList.remove(`player${turn}`);
               } else {
                 // socket.emit('i-finished', usersList[myIndex])
                 // socket.emit('last-pile', roomName)
                 socket.emit("change-turn", playInfo);
                 alertsElem.classList.remove(`player${turn}`);
               }
             }
          }
        } else if (theCard.demand == "demand1") {
          const demandNo = "demand1";
          demandLogic(index, demandNo);
        } else if (theCard.demand == "demand2") {
          const demandNo = "demand2";
          demandLogic(index, demandNo);
        } else if (theCard.demand == "demand3") {
          const demandNo = "demand3";
          demandLogic(index, demandNo);
        } else if (theCard.demand == "demand4") {
          const demandNo = "demand4";
          demandLogic(index, demandNo);
        } else if (theCard.demand == "demand5") {
          const demandNo = "demand5";
          demandLogic(index, demandNo);
        } else {
          console.log("false");
        }
      }
    }

    function checkLastCard(cards){
      // console.log(cards)
      if(cards.length == 1){
        console.log('last card')
        const lastEmit = {
          index: myIndex,
          name: userName,
          room: roomName
        }
        socket.emit('last-card', lastEmit)
        return true
      }else{
        return false
      }
    }
  
    function demandLogic(index, demandNo){
      console.log(hasEmitted)
      console.log('indeo', index)
      console.log('has', hasEmitted)
        document.querySelector('.demand-bg').classList.add('show')
        document.querySelectorAll('.demand-shape').forEach((demandShape) => {
          demandShape.addEventListener('click', ()=>{
            if(usersList.length - myIndex <= 1){
                  console.log('pre-turn', turn)
                  console.log('turn check', turn)
                  const trueShape = demandShape.dataset.shape
                    console.log(trueShape)
                    console.log('indoe', index)
                    console.log(demandNo)
                    const specificCard = myCards.find(el => el.demand == demandNo)
                    if(specificCard != undefined){
                      if(hasEmitted == true){
                          turn = 0  
                           specificCard.demand = trueShape;
                           const playInfo = {
                             myCard: specificCard,
                             roomName: getCookieValue('roomId'),
                             player: getCookieValue('userName'),
                             gameTurn: turn,
                             special: null
                           }
                           myCards = myCards.filter((el) => {return el.demand != trueShape})
                           mineContainer.innerHTML = ''
                           myCards.forEach((mine, index)=>{
                             const myCard = getMyStackCard(mine, index)
                             mineContainer.innerHTML += myCard
                           })
                           document.querySelector('.demand-bg').classList.remove('show')
                             document.querySelector('.full-loader').classList.add('show')
                         socket.emit('change-turn', playInfo)
                         alertsElem.classList.remove(`player${turn}`)
                         hasEmitted = false
                      }
                   }
                    
            }else{
                  console.log('pre turn', turn)
                    const trueShape = demandShape.dataset.shape
                    console.log(demandNo)
                    console.log('index', index)
                    const specificCard = myCards.find(el => el.demand == demandNo)
                    console.log(specificCard)
                    if(specificCard != undefined){
                       if(hasEmitted == true){
                            turn ++
                            specificCard.demand = trueShape;
                            const playInfo = {
                              myCard: specificCard,
                              roomName: getCookieValue('roomId'),
                              player: getCookieValue('userName'),
                              gameTurn: turn,
                              special: null
                            }
                            myCards = myCards.filter((el) => {return el.demand != trueShape})
                            mineContainer.innerHTML = ''
                            myCards.forEach((mine, index)=>{
                              const myCard = getMyStackCard(mine, index)
                              mineContainer.innerHTML += myCard
                            })
                            document.querySelector('.demand-bg').classList.remove('show')
                              document.querySelector('.full-loader').classList.add('show')
                          socket.emit('change-turn', playInfo)
                          alertsElem.classList.remove(`player${turn}`)
                          hasEmitted = false
                       }
                    }
              }
  
          })
        })         
    }

    generalCards.addEventListener('click', ()=>{
      console.log('general')
      if(turn == myIndex){
        generalCards.classList.add('shake')
        setTimeout(function(){ generalCards.classList.remove('shake')}, 500)
        if(standardCard.action == 'pick 2'){
          if(generalPile.length <= 2){
            // myCards.push(generalPile[+generalPile.length - 1])
            // myCards.push(generalPile[+generalPile.length - 2])
            // generalPile.pop()
            // generalPile.pop()
            for (let index = 1; index <= generalPile.length; index++) {
              myCards.push(generalPile[+generalPile.length - index])
              generalPile.pop()
            }
            document.querySelector('.pile-qty').innerHTML = generalPile.length
            console.log(generalPile)
            mineContainer.innerHTML = ''
            myCards.forEach((mine, index)=>{
              const myCard = getMyStackCard(mine, index)
              mineContainer.innerHTML += myCard
            })
            socket.emit('last-pile', roomName)
          }else{
            console.log('pick 2')
            if(usersList.length - myIndex <= 1){
              console.log('pre-turn', turn)
              turn = 0;
              console.log('turn check', turn)
              myCards.push(generalPile[+generalPile.length - 1])
              myCards.push(generalPile[+generalPile.length - 2])
              // generalPile.pop()
              // generalPile.pop()
              document.querySelector('.pile-qty').innerHTML = generalPile.length
              console.log(generalPile)
              mineContainer.innerHTML = ''
              myCards.forEach((mine, index)=>{
                const myCard = getMyStackCard(mine, index)
                mineContainer.innerHTML += myCard
              })
              const playInfo = {
                myCard: standardCard,
                roomName: getCookieValue('roomId'),
                player: getCookieValue('userName'),
                gameTurn: turn,
                special: null
              }
              playInfo.myCard.action = 'pile 2'
                document.querySelector(".full-loader").classList.add("show");
              socket.emit('change-turn', playInfo)
              alertsElem.classList.remove(`player${turn}`)
              }else{
                console.log('pre turn', turn)
                turn ++;
                console.log('check turn error', turn)
                  myCards.push(generalPile[+generalPile.length - 1])
                  myCards.push(generalPile[+generalPile.length - 2])
                  // generalPile.pop()
                  // generalPile.pop()
                  document.querySelector('.pile-qty').innerHTML = generalPile.length
                  console.log(generalPile)
                  mineContainer.innerHTML = ''
                  myCards.forEach((mine, index)=>{
                    const myCard = getMyStackCard(mine, index)
                    mineContainer.innerHTML += myCard
                  })
                  const playInfo = {
                    myCard: standardCard,
                    roomName: getCookieValue('roomId'),
                    player: getCookieValue('userName'),
                    gameTurn: turn,
                    special: null
                  }
                  playInfo.myCard.action = 'pile 2'
                    document.querySelector('.full-loader').classList.add('show')
                  socket.emit('change-turn', playInfo)
                  alertsElem.classList.remove(`player${turn}`)
                  // console.log('general')
              }    
          }
         

        }else if(standardCard.action == 'pick 3'){
          console.log('pick 3')
          if(generalPile.length <= 3){
              for (let index = 1; index <= generalPile.length; index++) {
                myCards.push(generalPile[+generalPile.length - index])
                generalPile.pop()
              }
              document.querySelector('.pile-qty').innerHTML = generalPile.length
              console.log(generalPile)
              mineContainer.innerHTML = ''
              myCards.forEach((mine, index)=>{
                const myCard = getMyStackCard(mine, index)
                mineContainer.innerHTML += myCard
              })
              socket.emit('last-pile', roomName)
          }else{
            if(usersList.length - myIndex <= 1){
              console.log('pre-turn', turn)
              turn = 0;
              console.log('turn check', turn)
              myCards.push(generalPile[+generalPile.length - 1])
              myCards.push(generalPile[+generalPile.length - 2])
              myCards.push(generalPile[+generalPile.length - 3])
              // generalPile.pop()
              // generalPile.pop()
              // generalPile.pop()
              document.querySelector('.pile-qty').innerHTML = generalPile.length
              console.log(generalPile)
              mineContainer.innerHTML = ''
              myCards.forEach((mine, index)=>{
                const myCard = getMyStackCard(mine, index)
                mineContainer.innerHTML += myCard
              })
              const playInfo = {
                myCard: standardCard,
                roomName: getCookieValue('roomId'),
                player: getCookieValue('userName'),
                gameTurn: turn,
                special: null
              }
              playInfo.myCard.action = 'pile 3'
                document.querySelector(".full-loader").classList.add("show");
              socket.emit('change-turn', playInfo)
              alertsElem.classList.remove(`player${turn}`)
              }else{
                console.log('pre turn', turn)
                turn ++;
                console.log('check turn error', turn)
                  myCards.push(generalPile[+generalPile.length - 1])
                  myCards.push(generalPile[+generalPile.length - 2])
                  myCards.push(generalPile[+generalPile.length - 3])
                  // generalPile.pop()
                  // generalPile.pop()
                  // generalPile.pop()
                  document.querySelector('.pile-qty').innerHTML = generalPile.length
                  console.log(generalPile)
                  mineContainer.innerHTML = ''
                  myCards.forEach((mine, index)=>{
                    const myCard = getMyStackCard(mine, index)
                    mineContainer.innerHTML += myCard
                  })
                  const playInfo = {
                    myCard: standardCard,
                    roomName: getCookieValue('roomId'),
                    player: getCookieValue('userName'),
                    gameTurn: turn,
                    special: null
                  }
                  playInfo.myCard.action = 'pile 3'
                    document.querySelector('.full-loader').classList.add('show')
                  socket.emit('change-turn', playInfo)
                  alertsElem.classList.remove(`player${turn}`)
                  // console.log('general')
              }
          }

        }else if(standardCard.action == 'demand'){
          if(generalPile.length <= 1){
            myCards.push(generalPile[+generalPile.length - 1])
            generalPile.pop()
            console.log(generalPile)
            mineContainer.innerHTML = ''
            myCards.forEach((mine, index)=>{
              const myCard = getMyStackCard(mine, index)
              mineContainer.innerHTML += myCard
            })
            socket.emit('last-pile', roomName)
          }else{
            if(usersList.length - myIndex <= 1){
              console.log('pre-turn', turn)
              turn = 0;
              console.log('turn check', turn)
              myCards.push(generalPile[+generalPile.length - 1])
              // generalPile.pop()
              document.querySelector('.pile-qty').innerHTML = generalPile.length
              console.log(generalPile)
              mineContainer.innerHTML = ''
              myCards.forEach((mine, index)=>{
                const myCard = getMyStackCard(mine, index)
                mineContainer.innerHTML += myCard
              })
              const playInfo = {
                myCard: standardCard,
                roomName: getCookieValue('roomId'),
                player: getCookieValue('userName'),
                gameTurn: turn,
                special: null
              }
              playInfo.myCard.action = 'pile'
                document.querySelector(".full-loader").classList.add("show");
              socket.emit('change-turn', playInfo)
              alertsElem.classList.remove(`player${turn}`)
              }else{
                console.log('pre turn', turn)
                turn ++;
                console.log('check turn error', turn)
                  myCards.push(generalPile[+generalPile.length - 1])
                  // generalPile.pop()
                  document.querySelector('.pile-qty').innerHTML = generalPile.length
                  // console.log(generalPile)
                  mineContainer.innerHTML = ''
                  myCards.forEach((mine, index)=>{
                    const myCard = getMyStackCard(mine, index)
                    mineContainer.innerHTML += myCard
                  })
                  const playInfo = {
                    myCard: standardCard,
                    roomName: getCookieValue('roomId'),
                    player: getCookieValue('userName'),
                    gameTurn: turn,
                    special: null
                  }
                  playInfo.myCard.action = 'pile'
                    document.querySelector('.full-loader').classList.add('show')
                  socket.emit('change-turn', playInfo)
                  alertsElem.classList.remove(`player${turn}`)
                  // console.log('general')
              }
          }
        }else{
          if(generalPile.length <= 1){
            myCards.push(generalPile[+generalPile.length - 1])
            generalPile.pop()
            console.log(generalPile)
            mineContainer.innerHTML = ''
            myCards.forEach((mine, index)=>{
              const myCard = getMyStackCard(mine, index)
              mineContainer.innerHTML += myCard
            })
            socket.emit('last-pile', roomName)
          }else{
            if(fullTurn.genInit){
              const goGen = true
              goGenAction(goGen)
            }else{
              const goGen = false
              goGenAction(goGen)
            }
            
          }
        }  
      }
    })

    function goGenAction(goGen){
      if (usersList.length - myIndex <= 1) {
        console.log("pre-turn", turn);
        turn = 0;
        console.log("turn check", turn);
        myCards.push(generalPile[+generalPile.length - 1]);
        // generalPile.pop()
        document.querySelector(".pile-qty").innerHTML = generalPile.length;
        console.log(generalPile);
        mineContainer.innerHTML = "";
        myCards.forEach((mine, index) => {
          const myCard = getMyStackCard(mine, index);
          mineContainer.innerHTML += myCard;
        });
        if(fullTurn.genInit == 0){
          const playInfo = {
            myCard: standardCard,
            roomName: getCookieValue("roomId"),
            player: getCookieValue("userName"),
            gameTurn: turn,
            special: null,
          };
          playInfo.myCard.action = "pile";
          socket.emit("change-turn", playInfo);
          alertsElem.classList.remove(`player${turn}`);
        }else{
          const playInfo = {
            myCard: standardCard,
            roomName: getCookieValue("roomId"),
            player: getCookieValue("userName"),
            gameTurn: turn,
            special: null,
            genInit: fullTurn.genInit
          };
          playInfo.myCard.action = "pile";
          socket.emit("change-turn", playInfo);
          alertsElem.classList.remove(`player${turn}`);
        }
        
      } else {
        console.log("pre turn", turn);
        turn++;
        console.log("check turn error", turn);
        myCards.push(generalPile[+generalPile.length - 1]);
        // generalPile.pop()
        document.querySelector(".pile-qty").innerHTML = generalPile.length;
        console.log(generalPile);
        mineContainer.innerHTML = "";
        myCards.forEach((mine, index) => {
          const myCard = getMyStackCard(mine, index);
          mineContainer.innerHTML += myCard;
        });
          if (fullTurn.genInit == turn) {
            const playInfo = {
              myCard: standardCard,
              roomName: getCookieValue("roomId"),
              player: getCookieValue("userName"),
              gameTurn: turn,
              special: null,
            };
            playInfo.myCard.action = "pile";
            socket.emit("change-turn", playInfo);
            alertsElem.classList.remove(`player${turn}`);
          } else {
            const playInfo = {
              myCard: standardCard,
              roomName: getCookieValue("roomId"),
              player: getCookieValue("userName"),
              gameTurn: turn,
              special: null,
              genInit: fullTurn.genInit,
            };
            playInfo.myCard.action = "pile";
            socket.emit("change-turn", playInfo);
            alertsElem.classList.remove(`player${turn}`);
          }
        // console.log('general')
      }
    }

    socket.on('last-pile', (last)=>{
      // console.log(myCards)
      const myLength = myCards.length
      const myData = {
        name: userName,
        userId: userId,
        roomName: roomName,
        cardLength: myLength
      }
      socket.emit('my-length', myData)
    })
})


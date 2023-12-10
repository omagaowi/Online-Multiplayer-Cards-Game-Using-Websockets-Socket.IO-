export function displaySpecialAlert(turn, myIndex, fullTurn, usersList) {
    // console.log(turn, myIndex, fullTurn, usersList);
    // console.log(fullTurn)
    if(fullTurn.special != null){
        if(myIndex != fullTurn.special.reciver && 
        myIndex != fullTurn.special.giver &&
        myIndex != turn){
            console.log('special')
            if(fullTurn.myCard.action == 'pick 2' || fullTurn.myCard.action == 'pick 3'){
                document.querySelector(".special-alerts").innerHTML = `<span>${getUserName(usersList, fullTurn.special.giver)}</span> gave <span>${getUserName(usersList, fullTurn.special.reciver)} ${fullTurn.myCard.action}</span>`; 
            }else if(fullTurn.myCard.action == 'suspension' || fullTurn.myCard.action == 'hold on'){
                document.querySelector(".special-alerts").innerHTML = `<span>${getUserName(usersList, fullTurn.special.giver)}</span> put <span>${getUserName(usersList, fullTurn.special.reciver)} on ${fullTurn.myCard.action}</span>`; 
            }
           setTimeout(()=>{
                if(fullTurn.myCard.action != 'go gen'){
                     document.querySelector('.special-alerts').classList.add('reveal')
                    setTimeout(()=>{
                        document.querySelector('.special-alerts').classList.remove('reveal')
                    }, 3500)
                }
           }, 800)
        }
    }
} 

function getUserName(usersList, userIndex){
    return usersList[userIndex].userName
}
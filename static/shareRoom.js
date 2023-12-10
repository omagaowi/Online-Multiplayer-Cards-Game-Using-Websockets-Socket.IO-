const roomIdElem = document.querySelector('.room-id')
roomIdElem.addEventListener('click', ()=>{
    const roomID = roomIdElem.dataset.roomId
    document.querySelector('.share-window').classList.add('show')
    console.log(roomID)

    document.querySelectorAll('.share-window .action').forEach((action, index) => {
        action.addEventListener('click', ()=>{
            if(index == 0){
                copyToClipBoard(roomID)
            }else{
                const url = window.location.href.split('/')[2]
                copyToClipBoard(`${url}/joinroom/${roomID}`)
            }
        })
    })
})

document.addEventListener('click', (e)=>{
    if(!document.querySelector('.share-window').contains(e.target) && !roomIdElem.contains(e.target)){
          document.querySelector(".share-window").classList.remove("show");
    }
})

function copyToClipBoard(text) {
    window.navigator.clipboard.writeText(text)
    document.querySelector(".share-window .heading").classList.add('success');
    document.querySelector(".share-window h5").innerHTML = 'Copied To Clipboard!';
    setTimeout(()=>{
         document.querySelector(".share-window .heading").classList.remove('success');
        document.querySelector(".share-window h5").innerHTML = 'Share Room';
          document.querySelector(".share-window").classList.remove("show");
    }, 500)
}
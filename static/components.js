export function getUserCard(player, index){
    const finished = player.finished == true? 'finished': 'playing'
    const userCard = `
        <div class="player-card ${finished}">
            <img src="/img/cards.png" alt="">
            <div class="player-name player${index}">
                <p>${player.userName}</p>
            </div>
            <div class="card-qty player${index}">
            0
            </div>
        </div>
    `  
    return userCard 
}

export function getMyStackCard(mine, index){
    const myCard = `
            <div class="my-card ${mine.shape}" data-id="${mine.id}">
                <div class="number-div">
                    <span class="number">${mine.number}</span>
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
                <div class="shape-major">
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
                <div class="number-div">
                    <span class="number">${mine.number}</span>
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
            </div>
    `
    return myCard
}

export function renderStandardCard(standardCard){
    const myCard = `
            <div class="my-card ${standardCard.shape}">
                <div class="number-div">
                    <span class="number">${standardCard.number}</span>
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
                <div class="shape-major">
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
                <div class="number-div">
                    <span class="number">${standardCard.number}</span>
                    <div class="shape"></div>
                    <img src="/img/whot-svg.png" alt="">
                </div>
            </div>
    `
    return myCard
}
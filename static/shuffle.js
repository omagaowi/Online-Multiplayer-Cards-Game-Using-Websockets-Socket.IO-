export function myCardAllocation(userNo, userPosition, cards){
    let myStack = []
    let cardPile = []
    if(userNo == 2){
        const threshold = 20 / 2;
        // console.log(threshold)
        console.log('two')
        const startingPoint = (threshold * userPosition) - threshold
        const endPoint = startingPoint + threshold
        const pileStart = threshold * userNo
        console.log('startpoint:', startingPoint)
        console.log('endpoint:', endPoint)
        myStack = []
        cardPile=[]
        for (let index = startingPoint; index < endPoint; index++) {
           myStack.push(cards[index])  
        }
        for (let index = pileStart; index < 53; index++) {
           cardPile.push(cards[index])  
        }
        return {
            generalPile: cardPile,
            stack: myStack,
            standardCard: cards[53]
        }
        // console.log(myStack)
    }else if(userNo == 3){
        const threshold = 21 / 3;
        console.log(threshold)
        console.log('three')
        const startingPoint = (threshold * userPosition) - threshold
        const endPoint = startingPoint + threshold
        const pileStart = threshold * userNo
        console.log('startpoint:', startingPoint)
        console.log('endpoint:', endPoint)
        myStack = []
        cardPile=[]
        for (let index = startingPoint; index < endPoint; index++) {
           myStack.push(cards[index])  
        }
        for (let index = pileStart; index < 53; index++) {
           cardPile.push(cards[index])  
        }
        return {
            generalPile: cardPile,
            stack: myStack,
            standardCard: cards[53]
        }
        // console.log(myStack)
    }else if(userNo == 4){
        const threshold = 20 / 4;
        console.log(threshold)
        console.log('four')
        const startingPoint = (threshold * userPosition) - threshold
        const endPoint = startingPoint + threshold
        const pileStart = threshold * userNo
        console.log('startpoint:', startingPoint)
        console.log('endpoint:', endPoint)
        myStack = []
        cardPile=[]
        for (let index = startingPoint; index < endPoint; index++) {
           myStack.push(cards[index])  
        }
        for (let index = pileStart; index < 53; index++) {
           cardPile.push(cards[index])  
        }
        return {
            generalPile: cardPile,
            stack: myStack,
            standardCard: cards[53]
        }
        // console.log(myStack)
    }else{
        const threshold = 25 / 5;
        console.log(threshold)
        console.log('five')
        const startingPoint = (threshold * userPosition) - threshold
        const endPoint = startingPoint + threshold
        const pileStart = threshold * userNo
        console.log('startpoint:', startingPoint)
        console.log('endpoint:', endPoint)
        myStack = []
        cardPile=[]
        for (let index = startingPoint; index < endPoint; index++) {
           myStack.push(cards[index])  
        }
        for (let index = pileStart; index < 53; index++) {
           cardPile.push(cards[index])  
        }
        return {
            generalPile: cardPile,
            stack: myStack,
            standardCard: cards[53]
        }
        // console.log(myStack)
    }
}
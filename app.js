//adding in an event listener for the DOM
//this makes sure all the html code is loaded before reading the javascript code
//alternate is placing the script tag for the js file at the bottom of the html code
document.addEventListener('DOMContentLoaded', () => {
    //the dot is used to find a class name and its so we can use grid later in our file
    const grid = document.querySelector('.grid')
    let width = 10
    let bombAmount = 20 //default 20
    let flags = 0
    let squares = []
    let isGameOver = false

    //grabbing time left from html file with querySelector
    const timeLeft = document.querySelector('#time-left');

    //timer variable
    let currentTime = 0;

    //grabbing flagsremain from html file with querySelector
    let flagsRemain = document.querySelector('#flags-remain');

    //grabbing the restart button
    let restartGame = document.querySelector('#restart-button');

    //1000 how fast the timer is moving, 1000 is one second between each second, 500 is a faster timer, etc.
    let countUpTimerId = setInterval(countUp, 1000)

    //create Board. board is going to be 10 by 100 squares so we use a for loop to increase each time until reaching 99 (0-99)
    function createBoard() {
        flagsRemain.innerHTML = bombAmount

        //get shuffled game array with random bombs placed all over the grid
        //putting in a string that says bomb every time
        const bombsArray = Array(bombAmount).fill('bomb')
        const emptyArray = Array(width*width - bombAmount).fill('valid')

        //used built in method called concat to pass through the bombs array.
        //this results in two arrays being joined
        const gameArray = emptyArray.concat(bombsArray)
        const shuffledArray = gameArray.sort(()=> Math.random() - 0.5)

        //each page refresh shuffles the array and has bombs at different areas

        for(let i = 0; i < width*width; i++) {
            //every time we create a square, we want to give it a unique id
            const square = document.createElement('div')

            //giving it an id and passing in i
            square.setAttribute('id', i)

            //giving square a class name under giving it an id
            //using the classList method and add method, we add the class name of whatever
            //corresponds to whichever index we are looping over in our squares array
            square.classList.add(shuffledArray[i])

            //passes in square to the grid using built-in method called appendChild
            grid.appendChild(square)
            squares.push(square)

            //adding an event listener to each square to see if the below logic for checking for bombs has worked
            //for normal left click. we pass two things, the click and the function
            //on click we want to invoke a function called click and into it we pass a square
            square.addEventListener('click', function(e) {
                click(square)
            })

            //ctrl and left click using built in method called oncontextmenu
            square.oncontextmenu = function(e) {
                e.preventDefault()
                addFlag(square)
            }

        }

        //checking every square in a 8 square radius for bombs when squares are clicked
        //add numbers, we do this in a for loop
        //we are making sure if we are checking a square on the end of the right side of the grid, 
        //that it doesn't check the space there where there are no numbers and its the end of the grid
        //we do the same thing for the left side of the grid and top and bottom
        for (let i = 0; i < squares.length; i++) {
            let total = 0
            //defining what a left edge is first
            const isLeftEdge = (i % width === 0)
            const isRightEdge = (i % width === width -1) /*forgot i modulus width here, game was working but detecting bombs on the left edge as well as right edge when a number was on the right edge*/

            //if the square we are looping over, contains a class of valid, which is not a bomb,
            //then we want to do if i is bigger than 0, and is not at the left edge, and the 
            //squares to the left of it contain a bomb, we want to add one to the total
            //we only add one is all three statements are true
            //because if we check an area for numbers are bombs that doesn't exist, the code will break
            //we do this 9 times, one for each square around the number that was selected
            //checking a square above is minus width, checking a square directly below is plus width
            //checking a square to the left is minus one and checking a square to the right is plus one
            if (squares[i].classList.contains('valid')) {
                //left bomb
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++
                
                //top-right bomb
                if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++
                
                //top bomb, checking the square directly above the square and we don't need to check the left or right edge here
                if (i >= 10 && squares[i - width].classList.contains('bomb')) total++

                //top-left bomb
                if (i >= 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++

                //right bomb
                if (i <= 98 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++

                //bottom-left bomb
                if (i < 90 && !isLeftEdge && squares[i -1 + width].classList.contains('bomb')) total++

                //bottom-right bomb
                if (i <= 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++

                //bottom bomb
                if (i <= 89 && squares[i + width].classList.contains('bomb')) total++

                squares[i].setAttribute('data', total)
            }
        }
    }
    //invoking function to happen 100 times
    createBoard()

    //adding a flag with right click
    function addFlag(square) {
        if (isGameOver) return //we don't want anything to happen then
        //if square has not been checked and the flags placed are less than bombamount
        //then we want something to happen
        if (!square.classList.contains('checked')) {
            if (!square.classList.contains('flag') && flags < bombAmount) {
                square.classList.add('flag')
                square.innerHTML = '🚩'
                flags++
                flagsRemain.innerHTML = bombAmount - flags
                checkForWin()
            } else if (square.classList.contains('flag')) {

                //remove flag and display nothing. take a flag away from flags total
                square.classList.remove('flag')
                square.innerHTML = ''
                flags--
                flagsRemain.innerHTML = bombAmount - flags

            } 
        }
    }

    //defining a click function and passing a square as a parameter
    //if we do click a square, and that particular square contains a class of bomb,
    //alert as a game over for now just to see if everything is linked up and working
    function click(square) {

        let currentId = square.id //grabs the id of the square being passed down
        //we don't want anything to happen if the game is over and we click another square after
        //if isGameOver, then we return out of this function
        //if the square contains a checked, we break out using return and also with flagged
        if (isGameOver) return
        if (square.classList.contains('checked') || square.classList.contains('flag')) return
        if (square.classList.contains('bomb')) {
            gameOver(square)
        } else {

            //if the number is 0 when we grab data, we don't want it showing up
            let total = square.getAttribute('data')

            //once a square is checked, we want to display the total. we grab the square in
            //html for the total. we then break the cycle by using return
            if (total != 0) {
                square.classList.add('checked')
                checkForWin()
                //adding in numbers here so we can color in for css
                if (total == 1) square.classList.add('one')
                if (total == 2) square.classList.add('two')
                if (total == 3) square.classList.add('three')
                if (total == 4) square.classList.add('four')
                square.innerHTML = total
                return
            } 

            //initiate check if the square does not contain a bomb but after the check to see
            //if its 0. once checked add the class of checked.
            //passes through the square and the currentId
            checkSquare(square, currentId)
        }
        square.classList.add('checked')
        checkForWin()
    }

    //checks neighboring squares once a square is clicked
    //we choose to call the function check square. we can pass down two parameters and not just
    //one. first thing to understand is we are checking all 8 squares around each square
    //logic to this is similar to how we add numbers to surrounding squares
    //first thing we do is check if the square is at the left edge or the right edge
    function checkSquare(square, currentId) {
        const isLeftEdge = (currentId % width === 0)
        const isRightEdge = (currentId % width === width - 1)

        //we want this to happen a tiny bit after we click a square so we use a timeout.
        //this is because we want this to happen after all the checks to give it some time
        //uses built in method of setTimeOut. we pass in 10 miliseconds
        setTimeout(() => {
            //if currentId is greater than 0 and not at the left edge, we want to get the id
            //of the square directly to the left of it
            //parseInt is used to make sure the number is a number and not a string
            if (currentId > 0 && !isLeftEdge){
                const newId = squares[parseInt(currentId) - 1].id

                //we then grab our answer to work with by making a variable called newSquare
                const newSquare = document.getElementById(newId)

                //pass through the click function to be checked again, if it passes
                //it will go again otherwise if it hits a return, it stops
                click(newSquare)

                //how the recursion works here
                //first we have our click function and then over here ----> we have a checkSquare function
                //in our click function we have 'is game over?' we return (nothing happens)
                //if the square we checked or has a flag, we also return
                //if the square is over 0? we add the data number to innerhtml and then we return
                //if the square has nothing from above, we mark it as checked and invoke the check square function
                //which after doing this, this function checks all of its neighbors, 1st, 2nd, etc. to 8
                //if we check the first nighbor and want to check the surrounding neighbors, we want to 
                //go back to the click function and do all the checks again

            }
            if  (currentId > 9 && !isRightEdge) {

                //get the new id of the square directly to the right and one above so southwest
                //get actual square by using document.getelementbyid, and pass new square into
                //the click function and have it check it again
                const newId = squares[parseInt(currentId) +1 - width].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            //this is to check the square directly above
            if (currentId > 10) {
                const newId = squares[parseInt(currentId - width)].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            //if the currentId that we click is an empty square, with a number of 0
            //then we pass down into the check square function, if larger than 11, and not
            //at the left edge, then we want to grab the id directly to the left of it
            //and we want to pass the id through the click function again
            if (currentId > 11 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1 - width].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            if (currentId < 98 && !isRightEdge) {
                const newId = squares[parseInt(currentId) +1].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            if (currentId < 90 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1 + width].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            if (currentId < 89 && !isRightEdge) { //changed from 88 to 89 to fix the issue where the bottom right corner was not being revealed in an area
                const newId = squares[parseInt(currentId) + 1 + width].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
            if (currentId < 89) {
                const newId = squares[parseInt(currentId) + width].id
                const newSquare = document.getElementById(newId)
                click(newSquare)
            }
        }, 10)

    }

    //gameover function, pass through a parameter for our square
    function gameOver(square) {

        result.innerHTML = "Boom! Game Over :("
        //important so nothing can be clicked after the game is over
        isGameOver = true
        clearInterval(countUpTimerId) //stops the timer when game is over

        //show all the bomb locations if the game is over
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣'
                square.classList.remove('bomb')
                square.classList.add('checked')
            }
        })
    }

    //check for win
function checkForWin() {
    let uncheckedSquares = 0
        for (let i = 0; i < squares.length; i++) {
            if (!squares[i].classList.contains('checked')) {
                uncheckedSquares ++
            }
        }
        if (uncheckedSquares === bombAmount) {
        //if (matches === 80) {
            result.innerHTML = 'YOU WIN!'
            isGameOver = true
            clearInterval(countUpTimerId) //stops the timer when game is won
        }
    }


    //starting a timer to count up, as soon as the player clicks a square
    //can add in click function
    function countUp() {
        currentTime++
        timeLeft.textContent = currentTime;
    }

    //click listener for restart button and reload of page
    restartGame.addEventListener('click', function(e) {
        click(restartGame)
        location.reload();
    })

})
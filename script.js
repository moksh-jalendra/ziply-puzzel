

let unlockedlevel = localStorage.getItem('zipProgress')

if (unlockedlevel === null){
    unlockedlevel = 1
}else{
    unlockedlevel = parseInt(unlockedlevel)
}

let purchasedThemes = localStorage.getItem("zipInventory")
if(purchasedThemes===null){
    purchasedThemes = ['clasic']
}else{
    purchasedThemes = JSON.parse(purchasedThemes)
}



let coins = localStorage.getItem('zipCoins')
coins = coins === null ? 0 : parseInt(coins)
document.getElementById('coin-count').innerText = coins

//   some variables 
let path = []
let expected = 1
let selectedLevelkey = 'level' + unlockedlevel


const levels ={
    level1 :
    [
        1,0,0,0,2,
        0,0,0,0,0,
        0,0,3,0,0,
        0,0,0,0,0,
        4,0,0,0,5
    ],
    level2 :
    [
        0,0,0,0,2,
        0,1,0,0,0,
        0,0,3,0,0,
        0,5,0,0,6,
        4,0,0,0,0
    ],
    level3 :
    [
        1,0,0,0,2,
        0,0,0,0,0,
        0,0,3,0,0,
        5,0,0,0,0,
        0,0,0,0,4
    ],
    level4 :
    [
        0,0,0,0,2,
        0,0,0,0,0,
        0,0,3,0,0,
        5,0,0,0,0,
        4,0,1,0,0
    ],
    level5 :
    [
        0,0,0,0,2,
        0,0,0,0,0,
        6,0,3,0,0,
        5,0,0,1,0,
        4,0,0,0,0
    ]
}




//        level logic 
 
 const LevlDisplay = document.getElementById('level-disply')

 function renderLevelButtons(){
    LevlDisplay.innerHTML = ''
    for(let [key,value] of Object.entries(levels)){
        let levelBox = document.createElement('div')
        levelBox.classList.add('levelbox')
        let levelNum = parseInt(key.replace('level',''))

        if(levelNum > unlockedlevel){
            levelBox.style.backgroundColor = 'gray'
            levelBox.style.cursor = 'not-allowed'
            levelBox.innerText = "🔒" + key
        }else{
            levelBox.innerText = key
            if(key === selectedLevelkey){
                levelBox.style.backgroundColor = 'orange'
            }

            levelBox.addEventListener('click' , function(){
                document.querySelectorAll('.levelbox').forEach(box => {
                    if(box.style.backgroundColor === 'orange'){
                        box.style.backgroundColor = 'white'
                    }
                })
                levelBox.style.backgroundColor = 'orange'
                selectedLevelkey = key
            })
        }
        LevlDisplay.appendChild(levelBox)
        
    }

 }
 
 
 

 //              main zip logic             

function zipLogic(puzzleArry){
    const grid = document.getElementById("grid")
    grid.innerHTML = ''
    path = []
    expected = 1

    let puzzle = puzzleArry

    let puzzelindex = 0


    for (let x = 0; x < 5; x++) {

        for (let y = 0; y < 5; y++) {
            let cell = document.createElement("div")
            cell.classList.add("cell")
            cell.dataset.x = x
            cell.dataset.y = y

            if (puzzleArry[puzzelindex] !== 0) {
                cell.innerText = puzzleArry[puzzelindex]
            }

            grid.appendChild(cell)
            puzzelindex++
        }

    }



    grid.addEventListener("touchmove", function (e) {
        e.preventDefault()

        let touch = e.touches[0]
        x = touch.clientX
        y = touch.clientY

        let ellement = document.elementFromPoint(touch.clientX, touch.clientY)
        if (ellement && ellement.classList.contains('cell')) {
            let gridx = ellement.dataset.x
            let gridy = ellement.dataset.y
            let coordinate = gridx + "-" + gridy
            if (path.length === 0) {
                if (ellement.innerText !== "1") {
                    return
                }

            }
            if (path.length > 0) {

                let lastcoordinate = path[path.length - 1]
                let lastx = parseInt(lastcoordinate.split("-")[0])
                let lasty = parseInt(lastcoordinate.split("-")[1])

                let currentx = parseInt(gridx)
                let currenty = parseInt(gridy)

                let distancex = Math.abs(currentx - lastx)
                let distancey = Math.abs(currenty - lasty)

                if (distancex + distancey !== 1) {
                    return
                }

            }
            if (path.length > 1) {
                if (path[path.length - 2] === coordinate) {
                    let removdbox = path.pop()
                    let removedx = removdbox.split('-')[0]
                    let removedy = removdbox.split("-")[1]

                    let celltoerase = document.querySelector(`[data-x="${removedx}"][data-y="${removedy}"]`)
                    celltoerase.style.backgroundColor = ''
                    if (celltoerase.innerText !== '') {
                        expected--
                    }
                    return
                }
            }
            if (ellement.innerText !== '') {
                let cellnumber = parseInt(ellement.innerText)
                if (cellnumber !== expected) {
                    return
                }
                expected++
            }
            if (!path.includes(coordinate)) {
                path.push(coordinate)
                ellement.style.backgroundColor = 'orange'
            }
            if (path.length === 25) {
                alert("congrutulaton you won")
                let currentLevelNum = parseInt(selectedLevelkey.replace('level',''))
                if(currentLevelNum === unlockedlevel){
                    unlockedlevel++
                    localStorage.setItem('zipProgress',unlockedlevel)
                }
                coins+=3
                localStorage.setItem('zipCoins',coins)
                document.getElementById('coin-count').innerText= coins
                selectedLevelkey = "level" + unlockedlevel
                OpenLevelPage()
            }

        }

    })

    
}


//             page togle logic 



let levl = document.getElementById("level-screen")
let home = document.getElementById("home-screen")
let game = document.getElementById("game-screen")
function slideTheme(direction){
    let slider = document.getElementById('theme-slider')
    let scrollAmount = slider.clientWidth/2

    slider.scrollBy({
        left:scrollAmount*direction,
        behavior:"smooth"
    })
}


function OpenLevelPage(){
    renderLevelButtons()
    levl.style.display = 'flex'
    home.style.display= 'none'
    game.style.display ='none'

}

function start(){
    levl.style.display = 'none'
    game.style.display = 'flex'
    let chosenPuzzel = levels[selectedLevelkey]
    zipLogic(chosenPuzzel)

}

function backhome(){
    levl.style.display = 'none'
    home.style.display = 'flex'
}





// themee store and selection logic

const themeCost = {wood : 5 , glass : 15 }

function handleTheme(themeName){
    if(themeName == 'ice'){
        if(unlockedlevel < 3 ){
            alert('you must reach level 3 ')
            return
        }
        applyTheme(themeName)
        localStorage.setItem('ziptheme' , themeName)
        return
    }

    if(purchasedThemes.includes(themeName)){
        applyTheme(themeName)
        localStorage.setItem('ziptheme' , themeName)
        return
    }

    if(themeName === 'paper'){
        alert('complete your login')
        return
    }

    let cost = themeCost[themeName]

    if(coins >= cost){
        let confirmBuy = confirm(`do you want to spend ${cost} to unlock ${themeName}`)
        if(confirmBuy){
            coins -= cost
            localStorage.setItem("zipCoins",coins)
            document.getElementById("coin-count").innerText = coins

            purchasedThemes.push(themeName)
            localStorage.setItem("zipInventory", JSON.stringify(purchasedThemes))

            alert(`yo unlocked ${themeName}` )
            applyTheme(themeName)
            
        }
    }else{
        alert(`you need ${cost}`)
    }
}


function applyTheme(themeName){
    if(themeName === 'clasic'){
        document.body.removeAttribute('data-theme')
    }else{
        document.body.dataset.theme = themeName
    }

    localStorage.setItem("zipTheme" , themeName)
    updateThemesButtons(themeName)
}

function updateThemesButtons(activeTheme){
    document.querySelector('#theme-clasic .theme-btn').innerText = activeTheme === 'clasic' ? "selcted" : "select"
    let woodBtn = document.querySelector("#theme-wood .theme-btn")
    if(purchasedThemes.includes("wood")){
        woodBtn.innerText = activeTheme === 'wood' ? "selected" : "select"

    }else{
        woodBtn.innerText = `unlock${themeCost.wood}`
    }
    let glassBtn = document.querySelector("#theme-glass .theme-btn")
    if(purchasedThemes.includes("glass")){
        glassBtn.innerText = activeTheme === 'glass' ? "selected" : "select"

    }else{
        glassBtn.innerText = `unlock${themeCost.glass}`
    }
    let iceBtn = document.querySelector("#theme-ice .theme-btn")
    if(unlockedlevel >= 3){
        iceBtn.innerText = activeTheme === 'ice' ? "selected" : "select"

    }else{
        iceBtn.innerText = `level 3 required`
    }
    let paperBtn = document.querySelector('#theme-paper .theme-btn')
    if(purchasedThemes.includes('paper')){
        paperBtn.innerText = activeTheme === 'paper' ? "selected" : "select"
    }else{
        let daysLeft = 7 - (parseInt(localStorage.getItem('zipLoginDays')) || 0)
        paperBtn.innerText = `logins left${daysLeft}`
    }
    
}

let savedTheme = localStorage.getItem('ziptheme') || "clasic"
applyTheme(savedTheme)


// daily login logic 

let today = new Date().getDate
console.log(today)
let lastLogin = parseInt(localStorage.getItem("zipLastLogin"))
let loginDays = parseInt(localStorage.getItem("zipLoginDays"))

loginDays = loginDays === null ? 0 : parseInt(loginDays)
if(lastLogin !== today){
    
    loginDays++
    localStorage.setItem('zipLastLogin' , today)
    localStorage.setItem("zipLoginDays",loginDays)
    let remainDays = 8 - loginDays 
    if(remainDays === 0){
        purchasedThemes.push('paper')
        localStorage.setItem("zipInventory", JSON.stringify(purchasedThemes))

    }
    

    
    
}






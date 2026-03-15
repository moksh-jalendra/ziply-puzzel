//                localStorage feture

let unlockedlevel = localStorage.getItem('zipProgress')

if (unlockedlevel === null){
    unlockedlevel = 1
}else{
    unlockedlevel = parseInt(unlockedlevel)
}


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
        1,0,0,0,2,
        0,0,0,0,0,
        0,0,3,0,0,
        0,0,0,0,6,
        4,0,0,0,5
    ],
    level3 :
    [
        1,0,0,0,2,
        0,0,0,0,0,
        6,0,3,0,0,
        5,0,0,0,0,
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




//           theme logic 

function selectTheme(themename){
    if(themename == "wood" || themename == 'ice'){
        if (unlockedlevel<3){
            alert('coplete your level')
            return
        }

    }
    if(themename == 'clasic'){
        document.body.removeAttribute("data-theme")

    }else{
        document.body.dataset.theme = themename
    }

    localStorage.setItem('zipTheme' , themename)
}

let savedTheme = localStorage.getItem('zipTheme')
if(savedTheme){
    selectTheme(savedTheme)
}
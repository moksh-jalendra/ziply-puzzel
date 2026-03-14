const grid = document.getElementById("grid")
let path = []
let expected = 1

const puzzle = [
    1,0,0,0,2,
    0,0,0,0,0,
    0,0,3,0,0,
    0,0,0,0,0,
    4,0,0,0,5
]
let puzzelindex = 0





for(let x = 0 ; x < 5 ; x ++ ){

    for(let y = 0 ; y < 5 ; y ++ ){
        let cell = document.createElement("div")
        cell.classList.add("cell")
        cell.dataset.x = x
        cell.dataset.y= y

        if (puzzle[puzzelindex]!== 0){
            cell.innerText = puzzle[puzzelindex]
        }

        grid.appendChild(cell)
        puzzelindex ++
    }
    
}



grid.addEventListener( "touchmove", function(e) {
    e.preventDefault()
   
    let touch = e.touches[0]
    x = touch.clientX
    y = touch.clientY
    
    let ellement = document.elementFromPoint(touch.clientX , touch.clientY)
    if (ellement && ellement.classList.contains('cell')){
        let gridx = ellement.dataset.x
        let gridy = ellement.dataset.y
        let coordinate = gridx + "-" + gridy
        if(path.length === 0 ){
            if(ellement.innerText !== "1"){
                return
            }
            
        }
        if (path.length > 0 ){

            let lastcoordinate = path[path.length - 1]
            let lastx = parseInt(lastcoordinate.split("-")[0])
            let lasty = parseInt(lastcoordinate.split("-")[1])

            let currentx = parseInt(gridx)
            let currenty = parseInt(gridy)

            let distancex = Math.abs(currentx - lastx)
            let distancey = Math.abs(currenty - lasty)
            
            if(distancex + distancey !== 1){
                return
            }

        }
        if(path.length >1 ){
            if(path[path.length -2] === coordinate){
                let removdbox = path.pop()
                let removedx = removdbox.split('-')[0]
                let removedy = removdbox.split("-")[1]

                let celltoerase = document.querySelector(`[data-x="${removedx}"][data-y="${removedy}"]`)
                celltoerase.style.backgroundColor=''
                if(celltoerase.innerText !==''){
                    expected --
                }
                return
            }
        }
        if(ellement.innerText !== ''){
            let cellnumber = parseInt(ellement.innerText)
            if(cellnumber !== expected){
                return
            }
            expected++
        }
        if(!path.includes(coordinate)){
            path.push(coordinate)
            ellement.style.backgroundColor = 'orange'
        }
        if(path.length === 25){
            alert("congrutulaton you won")
        }
       
    }

})


function startlevel(val){


    // herer we wright level code
    
    // here we wright common code 

    let home = document.getElementById('home-screen')
    let game = document.getElementById('game-screen')
    home.style.display = 'none'
    game.style.display='flex'
}
function gohome(){
    let home = document.getElementById('home-screen')
    let game = document.getElementById('game-screen')
    home.style.display = 'flex'
    game.style.display='none'

}




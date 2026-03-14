# ZIP Puzzle Game 🎮

A logic-based grid puzzle game built entirely from scratch using HTML, CSS, and vanilla JavaScript. 

## How to Play
1. You must start by touching the number **1**.
2. Drag your finger (or mouse) to connect the numbers in sequential order (1 -> 2 -> 3...).
3. You can only move up, down, left, or right. **No diagonal moves allowed.**
4. You cannot cross over a path you have already drawn.
5. Fill all 25 boxes to win the game!
6. Made a mistake? Just swipe backward over your path to undo your moves.

## Features
- **Custom DOM Manipulation:** The game grid is dynamically generated using JavaScript loops.
- **Touch Events:** Implements `touchmove` and DOM coordinate mapping for seamless mobile gameplay.
- **State Management:** Tracks the player's path, enforces adjacency math (preventing illegal jumps), and dynamically updates the expected goal numbers.
- **LIFO Array Backtracking:** Includes a fully functional "undo" feature using array `.pop()` to step backward and erase the visual path.
- **Single Page Application (SPA) Routing:** Uses JavaScript to seamlessly toggle between the Home Screen and the Game Board.

## Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript (ES6)
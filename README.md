# 🧩 Ziply - Logic Puzzle Game

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Ziply is a lightweight, high-performance line-drawing logic puzzle game built entirely from scratch using pure **Vanilla JavaScript, HTML5, and CSS3**—no game engines or external UI frameworks required. 

Connect the numbers in sequential order and fill every empty tile on the board to win.

🎮 **[Play the Live Demo Here](#)** *([https://html5.gamemonetize.co/d7a965ple3vols2kwz51d646oclw79mh/](https://html5.gamemonetize.co/d7a965ple3vols2kwz51d646oclw79mh/))*

## ✨ Features

* **1500+ Unique Levels:** Ranging from simple 5x5 grids to mind-bending 8x8 Master modes.
* **Smart Hint System:** Features a custom Depth-First Search (DFS) Backtracking algorithm that calculates verified winning paths in real-time.
* **Interactive Tutorial:** A state-machine-driven tutorial for Level 1 that guides new players step-by-step using DOM manipulation.
* **Hybrid Rendering Engine:** Utilizes CSS Grid for responsive hit-detection and an HTML5 `<canvas>` overlay for drawing high-fidelity glowing paths.
* **Cloud Economy & Progression:** Tracks player stats, login streaks, and unlocks using local storage.
* **Responsive Design:** Fully playable on both mobile touch screens and desktop browsers.

## 🛠️ Technical Architecture

Ziply was built as an exercise in pushing the DOM to its limits while maintaining a strict 60FPS frame rate on mobile devices.

### DOM + Canvas Hybrid
Instead of building a heavy, pure-canvas physics engine, Ziply leverages the browser's native capabilities:
1. **The Logic Layer (DOM):** The grid is constructed using semantic HTML `<div>` elements and CSS Grid. This allows for zero-math responsive scaling and utilizes `document.elementFromPoint()` for pixel-perfect touch tracking.
2. **The Visual Layer (Canvas):** A transparent `<canvas>` element sits absolutely positioned over the grid, responsible solely for drawing the glowing SVG-style pipes based on the player's coordinate array.

### DFS Backtracking Solver
The Hint System does not just point to the next number. It runs a background simulation of the current board state using a Depth-First Search algorithm. It simulates thousands of moves to find a path that successfully reaches the next number *without* trapping any empty tiles, ensuring the player is never given a hint that makes the level unwinnable.

## 🚀 Getting Started

Since Ziply is built with Vanilla web technologies, there are no build steps, node modules, or bundlers required.

1. Clone the repository:
   ```bash
   git clone https://github.com/moksh-jalendra/ziply-puzzel.git

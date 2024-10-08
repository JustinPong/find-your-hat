// script.js
const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";
const footprintCharacter = ".";

const icons = {
  [hat]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="brown"><path d="M12 2l-8 8h16l-8-8zM4 10v2h16v-2H4zm0 4v2h16v-2H4z"/></svg>`,
  [hole]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><ellipse cx="12" cy="12" rx="10" ry="5"/></svg>`,
  [pathCharacter]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><circle cx="12" cy="8" r="4"/><path d="M12 12c-2.21 0-4 1.79-4 4v4h8v-4c0-2.21-1.79-4-4-4z"/></svg>`,
  [fieldCharacter]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="lightgrey"><rect width="24" height="24" fill="none"/></svg>`,
  [footprintCharacter]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="darkgrey"><circle cx="12" cy="12" r="2"/></svg>`,
};

class Field {
  constructor(field) {
    this.x = 0;
    this.y = 0;
    this.field = field;
    // Store the initial state of the field to reset it during a restart
    this.initialField = field.map((row) => [...row]); // Deep clone of the field array
  }

  print() {
    const fieldDiv = document.getElementById("field");
    fieldDiv.innerHTML = this.field
      .map((row) => row.map((cell) => icons[cell]).join(""))
      .join("<br>");
  }

  isHat() {
    if (this.field[this.y][this.x] === hat) {
      document.getElementById("message").textContent =
        "You won! You've found the hat!";
      document.getElementById("next-map-btn").style.display = "block";
      document.getElementById("exit-btn").style.display = "block";
      document.getElementById("restart-btn").style.display = "none"; // Hide Restart Button on win
      return true;
    }
    return false;
  }

  isHole() {
    if (this.field[this.y][this.x] === hole) {
      document.getElementById("message").textContent =
        "You lost! You fell in the hole!";
      document.getElementById("next-map-btn").style.display = "block";
      document.getElementById("exit-btn").style.display = "block";
      document.getElementById("restart-btn").style.display = "block"; // Show Restart Button
      return true;
    }
    return false;
  }

  isInBounds() {
    if (
      this.y >= 0 &&
      this.x >= 0 &&
      this.y < this.field.length &&
      this.x < this.field[0].length
    ) {
      return true;
    }
    document.getElementById("message").textContent =
      "You lost! You're out of bounds!";
    document.getElementById("next-map-btn").style.display = "block";
    document.getElementById("exit-btn").style.display = "block";
    document.getElementById("restart-btn").style.display = "block"; // Show Restart Button
    return false;
  }

  static generateField(height, width, holePercentage) {
    let field, startX, startY, hatX, hatY;

    do {
      field = new Array(height)
        .fill(0)
        .map(() => new Array(width).fill(fieldCharacter));

      let totalCells = height * width;
      let holeCount = Math.floor(totalCells * holePercentage);

      // Randomly place holes
      while (holeCount > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        if (field[y][x] === fieldCharacter) {
          field[y][x] = hole;
          holeCount--;
        }
      }

      // Find a random start point that is not a hole
      do {
        startX = Math.floor(Math.random() * width);
        startY = Math.floor(Math.random() * height);
      } while (field[startY][startX] === hole);

      // Place the hat at a position that's far enough from the start
      do {
        hatX = Math.floor(Math.random() * width);
        hatY = Math.floor(Math.random() * height);
      } while (
        field[hatY][hatX] === hole || // Ensure hat isn't on a hole
        Math.abs(hatX - startX) + Math.abs(hatY - startY) < 3 // Manhattan distance check
      );

      field[hatY][hatX] = hat; // Place the hat

      field[startY][startX] = pathCharacter; // Mark starting point
    } while (!Field.isWinnable(field, startX, startY)); // Ensure the field is winnable

    return { field, startX, startY };
  }

  static isWinnable(field, startX, startY) {
    const height = field.length;
    const width = field[0].length;
    const visited = Array.from({ length: height }, () =>
      Array(width).fill(false)
    );

    const dfs = (x, y) => {
      if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height ||
        visited[y][x] ||
        field[y][x] === hole
      ) {
        return false;
      }
      if (field[y][x] === hat) {
        return true;
      }
      visited[y][x] = true;
      // Explore all four directions
      return dfs(x + 1, y) || dfs(x - 1, y) || dfs(x, y + 1) || dfs(x, y - 1);
    };

    // Start DFS from the player's starting point
    return dfs(startX, startY);
  }

  checkWin() {
    if (!this.isInBounds() || this.isHat() || this.isHole()) {
      return false;
    }
    this.field[this.y][this.x] = pathCharacter;
    return true;
  }

  moveCharacter(newX, newY) {
    if (this.isInBounds()) {
      this.field[this.y][this.x] = footprintCharacter; // Leave a footprint on previous position
    }
    this.x = newX;
    this.y = newY;
  }

  playGame(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.field[this.y][this.x] = pathCharacter; // Ensure the player is placed at the starting point
    this.print();
    document.getElementById("message").textContent = "Find your hat!";
    document.getElementById("next-map-btn").style.display = "none";
    document.getElementById("exit-btn").style.display = "none";
    document.getElementById("restart-btn").style.display = "none"; // Hide Restart Button at the start
  }

  resetField() {
    // Reset the field to the initial state (no footprints, player at start)
    this.field = this.initialField.map((row) => [...row]); // Deep clone the original field
    this.field[currentStartY][currentStartX] = pathCharacter; // Reset player at the starting position
    this.playGame(currentStartX, currentStartY); // Reset player position
  }
}

let currentField = null; // Global variable to store the current field
let currentStartX = 0;
let currentStartY = 0;
let currentHolePercentage = 0.2; // Default difficulty

function startGame(holePercentage) {
  currentHolePercentage = holePercentage;
  const { field, startX, startY } = Field.generateField(10, 10, holePercentage);
  currentField = field; // Save the generated field
  currentStartX = startX;
  currentStartY = startY;
  const myField = new Field(field);
  myField.playGame(startX, startY);

  document.getElementById("field").style.display = "block"; // Show the field

  function handleKey(event) {
    let newX = myField.x;
    let newY = myField.y;
    switch (event.key) {
      case "ArrowUp":
        newY--;
        break;
      case "ArrowLeft":
        newX--;
        break;
      case "ArrowDown":
        newY++;
        break;
      case "ArrowRight":
        newX++;
        break;
      default:
        return; // Ignore other keys
    }
    myField.moveCharacter(newX, newY);
    if (!myField.checkWin()) {
      document.removeEventListener("keydown", handleKey);
    }
    myField.print();
  }

  document.addEventListener("keydown", handleKey);
}

function restartGame() {
  if (currentField) {
    // Reset the field to its initial state (before any footprints)
    const myField = new Field(currentField.map((row) => [...row])); // Clone the field
    myField.resetField(); // Reset to initial state
    document.getElementById("field").style.display = "block"; // Show the field

    function handleKey(event) {
      let newX = myField.x;
      let newY = myField.y;
      switch (event.key) {
        case "ArrowUp":
          newY--;
          break;
        case "ArrowLeft":
          newX--;
          break;
        case "ArrowDown":
          newY++;
          break;
        case "ArrowRight":
          newX++;
          break;
        default:
          return; // Ignore other keys
      }
      myField.moveCharacter(newX, newY);
      if (!myField.checkWin()) {
        document.removeEventListener("keydown", handleKey);
      }
      myField.print();
    }

    document.addEventListener("keydown", handleKey);
  }
}

document.querySelectorAll(".difficulty-btn").forEach((button) => {
  button.addEventListener("click", () => {
    let holePercentage;
    switch (button.getAttribute("data-difficulty")) {
      case "easy":
        holePercentage = 0.2;
        break;
      case "medium":
        holePercentage = 0.3;
        break;
      case "hard":
        holePercentage = 0.4;
        break;
    }
    document.getElementById("difficulty-selection").style.display = "none";
    startGame(holePercentage);
  });
});

document.getElementById("next-map-btn").addEventListener("click", () => {
  startGame(currentHolePercentage);
});

document.getElementById("restart-btn").addEventListener("click", () => {
  restartGame();
});

document.getElementById("exit-btn").addEventListener("click", () => {
  document.getElementById("difficulty-selection").style.display = "block";
  document.getElementById("field").style.display = "none";
  document.getElementById("field").innerHTML = "";
  document.getElementById("message").textContent = "";
  document.getElementById("next-map-btn").style.display = "none";
  document.getElementById("exit-btn").style.display = "none";
  document.getElementById("restart-btn").style.display = "none"; // Hide Restart Button
});

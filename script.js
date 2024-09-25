const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

const icons = {
  [hat]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="brown"><path d="M12 2l-8 8h16l-8-8zM4 10v2h16v-2H4zm0 4v2h16v-2H4z"/></svg>`,
  [hole]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><ellipse cx="12" cy="12" rx="10" ry="5"/></svg>`,
  [pathCharacter]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><circle cx="12" cy="8" r="4"/><path d="M12 12c-2.21 0-4 1.79-4 4v4h8v-4c0-2.21-1.79-4-4-4z"/></svg>`,
  [fieldCharacter]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="lightgrey"><rect width="24" height="24" fill="none"/></svg>`,
};

class Field {
  constructor(field) {
    this.x = 0;
    this.y = 0;
    this.field = field;
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
      return true;
    }
    return false;
  }

  isHole() {
    if (this.field[this.y][this.x] === hole) {
      document.getElementById("message").textContent =
        "You lost! You fell in the hole!";
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
    return false;
  }

  static generateField(height, width, percentage) {
    const field = new Array(height).fill(0).map(() => new Array(width));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const prob = Math.random();
        field[y][x] = prob > percentage ? fieldCharacter : hole;
      }
    }
    const hatLocation = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    };
    field[hatLocation.y][hatLocation.x] = hat;
    return field;
  }

  randomStart() {
    let startX, startY;
    do {
      startX = Math.floor(Math.random() * this.field[0].length);
      startY = Math.floor(Math.random() * this.field.length);
    } while (this.field[startY][startX] === hat);
    this.x = startX;
    this.y = startY;
    this.field[this.y][this.x] = pathCharacter;
  }

  checkWin() {
    if (!this.isInBounds() || this.isHat() || this.isHole()) {
      return false;
    }
    this.field[this.y][this.x] = pathCharacter;
    return true;
  }

  playGame() {
    this.randomStart();
    this.print();
    document.getElementById("message").textContent = "Find your hat!";
  }
}

function startGame(holePercentage) {
  const randomField = Field.generateField(5, 5, holePercentage);
  const myField = new Field(randomField);
  myField.playGame();

  document.addEventListener("keydown", function handleKey(event) {
    switch (event.key) {
      case "ArrowUp":
        myField.y--;
        break;
      case "ArrowLeft":
        myField.x--;
        break;
      case "ArrowDown":
        myField.y++;
        break;
      case "ArrowRight":
        myField.x++;
        break;
      default:
        return; // Ignore other keys
    }
    if (!myField.checkWin()) {
      document.removeEventListener("keydown", handleKey);
    }
    myField.print();
  });
}

document.querySelectorAll(".difficulty-btn").forEach((button) => {
  button.addEventListener("click", () => {
    let holePercentage;
    switch (button.getAttribute("data-difficulty")) {
      case "easy":
        holePercentage = 0.1;
        break;
      case "medium":
        holePercentage = 0.2;
        break;
      case "hard":
        holePercentage = 0.3;
        break;
    }
    document.getElementById("difficulty-selection").style.display = "none";
    startGame(holePercentage);
  });
});

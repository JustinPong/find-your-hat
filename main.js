const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

const name = prompt('What is your name? ');
console.log(`Hey there ${name}`);


class Field {
  constructor(field) {
    this.x = 0;
    this.y = 0;
    this.field = field;
  }

  //print out the map for the player to decide next step
  print() {
    for (let i = 0; i < this.field.length; i++) {
      console.log(this.field[i].join(''));
    }
  }

  //Check if player's path is in hat or not
  isHat() {
    let isHat = null;
    if (this.field[this.y][this.x] === hat) {
      console.log('You won! You\'ve found the hat!');
      isHat = true;
    } else {
      isHat = false;
    }
    return isHat;
  }

//Check if player's path is in hole or not
  isHole() {
    let isHole = null;
    if (this.field[this.y][this.x] === hole) {
      console.log('You lost! You fell in the hole!');
      isHole = true;
    } else {
      isHole = false;
    }
    return isHole;
  }

//Check if pathCharacter is in bound or not
  isInBounds() {
    let isInBounds = null;
    if (this.y >= 0 && this.x >= 0 && this.y < this.field.length && this.x < this.field[0].length) {
      isInBounds = true;
    } else {
      isInBounds = false;
      console.log('You lost! You\'re out of bounds!')
    }
    return isInBounds;
  }

  //generate a new map
  static generateField(height, width, percentage = 0.1) {
    const field = new Array(height).fill(0).map(el => new Array(width));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const prob = Math.random();
        field[y][x] = prob > percentage ? fieldCharacter : hole;
      }
    }
    const hatLocation = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    };
    field[hatLocation.y][hatLocation.x] = hat;
    return field;
  }

  //randomX
  randomStartX() {
    this.x = Math.floor(Math.random() * this.field.length);
    return this.x;
  }

  //randomY
  randomStartY() {
    this.y = Math.floor(Math.random() * this.field[this.randomStartX()].length);
    return this.y;
  }

  //randomStart
  randomStart() {
    while (this.field[this.randomStartY()][this.randomStartX()] === hat) {
      this.randomStartX();
      this.randomStartY();
    }

    let startingPoint = this.field[this.randomStartY()][this.randomStartX()];
    startingPoint = pathCharacter;
    return startingPoint;
  }

  //check if the space is full or not
  remindingSpace() {
    let numOfSpace = 0;
    this.field.forEach(element => {
      numOfSpace += element.filter(character => character === fieldCharacter).length;
    });
    return numOfSpace;
  }
  addHole() {
    const addHoleLocation = {
      x: Math.floor(Math.random() * this.field[0].length),
      y: Math.floor(Math.random() * this.field.length)
    };
    while (this.field[addHoleLocation.y][addHoleLocation.x] !== fieldCharacter && this.remindingSpace() !== 0) {
      addHoleLocation.x = Math.floor(Math.random() * this.field[0].length);
      addHoleLocation.y = Math.floor(Math.random() * this.field.length);
    }
    if (this.field[addHoleLocation.y][addHoleLocation.x] !== hat && this.field[addHoleLocation.y][addHoleLocation.x] !== pathCharacter) {
      this.field[addHoleLocation.y][addHoleLocation.x] = hole;
      return this.field;
    } else {
      return this.field;
    }
  }



  //checkWin
  checkWin(inputCurrentlyPlayingStatus) {
    let isPlaying = inputCurrentlyPlayingStatus;
    if (isPlaying) {
      if (!this.isInBounds() || this.isHat() || this.isHole()) {
        isPlaying = false;
      } else {
        this.field[this.y][this.x] = pathCharacter;
        isPlaying = true;
      }
    }
    return isPlaying;
  }

  //Start a game
  playgame() {
    let time = 0;
    this.randomStart();
    this.field[this.y][this.x] = pathCharacter;
    let currentlyPlaying = true;
    while (currentlyPlaying === true) {
      if (time % 1 === 0 && time !== 0) {
        this.addHole();
      }
      time++;
      this.print();
      let userinput = prompt('Which way?')
      switch (userinput) {
        case 'w':
          this.y--;
          currentlyPlaying = this.checkWin(currentlyPlaying);
          break;
        case 'a':
          this.x--;
          currentlyPlaying = this.checkWin(currentlyPlaying);
          break;
        case 's':
          this.y++;
          currentlyPlaying = this.checkWin(currentlyPlaying);
          break;
        case 'd':
          this.x++;
          currentlyPlaying = this.checkWin(currentlyPlaying);
          break;
      }
    }
  }
}




//The parameter is to decide the diffculty
const randomField = Field.generateField(5, 5, 0.4);
const myfield = new Field(randomField);





myfield.playgame();
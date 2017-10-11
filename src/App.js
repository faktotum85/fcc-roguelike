import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();

    this.state = {
      grid: drawMap(generateRooms(20, 30, 5, 5))
    }
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeys);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeys);
  }

  render() {
    return (
      <div className="App">
        {this.state.grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row">
            {row.map((col, colIndex) => {
              if (col === ' ') {
                return <div key={colIndex} className="cell space"></div>
              } else {
                return <div key={colIndex} className="cell wall"></div>
              }
            })}
            </div>
          )
        })}
      </div>
    );
  }

  handleKeys(e) {
    console.log(e.code);
  }
}

function generateRooms(height, width, minSize, iterations) {
  let splitVertically;
  let rooms = [
    {
      t: 0,
      l: 0,
      r: width - 1,
      b: height - 1
    }
  ];

  let iterationCount = 0;

  while (iterationCount < iterations) { // iteratively split existing rooms
    let newRooms = [];
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      splitVertically = randBool(); // splitting direction
      // check minimum height / width
      const space = splitVertically ? room.r - room.l : room.b - room.t;
      if (space < (minSize * 2)) { // can't split without violating minSize;
        newRooms.push(room);
        continue;
      }
      // determine where the wall will go
      const split = splitVertically ?
                  getRandomIntInclusive(room.l + minSize, room.r - minSize) : // split width
                  getRandomIntInclusive(room.t + minSize, room.b - minSize)  // split height
      // create new rooms
      const roomA = {
        t: room.t,
        l: room.l,
        b: splitVertically ? room.b : split - 1,
        r: splitVertically ? split - 1: room.r
      };
      const roomB = {
        t: splitVertically ? room.t : split + 1,
        l: splitVertically ? split + 1 : room.l,
        b: room.b,
        r: room.r
      };
      // add to new rooms
      newRooms.push(roomA);
      newRooms.push(roomB);
    }
    rooms = newRooms;
    iterationCount++;
  }

  return {
    rooms: rooms,
    height: height,
    width: width
  };
}

function randBool() {
  return Math.random() > 0.5
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min +1)) + min;
}

function drawMap(dungeon) {
  let {rooms, height, width} = dungeon;
  // set up map
  let map = [];
  for (let r=0; r < height; r++) {
    map.push('*'.repeat(width).split(''))
  };

  // fill out map
  rooms.forEach(function (room) {
    for (let x = room.t; x <= room.b; x++) {
      for (let y = room.l; y <= room.r; y++) {
        map[x][y] = ' ';
      }
    }
  });

  return map;
}

export default App;

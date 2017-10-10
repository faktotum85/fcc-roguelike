import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();



    this.state = {
      grid:
    }
  }

  render() {
    return (
      <div className="App">
      </div>
    );
  }
}

function generateRooms(height, width, minSize, iterations) {
  var splitVertically = true;
  var rooms = [
    {
      startingPoint: [0, 0],
      height: height,
      width: width
    }
  ];

  var iterationCount = 0;

  while (iterationCount < iterations) { // iteratively split existing rooms
    var newRooms = [];
    for (var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      splitVertically = randBool(); // splitting direction
      // check minimum height / width
      var space = splitVertically ? room.width : room.height;
      if (space < (minSize * 2 + 1)) { // can't split without violating minSize;
        newRooms.push(room);
        continue;
      }
      // determine where the wall will go
      var split = splitVertically ?
                  getRandomIntInclusive(room.startingPoint[1] + minSize, room.startingPoint[1] + room.width - minSize - 1) : // split width
                  getRandomIntInclusive(room.startingPoint[0] + minSize, room.startingPoint[0] + room.height - minSize - 1)  // split height
      // create new rooms
      var roomA = {
        startingPoint: room.startingPoint,
        height: splitVertically ? room.height : (split - room.startingPoint[0]),
        width: splitVertically ? (split - room.startingPoint[1]) : room.width,
      };
      var roomB = {
        startingPoint: splitVertically ?
          [room.startingPoint[0], split + 1] :
          [split + 1, room.startingPoint[1]],
        height: splitVertically ? room.height : (room.startingPoint[0] + room.height - split - 1),
        width: splitVertically ? (room.startingPoint[1] + room.width - split - 1) : room.width
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
  var rooms = dungeon.rooms;
  var height = dungeon.height;
  var width = dungeon.width;
  // print map to console
  var map = [];
  for (var x=0; x < height; x++) {
    var row = [];
    for (var y=0; y < width; y++) {
      row.push('*');
    }
    map.push(row);
  }

  rooms.forEach(function (room) {
    for (var rh = room.startingPoint[0]; rh < (room.startingPoint[0] + room.height); rh++) {
      for (var rw = room.startingPoint[1]; rw < (room.startingPoint[1] + room.width); rw++) {
        map[rh][rw] = ' ';
      }
    }
  });
  var out = '*'.repeat(width + 2);
  map.forEach(function(row) {
    out += '\n*' + row.join('') + '*';
  });
  out += '\n' + '*'.repeat(width + 2);
  console.log(out);
}

export default App;

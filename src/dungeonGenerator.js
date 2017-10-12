export default function generateDungeon(options) {

  const {height, width, numHealth, numEnemies, stage} = options;

  const rooms = generateRooms(options);
  const doors = generateDoors(rooms);

  const dungeon = turnIntoGrid({
    rooms: rooms,
    doors: doors,
    height: height,
    width: width
  });

  placeItem(dungeon, 'H', numHealth);
  placeItem(dungeon, 'W', 1);
  placeCreatures(dungeon, numEnemies, stage);

  return dungeon;
}

function generateRooms(options) {

  const {height, width, minSize, iterations} = options;
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
  return rooms;
}

function generateDoors(rooms) {
  const doors = [];
  let x, y;
  rooms.forEach(room => {
    if (room.t > 0) {
      x = getRandomIntInclusive(room.l, room.r);
      doors.push({x: x, y: room.t -1});
      if (room.t > 1) { // extend door by one in case it ends in a wall
        doors.push({x: x, y: room.t -2});
      }
    }

    if (room.l > 0) {
      y = getRandomIntInclusive(room.t, room.b)
      doors.push({x: room.l - 1, y: y})
      if (room.l > 1) { // extend door by one in case it ends in a wall
        doors.push({x: room.l - 2, y: y})
      }
    }
  })
  return doors;
}

// creates a 2d grid based on dugeon data
function turnIntoGrid(dungeon) {
  let {rooms, doors, height, width} = dungeon;
  // set up map
  const map = [];
  const spaces = [];

  for (let r=0; r < height; r++) {
    map.push('*'.repeat(width).split(''))
  };

  // fill out map
  rooms.forEach(function (room) {
    for (let x = room.l; x <= room.r; x++) {
      for (let y = room.t; y <= room.b; y++) {
        map[y][x] = ' ';
        spaces.push({x: x, y: y});
      }
    }
  });

  //add doors
  doors.forEach(function (door) {
    map[door.y][door.x] = ' ';
  });

  return {map, spaces};
}

function placeCreatures(dungeon, numEnemies, stage) {
  // place player
  dungeon.playerPos = placeItem(dungeon, 'P', 1)[0];
  const enemies = placeItem(dungeon, 'E', numEnemies);
  dungeon.enemies = {};
  enemies.forEach(enemy => {
    dungeon.enemies[enemy.y + '-' + enemy.x] = {
      health: stage * 50,
      level: stage
    };
  });
  if (stage === 4) { // final stage, add boss
    const bossPos = placeItem(dungeon, 'B', 1)[0];
    dungeon.enemies[bossPos.y + '-' + bossPos.x] = {
      health: 300,
      level: 6
    }
  }
}

function placeItem(dungeon, item, times) {
  const itemPos = [];
  for (let i=0; i<times; i++) {
    const itemPosIndex = getRandomIntInclusive(0, dungeon.spaces.length - 1);
    let newItemPos = dungeon.spaces[itemPosIndex];
    dungeon.map[newItemPos.y][newItemPos.x] = item;
    dungeon.spaces.splice(itemPosIndex, 1);
    itemPos.push(newItemPos);
  }
  return itemPos;
}

function randBool() {
  return Math.random() > 0.5
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min +1)) + min;
}

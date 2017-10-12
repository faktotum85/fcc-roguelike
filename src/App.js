import React, { Component } from 'react';
import generateDungeon from './dungeonGenerator';

class App extends Component {
  constructor(props) {
    super(props);

    const {height, width} = this.props;
    const dungeon = generateDungeon({
      height, width, minSize: 5, iterations: 5, numHealth: 3, numEnemies: 3, stage: 1
    });

    this.state = {
      map: dungeon.map,
      playerPos: dungeon.playerPos,
      enemies: dungeon.enemies,
      health: 100,
      attack: 1,
      level: 1,
      xp: 0,
      stage: 1,
      enemyCount: 3,
      gameState: 'play'
    }

    this.handleKeys = this.handleKeys.bind(this);
    this.act = this.act.bind(this);
    this.move = this.move.bind(this);
    this.fight = this.fight.bind(this);
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
        {this.state.map.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
              if (cell === ' ') {
                return <div key={colIndex} className="cell space"></div>
              } else if (cell === 'P') {
                return <div key={colIndex} className="cell player"></div>
              } else if (cell === 'H') {
                return <div key={colIndex} className="cell health"></div>
              } else if (cell === 'W') {
                return <div key={colIndex} className="cell weapon"></div>
              } else if (cell === 'E') {
                return <div key={colIndex} className="cell enemy"></div>
              } else if (cell === 'B') {
                return <div key={colIndex} className="cell boss"></div>
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
    // calculate Position player wants to move to
    const nextPos = {...this.state.playerPos};
    switch (e.code) {
      case 'ArrowUp':
        nextPos.y--;
        break;
      case 'ArrowDown':
        nextPos.y++;
        break;
      case 'ArrowLeft':
        nextPos.x--;
        break;
      case 'ArrowRight':
        nextPos.x++;
        break;
      default:
        break;
    }
    this.act(nextPos);
  }

  act(nextPos) {
    const {height, width} = this.props;
    // check if position is in bounds and free;
    if (nextPos.x >= 0 && nextPos.x <= width - 1 && nextPos.y >= 0 && nextPos.y <= height - 1) {
      const targetType = this.state.map[nextPos.y][nextPos.x];
      if (targetType === ' ') { // empty space
        this.move(nextPos);
      } else if (targetType === 'H') { // health power up
        this.setState({
          health: this.state.health + (this.state.level * 20)
        });
        this.move(nextPos);
      } else if (targetType === 'W') { // attack power up
        this.setState({
          attack: this.state.attack + 0.5
        });
        this.move(nextPos);
      }
      else if (targetType === 'E' || targetType === 'B') { // enemy
        const fightWon = this.fight(nextPos);
        if (fightWon) {
          if (targetType === 'B') {
            this.setState({gameState: 'won'});
            window.removeEventListener('keyup', this.handleKeys);
          }
          this.move(nextPos);
        }
      }
    }
    // check victory conditions
    if (this.state.enemyCount === 0 && this.state.gameState !== 'won') {
      this.levelUp();
    }
    if (this.state.health <= 0) {
      this.setState({gameState: 'lost'});
      window.removeEventListener('keyup', this.handleKeys);
    }
  }

  fight(nextPos) {
    let fightWon = false;
    let enemyCount = this.state.enemyCount
    let newHealth = this.state.health;
    let enemies = {...this.state.enemies};
    let enemy = enemies[nextPos.y + '-'+ nextPos.x];
    let newXp = this.state.xp;
    let xpReq = this.state.level * 100;
    let newLevel = this.state.level;

    // update state variables
    enemy.health -= this.state.level * this.state.attack * 20 * (Math.random() + 0.5);

    if (enemy.health <= 0) {
      enemyCount--;
      delete enemies[nextPos.y + '-'+ nextPos.x];
      fightWon = true;
      newXp += 50;
      if (newXp >= xpReq) {
        newLevel++;
        newXp = newXp - xpReq;
      }
    } else {
      newHealth -= enemy.level * 25 * (Math.random() + 0.5);
    }

    this.setState({
      enemies: enemies,
      health: newHealth,
      enemyCount: enemyCount,
      level: newLevel,
      xp: newXp
    });

    return fightWon;
  }

  move(nextPos) {
    const map = [...this.state.map];
    map[nextPos.y][nextPos.x] = 'P';
    map[this.state.playerPos.y][this.state.playerPos.x] = ' ';
    this.setState({
      playerPos: nextPos,
      map: map
    });
  }

  levelUp() {
    const {height, width} = this.props;
    const nextStage = this.state.stage + 1;
    const dungeon = generateDungeon({
      height, width, minSize: 5, iterations: 5, numHealth: 3, numEnemies: 3, stage: nextStage
    });
    this.setState({
      map: dungeon.map,
      playerPos: dungeon.playerPos,
      enemies: dungeon.enemies,
      stage: nextStage,
      enemyCount: 3 + (nextStage === 4 ? 1 : 0)
    });
  }
}

export default App;

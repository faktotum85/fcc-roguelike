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
    const playerRow = this.state.playerPos.y;
    const playerCol = this.state.playerPos.x;
    const rows = range(playerRow - 4, playerRow + 5)
    const cols = range(playerCol - 4, playerCol + 5);
    const {height, width} = this.props;

    return(
      <div className="game">
        <div className="board">
          {rows.map(row => {
            return (
              <div key={row} className="row">
                {cols.map(col => {
                  if (row < 0 || row > height - 1 || col < 0 || col > width - 1) {
                    return <div key={col} className="cell wall"></div>
                  }
                  const cell = this.state.map[row][col];
                  if (cell === ' ') {
                    return <div key={col} className="cell space"></div>
                  } else if (cell === 'P') {
                    return <div key={col} className="cell player"></div>
                  } else if (cell === 'H') {
                    return <div key={col} className="cell health"></div>
                  } else if (cell === 'W') {
                    return <div key={col} className="cell weapon"></div>
                  } else if (cell === 'E') {
                    return <div key={col} className="cell enemy"></div>
                  } else if (cell === 'B') {
                    return <div key={col} className="cell boss"></div>
                  } else {
                    return <div key={col} className="cell wall"></div>
                  }
                })}
              </div>
            )
          })}
        </div>
        <div className="stats">
          <div className="statWrapper">
            <i className="fa fa-heart" aria-hidden="true"></i>
            <div className="stat">{Math.round(this.state.health)}</div>
          </div>
          <div className="statWrapper">
            <i className="fa fa-bolt" aria-hidden="true"></i>
            <div className="stat">{this.state.attack}</div>
          </div>
          <div className="statWrapper">
            <i className="fa fa-lightbulb-o" aria-hidden="true"></i>
            <div className="stat">{this.state.xp}</div>
          </div>
          <div className="statWrapper">
            <i className="fa fa-plus-circle" aria-hidden="true"></i>
            <div className="stat">{this.state.level}</div>
          </div>
          <div className="gameState">
            {this.state.gameState === 'play' ? 'Stage ' + this.state.stage : this.state.gameState}
          </div>
        </div>
      </div>
    )
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
            this.setState({gameState: 'You Win!'});
            window.removeEventListener('keyup', this.handleKeys);
          }
          this.move(nextPos);
        }
      }
    }
    // check victory conditions
    if (this.state.enemyCount === 0 && this.state.gameState !== 'You Win!') {
      this.levelUp();
    }
    if (this.state.health <= 0) {
      this.setState({gameState: 'You Lose!'});
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

function range (start, end) {
  return Array.from({length: (end - start)}, (v, k) => k + start);
}


export default App;

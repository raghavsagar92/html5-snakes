
function init() {
  var canvas = document.getElementById('arena'); 
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

var Direction = {
  NONE: 0,
  LEFT: 1,
  UP: 2,
  RIGHT: 3,
  DOWN: 4
}

var Position = function (x, y) {
  this.x = x;
  this.y = y;
}

var UtilityFunctions = {
  getDirection: function (position1, position2) {
    if(position1.x == position2.x) {
      if(position1.y < position2.y)
        return Direction.DOWN;
      if(position1.y > position2.y)
        return Direction.UP;
      else
        return Direction.NONE;
    }
    if(position1.y == position2.y) {
      if(position1.x < position2.x)
        return Direction.RIGHT;
      if(position1.x > position2.x)
        return Direction.LEFT;
      else
        return Direction.NONE;
    }
    return Direction.NONE;
  },
  isPositionEqual: function (position1, position2) {
    if(position1.x == position2.x && position1.y == position2.y)
      return true;
    return false;
  }
}

var Block = {
  type: {
    NONE: 0,
    FENCE: 1
  },
  create: function(maxX, maxY, type) {
    var blocks = [];
    switch(type) {
      case this.type.FENCE:
        for(var i = 0; i <= maxX; ++i) {
          blocks.push(new Position(i, 0));
          blocks.push(new Position(i, maxY));
        }
        for(var i = 0; i <= maxY; ++i) {
          blocks.push(new Position(0, i));
          blocks.push(new Position(maxX, i));
        }
        break;
      default:
    }
    return blocks;
  }
}

var arena = {
  //static
  status: {
    EMPTY: 0,
    BLOCK: 1,
    SNAKE: 2,
    EGG: 3
  },

  //member
  maxX: 0,
  maxY: 0,
  step: 10,
  blockType: Block.type.FENCE,
  grid: [[]],

  init: function () {
    // grid boundaries
    this.maxX = Math.ceil(window.innerWidth/this.step) * this.step;
    this.maxY = Math.ceil(window.innerHeight/this.step) * this.step;
    var i,j,x,y;
    // set grid empty 
    this.grid = new Array(this.maxX+1);
    for (i = 0; i <= this.maxX; ++i) {
      this.grid[i] = new Array(this.maxY+1);
      for (j = 0; j <= this.maxY; ++j) {
        this.grid[i][j] = this.status.EMPTY;
      }
    }
  },

  initGrid: function() {
    // set blocks
    var blocks = Block.create(this.maxX, this.maxY, this.blockType);
    for (i = 0; i < blocks.length; ++i) {
      x = blocks[i].x;
      y = blocks[i].y;
      this.grid[x][y] = this.status.BLOCK;
    }

    // set initial snake
    var head = snake.paths[0][0];
    for (i = 0; i < snake.paths.length; ++i) {
      for (j = 0; j < snake.paths[i].length - 1; ++j) {
        var x1 = snake.paths[i][j].x;
        var y1 = snake.paths[i][j].y;
        var x2 = snake.paths[i][j+1].x;
        var y2 = snake.paths[i][j+1].y;
        if(x1 == x2) {
          x = x1;
          for(y = Math.min(y1, y2); y <= Math.max(y1, y2); ++y) {
            if(!UtilityFunctions.isPositionEqual(head, new Position(x, y))) {
              this.grid[x][y] = this.status.SNAKE;  
            }
          }
        }
        else if(y1 == y2) {
          y = y1;
          for(x = Math.min(x1, x2); x <= Math.max(x1, x2); ++x) {
            if(!UtilityFunctions.isPositionEqual(head, new Position(x, y))) {
              this.grid[x][y] = this.status.SNAKE;
            }
          }
        }
      }
    }
  },

  isEmpty: function (position) {
    return (this.grid[position.x][position.y] == this.status.EMPTY);
  },
  setEmpty: function (position) {
    this.grid[position.x][position.y] = this.status.EMPTY;
  },
  isEgg: function (position) {
    return (this.grid[position.x][position.y] == this.status.EGG);
  },
  isBlock: function (position) {
    return (this.grid[position.x][position.y] == this.status.BLOCK);
  },
  isSnake: function (position) {
    return (this.grid[position.x][position.y] == this.status.SNAKE);
  },
  setSnake: function (position) {
    this.grid[position.x][position.y] = this.status.SNAKE;
  }
}

var egg = {
  position: null,
  init: function() {
    this.reposition(arena.maxX, arena.maxY, arena.step);
  },
  reposition: function(maxX, maxY, step) {
    this.position = new Position(Math.floor(Math.floor(Math.random() * maxX) / step) * step,
                                 Math.floor(Math.floor(Math.random() * maxY) / step) * step);
  },
  draw: function() {
    $('canvas#arena').drawArc({
      layer: true,
      groups: ['egg'],
      strokeStyle: '#e60000',
      strokeWidth: 5,
      x: this.position.x, y: this.position.y,
      radius: 3
    });
  }
}

var snake = {
  paths: [],
  direction: Direction.NONE,
  newDirection: Direction.NONE,
  length: 50,
  init: function() {
    this.direction = Direction.RIGHT;
    var head = new Position(arena.maxX/2, arena.maxY/2);
    var tail = new Position(arena.maxX/2 - this.length*arena.step, arena.maxY/2);
    var path = [head, tail];
    this.paths.push(path);
  },

  isInsideArena: function(position) {
    return (position.x >= 0) && (position.x <= arena.maxX) && (position.y >= 0) && (position.y <= arena.maxY);
  },

  hitBorder: function(position, direction) {
    var head = null;
    var tail = null;
    var newHeadPath = [];
    switch(direction) {
      case Direction.UP:
        head = new Position(position.x, arena.maxY);
        tail = new Position(position.x, arena.maxY);
        break;
      case Direction.DOWN:
        head = new Position(position.x, 0);
        tail = new Position(position.x, 0);
        break;
      case Direction.LEFT:
        head = new Position(arena.maxX, position.y);
        tail = new Position(arena.maxX, position.y);
        break;
      case Direction.RIGHT:
        head = new Position(0, position.y);
        tail = new Position(0, position.y);
        break;
      default:
    }
    if(head && tail) {
      newHeadPath = [head, tail];
      this.paths.splice(0, 0, newHeadPath);  
    }
  },

  move: function() {
    if(this.direction == Direction.NONE)
      return;
    
    // Head border check
    var headPath = this.paths[0];
    if(!this.isInsideArena(headPath[0])) {
      this.hitBorder(headPath[0], this.direction);
    }

    // Tail border check
    var tailPath = this.paths[this.paths.length - 1];
    if(UtilityFunctions.isPositionEqual(tailPath[tailPath.length-2], tailPath[tailPath.length-1])) {
      tailPath.splice(-1, 1);
    }
    if(tailPath.length < 2) {
      this.paths.splice(-1, 1);
    }

    // Egg check
    headPath = this.paths[0];
    var incLength = false;
    if(UtilityFunctions.isPositionEqual(headPath[0], egg.position)) {
      egg.reposition(arena.maxX, arena.maxY, arena.step);
      incLength = true;
    }

    // Crash check
    var head = this.paths[0][0];
    if(arena.isSnake(head) || arena.isBlock(head)) {
      console.log("Crashed at x: " + head.x + " y: " + head.y);
      this.direction = Direction.NONE;
    }

    // Move head
    headPath = this.paths[0];
    arena.setSnake(headPath[0]);
    this.movePosition(headPath[0], this.direction);

    // Move tail
    tailPath = this.paths[this.paths.length - 1];
    var trailingDirection = UtilityFunctions.getDirection(tailPath[tailPath.length-1], tailPath[tailPath.length-2]);
    if(!incLength) {
      arena.setEmpty(tailPath[tailPath.length-1]);
      this.movePosition(tailPath[tailPath.length-1], trailingDirection);
    }
  },

  movePosition: function(position, direction) {
    switch(direction) {
      case Direction.UP:
        position.y -= arena.step;
        break;
      case Direction.DOWN:
        position.y += arena.step;
        break;
      case Direction.LEFT:
        position.x -= arena.step;
        break;
      case Direction.RIGHT:
        position.x += arena.step;
        break;
      default:
    }
  },
  updateDirection: function() {
    if(this.newDirection == Direction.NONE)
      return;
    if(this.newDirection == Direction.UP && this.direction == Direction.DOWN)
      return;
    if(this.newDirection == Direction.DOWN && this.direction == Direction.UP)
      return;
    if(this.newDirection == Direction.LEFT && this.direction == Direction.RIGHT)
      return;
    if(this.newDirection == Direction.RIGHT && this.direction == Direction.LEFT)
      return;
    var headPath = this.paths[0];
    var newPosition = new Position(headPath[0].x, headPath[0].y);
    headPath.splice(0, 0, newPosition);
    this.direction = this.newDirection;
    this.newDirection = Direction.NONE;
  },
  draw: function() {
    for (var i = 0; i < this.paths.length; ++i) {
      for (var j = 0; j < this.paths[i].length - 1; ++j) {
        $('canvas#arena').drawLine({
          layer: true,
          groups: ['snake'],
          strokeStyle: '#111',
          strokeWidth: 10,
          rounded: true,
          x1: this.paths[i][j].x, y1: this.paths[i][j].y,
          x2: this.paths[i][j+1].x, y2: this.paths[i][j+1].y
        });
      } 
    }
  }
}

$(document).ready(function() {
  init();
  arena.init();
  egg.init();
  snake.init();
  arena.initGrid();
  window.setInterval(function() {
    snake.updateDirection();
    snake.move();
    $('canvas#arena').removeLayers();
    egg.draw();
    snake.draw();
    $('canvas#arena').drawLayers();
  }, 100);  
});

$(document).keydown(function(evt) {
  switch(evt.keyCode) {
    case 37:
      snake.newDirection = Direction.LEFT;
      break;
    case 38:
      snake.newDirection = Direction.UP;
      break;
    case 39:
      snake.newDirection = Direction.RIGHT;
      break;
    case 40:
      snake.newDirection = Direction.DOWN;
      break;
  }
});

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

var snake = {
  paths: [],
  direction: Direction.NONE,
  newDirection: Direction.NONE,
  step: 10,
  maxX: 0,
  maxY: 0,
  init: function() {
    this.maxX = Math.ceil(window.innerWidth/this.step) * this.step;
    this.maxY = Math.ceil(window.innerHeight/this.step) * this.step;
    this.direction = Direction.RIGHT;
    var head = new Position(this.maxX/2, this.maxY/2);
    var tail = new Position(this.maxX/2 - 50*this.step, this.maxY/2);
    var path = [head, tail];
    this.paths.push(path);
  },

  isInsideArena: function(position) {
    return (position.x >= 0) && (position.x <= this.maxX) && (position.y >= 0) && (position.y <= this.maxY);
  },

  hitBorder: function(position, direction) {
    var head = null;
    var tail = null;
    var newHeadPath = [];
    switch(direction) {
      case Direction.UP:
        head = new Position(position.x, this.maxY-this.step);
        tail = new Position(position.x, this.maxY);
        break;
      case Direction.DOWN:
        head = new Position(position.x, this.step);
        tail = new Position(position.x, 0);
        break;
      case Direction.LEFT:
        head = new Position(this.maxX-this.step, position.y);
        tail = new Position(this.maxX, position.y);
        break;
      case Direction.RIGHT:
        head = new Position(this.step, position.y);
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
    if(tailPath.length < 2) {
      this.paths.splice(-1, 1);
    }

    // Move head
    headPath = this.paths[0];
    this.movePosition(headPath[0], this.direction);

    // Move tail
    tailPath = this.paths[this.paths.length - 1];
    var len = tailPath.length;
    var trailingDirection = UtilityFunctions.getDirection(tailPath[len-1], tailPath[len-2]);
    this.movePosition(tailPath[len-1], trailingDirection);
    if(UtilityFunctions.isPositionEqual(tailPath[len-2], tailPath[len-1])) {
      tailPath.splice(-1, 1);
    }
  },
  movePosition: function(position, direction) {
    switch(direction) {
      case Direction.UP:
        position.y -= this.step;
        break;
      case Direction.DOWN:
        position.y += this.step;
        break;
      case Direction.LEFT:
        position.x -= this.step;
        break;
      case Direction.RIGHT:
        position.x += this.step;
        break;
      default:
    }
  },
  updateDirection: function(direction) {
    if(this.newDirection == Direction.NONE)
      return;
    if(direction == Direction.UP && this.direction == Direction.DOWN)
      return;
    if(direction == Direction.DOWN && this.direction == Direction.UP)
      return;
    if(direction == Direction.LEFT && this.direction == Direction.RIGHT)
      return;
    if(direction == Direction.RIGHT && this.direction == Direction.LEFT)
      return;
    var headPath = this.paths[0];
    var newPosition = new Position(headPath[0].x, headPath[0].y);
    headPath.splice(0, 0, newPosition);
    this.direction = this.newDirection;
    this.newDirection = Direction.NONE;
  },
  draw: function() {
    $('canvas#arena').clearCanvas();
    for (var i = 0; i < this.paths.length; ++i) {
      for (var j = 0; j < this.paths[i].length - 1; ++j) {
        $('canvas#arena').drawLine({
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
  snake.init();
  window.setInterval(function() {
    snake.updateDirection();
    snake.move();
    snake.draw();
  }, 50);  
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
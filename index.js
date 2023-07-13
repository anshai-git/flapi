const canvas = document.getElementById("canvas");
canvas.style.width = '100%';
canvas.style.width = '100%';

Global               = {};
Global.canvas_width  = canvas.offsetWidth;
Global.canvas_height = canvas.offsetHeight;

canvas.width  = Global.canvas_width;
canvas.height = Global.canvas_height;
const ctx     = canvas.getContext("2d");

const Color = {
    BLACK         : 'rgb(0, 0, 0)',
    GOLD          : 'rgb(252, 157, 3)',
    COLLIDED_PIPE : 'rgba(252, 80, 68, 0.7)', // Light red marking the pipe that the circle collided with

    generate_color: function(red_range, green_range, blue_range, alpha_range) {
        let red     = Math.ceil(random(red_range[0], red_range[1]));
        let green   = Math.ceil(random(green_range[0], green_range[1]));
        let blue    = Math.ceil(random(blue_range[0], blue_range[1]));
        let alpha   = alpha_range ? `0.${Math.ceil(random(alpha_range[0], alpha_range[1]))}` : 1;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    },

    lv_1_color: function() {
        return this.generate_color([10, 50], [80, 120], [200, 220], null);
    },

    lv_2_color: function() {
        return this.generate_color([80, 120], [10, 50], [200, 220], null);
    },

    lv_3_color: function() {
        return this.generate_color([80, 120], [200, 220], [10, 50], null);
    },

    generate_pipe_color_by_level: function() {
        switch(true) {
            case (Global.score < 30): {
                return this.lv_1_color();
            } break;
            case (Global.score < 60): {
                return this.lv_2_color();
            } break;
            case (Global.score < 90): {
                return this.lv_3_color();
            } break;
       } 
    }
}

class PipePair {
    gap; counted;
    top_pipe; bottom_pipe;

    constructor(x_pos) {
        this.gap          = random(100, 200);
        this.counted      = false;
        // TODO:
        // consider setting the pipe width different for easier / harder levels
        // dynamic width, growing / shrinking pipes
        let color = Color.generate_pipe_color_by_level();
        this.top_pipe     = new Pipe(x_pos, 0, 50, Global.canvas_height/2 - this.gap/2, color, 0, 0, 5);
        this.bottom_pipe  = new Pipe(x_pos, Global.canvas_height/2 + this.gap/2, 50, Global.canvas_height, color, 0, 0, 5);
    }

    update() {
        this.top_pipe.update();
        this.bottom_pipe.update();
    }

    render(lag_offset) {
      this.top_pipe.render(lag_offset);
      this.bottom_pipe.render(lag_offset);

      //  // NOTE: Score incrementing
      //  increment_score(pipe);
    }
}

class Pipe {
    color;
    y_move_range; y_move_direction;

    pos_x; pos_y;
    old_pos_x; old_pos_y;

    width; height;
    old_width; old_height;

    y_velocity; x_velocity;

    constructor(x, y, width, height, color, y_move_range, y_velocity, x_velocity) {
        this.color       = color;

        this.pos_x       = x;
        this.pos_y       = y;

        this.old_pos_x   = x;
        this.old_pos_y   = y;

        this.height      = height;
        this.width       = width;

        this.old_height  = height;
        this.old_width   = width;

        this.y_move_range     = y_move_range;
        this.y_move_direction = true; // true = up, false = down

        this.y_velocity       = y_velocity;
        this.x_velocity       = x_velocity;
    }

    update() {
        this.pos_x -= 5; // (this.x_velocity + Global.pipe_x_boost);
    }

    render(lag_offset) {
        const path = new Path2D();
        ctx.fillStyle = this.color;

        let x = (this.pos_x - this.old_pos_x) * lag_offset + this.old_pos_x;
        let w = this.width;
        let h = (this.height - this.old_height) * lag_offset + this.old_height;

        // console.log(x);

        path.rect(
            x,
            this.pos_y,
            w,
            h)

        // path.rect(300, 0, 50, 200);

        ctx.fill(path);

        this.old_pos_x = this.pos_x;
        this.old_height = this.height;
    }
}

// For now, all collectables are circle shaped
class Collectable {
    pos_x; pos_y; radius; x_velocity; 
    old_pos_x; old_pos_y; collected;

    constructor(x, y, radius, x_velocity) {
        this.collected  = false;
        this.pos_x      = x;
        this.pos_y      = y;
        this.radius     = radius
        this.x_velocity = x_velocity;
        this.old_pos_x  = x;
        this.old_pos_y  = y;
    }

    has_collision(circle) {
        let dist_x = circle.pos_x - this.pos_x;
        let dist_y = circle.pos_y - this.pos_y;

        let dist   = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
        return dist <= circle.radius + this.radius;
    }

    render(lag_offset) {
        const circle = new Path2D();
        ctx.fillStyle = Color.GOLD;
        circle.arc(
            (this.pos_x - this.old_pos_x) * lag_offset + this.old_pos_x,
            (this.pos_y - this.old_pos_y) * lag_offset + this.old_pos_y,
            this.radius, 0, 2*Math.PI);

        // circle.arc(100, 100, 25, 0, 2*Math.PI);
        ctx.fill(circle);

        this.old_pos_x = this.pos_x;
        this.old_pos_y = this.pos_y;
    }

    update() {
        this.pos_x -= this.x_velocity;
    }
}

class SizeCoin extends Collectable {
    constructor(x, y, radius, x_velocity) {
        super(x, y, radius, x_velocity);
    }
    
    handle_collision() {
        // TODO: not working
        // if (this.collected) return;
        // if (this.has_collision(Global.circle)) Global.circle.radius -= 10;
        // this.collected = true;
    }

    update() {
        this.handle_collision();
        super.update();
    }
}

class Circle {
    is_alive;
    old_pos_x;
    old_pos_y;
    pos_y;
    pos_x;
    radius;

    x_velocity;
    y_velocity;

    jump_x_velocity;
    jump_y_velocity;
    color;
    bullets;

    constructor(x, y, x_vel, y_vel, radius, color) {
        this.radius = radius;
        this.color      = color;
        this.is_alive   = true;

        this.old_pos_x  = 0;
        this.old_pos_y  = 0;

        this.pos_y      = y;
        this.pos_x      = x;

        this.x_velocity = x_vel;
        this.y_velocity = y_vel;

        this.jump_x_velocity = 0;
        this.jump_y_velocity = 0;
        this.bullets = [];
    }

    update() {
        // TODO: Update bullets should not be here ?
        this.bullets.forEach(b => { b.update(); });
        
        this.pos_y += this.y_velocity + (-this.jump_y_velocity);

        // if jumping -> reduce the jump velocity proportionally to itself
        // so the jump velocity becomes smaller ever frame
        // => jump is slower as time passes
        if (this.jump_y_velocity > 0) this.jump_y_velocity -= this.jump_y_velocity/40;
        
        // shortcut to reset the jump_y_velocity to 0 if it drops under x
        // if (horizontal_velocity + jump_h_vel > 5 /* <- x */) jump_h_vel += -jump_h_vel/20;

        
        // if boosting -> reduce the boost velocity proportionally to itself
        // so the boost velocity becomes smaller ever frame
        // => boost is slower as time passes
        if (this.jump_x_velocity > 0) {

            // as the boost velocity is decreasing proportinally to itself
            // it takes too much time for it to drop to 0
            // if boost velocity drops under x -> automatically set it to 0
            if(this.jump_x_velocity < 1 /* <- x */) this.jump_x_vel = 0;

            // TODO diving byu 5 ?
            this.pos_x += this.jump_x_velocity/5;
            this.jump_x_velocity -= this.jump_x_velocity/5;
        } 

        // TODO: what was this ?
        if (this.pos_x > 100) {
            this.pos_x -= 2;
        } else {
            this.pos_x = 100;
        }
    }

    render(lag_offset) {
        const circle = new Path2D();
        ctx.fillStyle = Color.BLACK;
        circle.arc(
            (this.pos_x - this.old_pos_x) * lag_offset + this.old_pos_x,
            (this.pos_y - this.old_pos_y) * lag_offset + this.old_pos_y,
            this.radius, 0, 2*Math.PI);

        // circle.arc(100, 100, 25, 0, 2*Math.PI);
        ctx.fill(circle);

        this.old_pos_x = this.pos_x;
        this.old_pos_y = this.pos_y;
        
        // TODO: render bullets should not be here ?
        this.bullets.forEach(b => { b.render(lag_offset); });
    }

    jump() {
        this.jump_y_velocity = 15;
    }

    is_boost_in_progress() {
        return this.pos_x !== 100;
    }

    boost() {
        this.jump_x_velocity = 100;
    }

    shoot() {
        this.bullets.push(new Bullet(this.pos_x, this.pos_y, 3, 15, Color.Black));
    }
}

class Bullet {
    pos_x; pos_y;
    old_pos_x; old_pos_y;
    radius;
    x_velocity; color;

    constructor(pos_x, pos_y, radius, x_velocity, color) {
        this.pos_x      = pos_x; 
        this.pos_y      = pos_y; 
        this.radius     = radius;
        this.old_pos_x  = 0;
        this.old_pos_y  = 0;
        this.x_velocity = x_velocity;
        this.color      = color;
    }

    update() {
        this.pos_x += this.x_velocity;
    }

    render(lag_offset) {
        const circle = new Path2D();
        ctx.fillStyle = this.color;
        circle.arc(
            (this.pos_x - this.old_pos_x) * lag_offset + this.old_pos_x,
            (this.pos_y - this.old_pos_y) * lag_offset + this.old_pos_y,
            this.radius, 0, 2*Math.PI);

        ctx.fill(circle);

        this.old_pos_x = this.pos_x;
        this.old_pos_y = this.pos_y;
    }
}
    
Global.pipe_pairs      = [];
Global.collectables    = [];
Global.pipe_x_boost    = 0;
Global.score           = 0;
Global.frame_times     = [];
Global.fps             = 0;
Global.refresh_rate    = 100;
Global.start_time      = performance.now();   // Get the start time
Global.frame_duration  = 1000 / Global.refresh_rate; // Set the frame duration in milliseconds
Global.lag             = 0;                   // Initialize the lag offset

Global.circle = new Circle(100, 100, 0, 5, 25, Color.BLACK);

Global.calculate_lag_offset = function() {
    // TODO: Not sure if 'this' works here
    return this.lag / this.frame_duration;
}

Global.boost_pipes = function() {
    this.pipe_x_boost = 15;
}

function game_loop() {
    requestAnimationFrame(game_loop);

    let current_time = performance.now(),
        elapsed_time = current_time - Global.start_time;
    Global.start_time = current_time;

    // Add the elapsed time to the lag counter
    Global.lag += elapsed_time;
    while (Global.lag >= Global.frame_duration){
        // Update the logic
        update();
        // Reduce the lag counter by the frame duration
        Global.lag -= Global.frame_duration;
    }

    // Calculate the lag offset and use it to render the sprites
    render(Global.calculate_lag_offset());
    calculate_fps();
}

function update() {
    Global.circle.update(); 
    Global.collectables.forEach(c => { c.update(); });
    Global.pipe_pairs.forEach(p => { p.update(); });

    // TODO: explain this
    // if (Global.pipe_x_boost > 0) Global.pipe_x_boost -= Global.pipe_x_boost/50;
    // if (Global.pipe_x_boost < 1) Global.pipe_x_boost = 0;
    
    // filter out pipes that are out of view
    // if (Global.is_alive) Global.pipes = Global.pipes.filter(p => p.pos_x > -100);
    
    // update pipes
    // for (pair of Global.pipe_pairs) {
        // handle collision with a pipe
        // if (has_collision()) {
        //     // mark the pipe that we collided with by coloring it red
        //     pipe.color = Color.COLLIDED_PIPE;
        //     // start moving the pipe backwars
        //     pipe.x_velocity = -2;
        //     // set the is_alive flag => game over
        //     Global.is_alive = false; break;
        // }
        
        // Pipes Y movement
        // if (true) {
        //     if (pipe.h_direction) {
        //         pipe.height ++;
        //         pipe.gap -=2;
        //         if (pipe.h_range--  < 0) pipe.h_direction = false;
        //     } else {
        //         pipe.height --;
        //         pipe.gap +=2;
        //         if (pipe.h_range++  > 50) pipe.h_direction = true;
        //     }
        // }
        
        // if we reach this it means that we simply move the pipe in its natural way
        // pair.top_pipe.pos_x -= pair.top_pipe.x_velocity + Global.pipe_x_boost;
        // pair.bottom_pipe.pos_x -= pair.bottom_pipe.x_velocity + Global.pipe_x_boost;
    // }
}

function render(lag_offset) {
    ctx.clearRect(0, 0, Global.canvas_width, Global.canvas_height);

    Global.circle.render(lag_offset);
    Global.collectables.forEach(c => { c.render(lag_offset); });
    Global.pipe_pairs.forEach(p => { p.render(lag_offset); });

    // draw_pipes(lag_offset);
    // draw_score();

    // draw_fps();
    // draw_game_over_overlay(lag_offset);
}

function calculate_fps(){
    const now = performance.now();
    while (Global.frame_times.length > 0 && Global.frame_times[0] <= now - 1000) {
      Global.frame_times.shift();
    }
    Global.frame_times.push(now);
    fps = Global.frame_times.length;
}

function draw_fps() {
    ctx.fillStyle = 'rgb(245, 56, 56)';
    ctx.font      = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("FPS: " + fps, 50, 50);
}

function draw_pipes(lag_offset) {
    for (pipe of pipes) {
        // TODO: MOVED TO PIPE PAIR CLASS
    }
}

function has_collision(pipe) {
    return is_alive && (has_intersection({x: pos_x, y: pos_y, r: 25}, {x: pipe.pos_x, y: 0, width: 50, height: pipe.height}) || 
                         has_intersection({x: pos_x, y: pos_y, r: 25}, {x: pipe.pos_x, y: pipe.height + pipe.gap, width: 50, height: global.c_height}))
}

function increment_score(pipe) {
    if (is_alive && pipe.pos_x < pos_x && !pipe.counted) {
        score++;
        pipe.counted = true;
    }
}

function draw_score() {
    if (is_alive) {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font      = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score, global.c_width/2 - 25, 80);
    }
}

function draw_game_over_overlay() {
    if (!is_alive) {
        const go_overlay = new Path2D();
        go_overlay.rect(0, 0, global.c_width, global.c_height);

        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.fill(go_overlay);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font      = 'bold 150px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Game Over", global.c_width/2 - 25, global.c_height/2);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font      = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score, global.c_width/2 - 25, global.c_height/2 + 170);
    }
}

function create_pipe_pair(){
    Global.pipe_pairs.push(new PipePair(Global.canvas_width));
    setTimeout(create_pipe_pair, random(1000, 2000));
}

function create_size_coin() {
   Global.collectables.push(new SizeCoin(Global.canvas_width, random(100, Global.canvas_height - 100), 15, random(2, 6)));
   setTimeout(create_size_coin, random(300, 500));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function has_intersection ({ x: cx, y: cy, r: cr}, {x, y, width, height}) {
  const distX = Math.abs(cx - x - width / 2);
  const distY = Math.abs(cy - y - height / 2);

  if (distX > (width / 2 + cr)) {
    return false;
  }
  if (distY > (height / 2 + cr)) {
    return false;
  }

  if (distX <= (width / 2)) {
    return true;
  }
  if (distY <= (height / 2)) {
    return true;
  }

  const dx = distX - width / 2;
  const dy = distY - height / 2;

  return dx * dx + dy * dy <= cr * cr;
};

function main () {
    document.addEventListener("keydown", (event) => {
        if (!Global.circle.is_alive) return;
    
        switch(event.code) {
            case 'Space': {
                Global.circle.jump();  
            } break;
    
            case 'KeyQ': {
                if (Global.circle.is_boost_in_progress()) return;
                Global.boost_pipes();
                Global.circle.boost();
            } break;

            case 'KeyR': {
                Global.circle.shoot();
            } break;
    
            default: {
                // console.log('unknown input'); 
            } break;
        }
    });

    create_pipe_pair();
    create_size_coin();
    game_loop();
}

main();

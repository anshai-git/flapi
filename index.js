const canvas = document.getElementById("canvas");
canvas.style.width = '100%';
canvas.style.width = '100%';

global = {};
global.c_width  = canvas.offsetWidth;
global.c_height = canvas.offsetHeight;

canvas.width  = global.c_width;
canvas.height = global.c_height;
const ctx     = canvas.getContext("2d");

class Pipe {
    pos_x; pos_y; counted; color;
    h_range; height; gap; h_direction;
    old_pos_x; old_height; width;

    constructor(x, y) {
        this.pos_x       = x;
        this.pos_y       = y;
        this.counted     = false;
        this.color       = generate_pipe_color_by_level();
        this.h_range     = 50;
        this.height      = random(200, 300);
        this.gap         = random(300, 500);
        this.h_direction = true;
        this.old_pos_x   = x;
        this.old_height  = 0;
        this.width       = 80;
    }
}

let is_alive = true,
    old_pos_x   = 0,
    old_pos_y   = 0,
    pos_y       = 30,
    pos_x       = 100,

    horizontal_velocity = 10,
    vertical_velocity   = 10,

    jump_h_vel = 0,
    jump_v_vel = 0,
    
    pipes           = [],
    pipe_velocity   = 5,
    pipe_boost      = 0,
    score           = 0,
    
    pipe_horizontal_range    = 50,
    pipe_horizontal_velocity = 3,
    
    frame_times = [],
    fps         = 0,
    
    refresh_rate   = 100,
    //Get the start time
    start_time  = performance.now(),
    //Set the frame duration in milliseconds
    frame_duration = 1000 / refresh_rate,
    //Initialize the lag offset
    lag = 0;

function game_loop() {
    requestAnimationFrame(game_loop);

    let current_time = performance.now(),
        elapsed_time = current_time - start_time;
    start_time = current_time;

    //Add the elapsed time to the lag counter
    lag += elapsed_time;
    while (lag >= frame_duration){  
        //Update the logic
        update();
        //Reduce the lag counter by the frame duration
        lag -= frame_duration;
    }

    //Calculate the lag offset and use it to render the sprites
    var lag_offset = lag / frame_duration;
    render(lag_offset);

    calculate_fps();
}

function update() {
    // update circle positions
    pos_y += (horizontal_velocity + jump_h_vel);

    if (jump_h_vel < 0) jump_h_vel += -jump_h_vel/40;
    // if (horizontal_velocity + jump_h_vel > 5) jump_h_vel += -jump_h_vel/20;
    if (jump_v_vel > 0) { 
        if(jump_v_vel < 1) jump_v_vel = 0;
        pos_x += jump_v_vel/5;
        jump_v_vel -= jump_v_vel/5;
    } 

    if (pos_x > 100) pos_x -= 1;
    if (pipe_boost > 0) pipe_boost -= pipe_boost/50;
    if (pipe_boost < 1) pipe_boost = 0;
    
    // update pipe positions
    if (is_alive) pipes = pipes.filter(p => p.pos_x > -100);
    for (pipe of pipes) {
        if (has_collision(pipe)) {
            pipe.color = 'rgba(252, 80, 68, 0.7)';
            pipe_velocity = -2;
            is_alive = false;
        }

        if (true) {
            if (pipe.h_direction) {
                pipe.height ++;
                pipe.gap -=2;
                if (pipe.h_range--  < 0) pipe.h_direction = false;
            } else {
                pipe.height --;
                pipe.gap +=2;
                if (pipe.h_range++  > 50) pipe.h_direction = true;
            }
        }

        pipe.pos_x -= pipe_velocity + pipe_boost;
    }
}

function render(lag_offset) {
    draw_circle(lag_offset);
    draw_pipes(lag_offset);
    draw_score();

    draw_fps();
    draw_game_over_overlay(lag_offset);
}

function draw_circle(lag_offset) {
    const circle = new Path2D();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.clearRect(0, 0, global.c_width, global.c_height);
    circle.arc(
        (pos_x - old_pos_x) * lag_offset + old_pos_x,
        (pos_y - old_pos_y) * lag_offset + old_pos_y,
        25, 0, 2*Math.PI);
    ctx.fill(circle);

    old_pos_x = pos_x;
    old_pos_y = pos_y;
}

function calculate_fps(){
    const now = performance.now();
    while (frame_times.length > 0 && frame_times[0] <= now - 1000) {
      frame_times.shift();
    }
    frame_times.push(now);
    fps = frame_times.length;
}

function draw_fps() {
    ctx.fillStyle = 'rgb(245, 56, 56)';
    ctx.font      = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("FPS: " + fps, 50, 50);
}

function draw_pipes(lag_offset) {
    for (pipe of pipes) {
        const top_pipe    = new Path2D();
        const bottom_pipe = new Path2D();
        
        let x = (pipe.pos_x - pipe.old_pos_x) * lag_offset + pipe.old_pos_x;
        // const x = pipe.pos_x;
        let height = (pipe.height - pipe.old_height) * lag_offset + pipe.old_height;

        top_pipe.rect(
            x,              // start position x
            0,              // start position y
            pipe.width,     // width
            pipe.height);   // height

        bottom_pipe.rect(
            x,
            height + pipe.gap,
            pipe.width,
            global.c_height);
        
        ctx.fillStyle = pipe.color;
        ctx.fill(top_pipe);
        ctx.fill(bottom_pipe);
       
        increment_score(pipe);

        pipe.old_pos_x = pipe.pos_x;
        pipe.old_height = pipe.height;
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

function create_pipe(){
    pipes.push(new Pipe(global.c_width, random(5, 151)));
    setTimeout(create_pipe, random(1000, 2000));
}

function lv_1_color() {
    return generate_color([10, 50], [80, 120], [200, 220], [4, 8]);
}

function lv_2_color() {
    return generate_color([80, 120], [10, 50], [200, 220], [4, 8]);
}

function lv_3_color() {
    return generate_color([80, 120], [200, 220], [10, 50], [4, 8]);
}

function generate_color(red_range, green_range, blue_range, alpha_range) {
    let red     = Math.ceil(random(red_range[0], red_range[1]));
    let green   = Math.ceil(random(green_range[0], green_range[1]));
    let blue    = Math.ceil(random(blue_range[0], blue_range[1]));
    let alpha   = Math.ceil(random(alpha_range[0], alpha_range[1]));
    return `rgba(${red}, ${green}, ${blue}, 0.${alpha})`;
}

function generate_pipe_color_by_level() {
    switch(true) {
        case (score < 30): {
            return lv_1_color();
        } break;
        case (score < 60): {
            return lv_2_color();
        } break;
        case (score < 90): {
            return lv_3_color();
        } break;
   } 
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
        if (!is_alive) return;
    
        switch(event.code) {
            case 'Space': {
                jump_h_vel = -20; 
            } break;
    
            case 'KeyQ': {
                if (pipe_boost > 0) return;
                pipe_boost = 15;
                jump_v_vel = 100;
    
            } break;
    
            default: {
                // console.log('unknown input'); 
            } break;
        }
    });

    create_pipe();
    game_loop();
}

main();

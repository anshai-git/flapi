const canvas = document.getElementById("canvas");
canvas.style.width = '100%';
canvas.style.width = '100%';

global = {};
global.c_width = canvas.offsetWidth;
global.c_height = canvas.offsetHeight;

canvas.width = global.c_width;
canvas.height = global.c_height;
const ctx = canvas.getContext("2d");

class Pipe {
    pos_x;
    pos_y;
    counted = false;
    color;

    constructor(x, y) {
        this.pos_x = x;
        this.pos_y = y;
        this.counted = false;
        this.color = generate_pipe_color_by_level();
    }
}

is_alive = true;

let pos_y = 30;
let pos_x = 100;
let horizontal_velocity = 4;
let vertical_velocity = 4;
let jump_h_vel = 0;
let jump_v_vel = 0;

let pipes = [];
let pipe_velocity = 2;
let pipe_boost = 0;
let score = 0;

document.addEventListener("keydown", (event) => {
    if (!is_alive) return;

    switch(event.code) {
        case 'Space': {
            jump_h_vel = -12; 
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

function render() {
    const circle = new Path2D();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.clearRect(0, 0, global.c_width, global.c_height);
    circle.arc(pos_x, pos_y, 25, 0, 2*Math.PI);
    ctx.fill(circle);


    pos_y += (horizontal_velocity + jump_h_vel);
    if (jump_h_vel < 0) jump_h_vel += -jump_h_vel/50;
    if (jump_v_vel > 0) { 
        if(jump_v_vel < 1) jump_v_vel = 0;
        pos_x += jump_v_vel/5;
        jump_v_vel -= jump_v_vel/5;
    } 

    if (pos_x > 100) pos_x -= 1;

    pipes = pipes.filter(p => p.pos_x > -100);
    
    for (pipe of pipes) {
        const top = new Path2D();
        const bottom = new Path2D();

        top.rect(pipe.pos_x, 0, 50, (global.c_height/4) - pipe.pos_y/2);
        bottom.rect(pipe.pos_x, global.c_height - pipe.pos_y*2,  50, 500);
        
        ctx.fillStyle = pipe.color;
        ctx.fill(top);
        ctx.fill(bottom);
        
        if (is_alive && pipe.pos_x < pos_x && !pipe.counted) {
            score++;
            pipe.counted = true;
        }

        if (is_alive && (has_intersection({x: pos_x, y: pos_y, r: 25}, {x: pipe.pos_x, y: 0, width: 50, height: (global.c_height/4) - pipe.pos_y/2}) || 
                         has_intersection({x: pos_x, y: pos_y, r: 25}, {x: pipe.pos_x, y: global.c_height - pipe.pos_y*2, width: 50, height: 500}))) {
            pipe.color = 'rgba(252, 80, 68, 0.7)';
            pipe_velocity = -2;
            is_alive = false;
        }

        pipe.pos_x -= pipe_velocity + pipe_boost;
    }

    if (is_alive) {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score, global.c_width/2 - 25, 80);
    }

    if (pipe_boost > 0) pipe_boost -= pipe_boost/50;
    if (pipe_boost < 1) pipe_boost = 0;

    if (!is_alive) {
        const go_overlay = new Path2D();
        go_overlay.rect(0, 0, global.c_width, global.c_height);
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.fill(go_overlay);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = 'bold 150px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Game Over", global.c_width/2 - 25, global.c_height/2);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score, global.c_width/2 - 25, global.c_height/2 + 170);
    }

    requestAnimationFrame(render);
}

create_pipe();

function create_pipe(){
    pipes.push( new Pipe(global.c_width, random(5, 151)));
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
    console.log(true);
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

const has_intersection = ({ x: cx, y: cy, r: cr}, {x, y, width, height}) => {
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

requestAnimationFrame(render);

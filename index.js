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
        this.color = generate_blue_color();
    }
}

let pos_y = 30;
let pos_x = 100;
let horizontal_velocity = 4;
let jump_h_vel = 0;
let jump_v_vel = 0;

let pipes = [];
let pipe_velocity = -5;
let pipe_boost = 0;
let score = 0;

document.addEventListener("keydown", (event) => {
    switch(event.code) {

        case 'Space': {
            jump_h_vel = -12; 
        } break;

        // case 'ArrowUp': {
        //     let p = new Pipe(canvas.offsetWidth - 100, random(5, 151));
        //     pipes.push(p);
        // } break;

        case 'KeyQ': {
            if (pipe_boost > 0) return;

            pipe_boost = 15;
            jump_v_vel = 100;

            // pipes.push( new Pipe(canvas.offsetWidth + 50, random(5, 151)));
            // pipes.push( new Pipe(canvas.offsetWidth + 150, random(5, 151)));
            // pipes.push( new Pipe(canvas.offsetWidth + 240, random(5, 151)));
            // pipes.push( new Pipe(canvas.offsetWidth + 370, random(5, 151)));
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

        top.rect(pipe.pos_x, 0, 50, (global.c_height/2) - pipe.pos_y);
        bottom.rect(pipe.pos_x, global.c_height - pipe.pos_y*3,  50, 500);
        
        ctx.fillStyle = pipe.color;
        ctx.fill(top);
        ctx.fill(bottom);
        
        if (pipe.pos_x < pos_x && !pipe.counted) {
            score++;
            pipe.counted = true;
        }

        pipe.pos_x -= 2 + pipe_boost;
    }

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score, global.c_width/2 - 25, 80);

    if (pipe_boost > 0) pipe_boost -= pipe_boost/50;
    if (pipe_boost < 1) pipe_boost = 0;

    requestAnimationFrame(render);
}

create_pipe();

function create_pipe(){
    pipes.push( new Pipe(global.c_width, random(5, 151)));
    setTimeout(create_pipe, random(500, 1500));
}

function generate_blue_color() {
    return generate_color([10, 50], [80, 120], [200, 220], [4, 8]);
}

function generate_color(red_range, green_range, blue_range, alpha_range) {
    let red     = Math.ceil(random(red_range[0], red_range[1]));
    let green   = Math.ceil(random(green_range[0], green_range[1]));
    let blue    = Math.ceil(random(blue_range[0], blue_range[1]));
    let alpha   = Math.ceil(random(alpha_range[0], alpha_range[1]));
    return `rgba(${red}, ${green}, ${blue}, 0.${alpha})`;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}



requestAnimationFrame(render);

const canvas = document.getElementById("canvas");
canvas.style.width = '100%';
canvas.style.width = '100%';
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext("2d");

class Pipe {
    pos_x;
    pos_y;
    counted = false;

    constructor(x, y) {
        this.pos_x = x;
        this.pos_y = y;
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
            pipe_boost = 15;
            jump_v_vel = 100;
        } break;

        default: {
            console.log('unknown input'); 
        } break;
    }
});

function render() {
    const circle = new Path2D();
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    circle.arc(pos_x, pos_y, 25, 0, 2*Math.PI);

    pos_y += (horizontal_velocity + jump_h_vel);
    if (jump_h_vel < 0) jump_h_vel += -jump_h_vel/50;
    if (jump_v_vel > 0) { 
        if(jump_v_vel < 5) jump_v_vel = 0;
        pos_x += jump_v_vel/5;
        jump_v_vel -= jump_v_vel/5;
    } 

    if (pos_x > 100) pos_x -= 1;

    pipes = pipes.filter(p => p.pos_x > -50);
    
    for (pipe of pipes) {
        const top = new Path2D();
        const bottom = new Path2D();

        top.rect(pipe.pos_x, 0, 50, (canvas.offsetHeight/2) - pipe.pos_y);
        bottom.rect(pipe.pos_x, canvas.offsetHeight - pipe.pos_y,  50, 200);

        ctx.fill(top);
        ctx.fill(bottom);
        
        if (pipe.pos_x < pos_x && !pipe.counted) {
            console.log(score++);
            pipe.counted = true;
        }

        pipe.pos_x -= 2 + pipe_boost;
    }

    if(pipe_boost > 0) pipe_boost -= pipe_boost/50;

    ctx.fill(circle);
    requestAnimationFrame(render);
}

function create_pipe(){
    pipes.push( new Pipe(canvas.offsetWidth, random(5, 151)));

    setTimeout(create_pipe, random(500, 2000));
}

create_pipe();

function random(min, max) {
    return Math.random() * (max - min) + min;
}

requestAnimationFrame(render);

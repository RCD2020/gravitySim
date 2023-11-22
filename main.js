simdiv = document.getElementById('sim');
let width = simdiv.offsetWidth;
let height = window.innerHeight;
let midX = width / 2;
let midY = height / 2;
const gravConst = 6.6743e-11;
let smscale = 10;
let mscale = 1*10**smscale;
const speed = 20;
var mouseX = 0;
var mouseY = 0;
const minRadius = 2;

function startSim() {
    simArea.start();
}

var simArea = {
    canvas : document.createElement('canvas'),
    start : function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        simdiv.appendChild(this.canvas)
        this.frameNo = 0;
        this.interval = setInterval(updateSimArea, speed);
    },
    clear : function() {
        this.context.clearRect(0, 0, width, height);
    }
}

function hex2num(hexa) {
    let num = Number('0x' + hexa);
    return num;
}

function num2hex(num) {
    num = num - num % 1;
    let hexa = num.toString(16);
    return hexa;
}

function averageColor(color1, color2) {
    let num1 = hex2num(color1.slice(1));
    let num2 = hex2num(color2.slice(1));
    let average = (num1 + num2) / 2;
    let avNoDec = average - (average % 1);
    let hexa = num2hex(avNoDec);
    let newColor = '#' + hexa;
    return newColor;
}

class Planet {
    constructor(
        mass, x, y, vectorX, vectorY, color, name, realRadius
    ) {
        this.mass = mass;
        this.x = x;
        this.y = y;
        if (realRadius / mscale >= minRadius) {
            this.radius = realRadius / mscale;
        } else {
            this.radius = minRadius;
        }

        this.vectorX = vectorX;
        this.vectorY = vectorY;
        this.color = color;
        this.name = name;
        this.realRadius = realRadius;
    }

    update() {
        this.x += this.vectorX;
        this.y += this.vectorY;

        // this.handleBounds();

        var ctx = simArea.context;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }

    newPull(planet) {
        if (this.mass == 0 || planet.mass == 0) {
            return 0;
        }

        // F(N) = 6.67e-11 * m1(kg) * m2(kg) / d^2(m)
        let distX = -(planet.x - this.x);
        let distY = planet.y - this.y;
        var dist = Math.sqrt(distX ** 2 + distY ** 2);
        dist *= mscale;

        // this.handleCombine(planet);

        var angle = Math.atan(distY / distX);
        if (distX > 0) {
            angle += Math.PI;
        }

        let force = (gravConst * this.mass * planet.mass) / (dist ** 2);
        let acceleration = force / this.mass;

        let yChange = -(Math.sin(angle) * acceleration);
        let xChange = Math.cos(angle) * acceleration;

        this.vectorX += xChange;
        this.vectorY += yChange;
    }

    writeCoords(textSpot=1) {
        var ctx = simArea.context;
        ctx.beginPath();

        ctx.fillStyle = this.color;
        ctx.font = '15px Arial';

        let spot = textSpot * 30;
        ctx.fillText(
            this.name + ': (' + this.x + ', ' + this.y + ')',
            10,
            spot
        );

        ctx.closePath();
    }

    writeMass(textSpot=1) {
        var ctx = simArea.context;
        ctx.beginPath();

        ctx.fillStyle = this.color;
        ctx.font = '15px Arial';

        let spot = textSpot * 20;
        ctx.fillText(
            this.name + ': ' + this.mass + 'kg',
            10,
            spot
        );

        ctx.closePath();
    }
}

// var planets = [
//     new Planet(1.989e30, midX, midY, 0, 0, "#FDB813", "Sun", 6.957e8),
//     new Planet(3.285e23, midX - 69.058e9 / mscale, midY, 0, (.9*3**9)/3**smscale, "#e5e5e5", "Mercury", 2.44e6),
//     new Planet(4.867e24, midX - 108.94e9 / mscale, midY, 0, (1*3**9)/3**smscale, "#a57c1b", "Venus", 6.0518e6),
//     new Planet(5.9724e24, midX - 151.78e9 / mscale, midY, 0, (1*3**9)/3**smscale, "#4f4cb0", "Earth", 6.3781e6),
//     new Planet(6.39e24, midX - 247.52e9 / mscale, midY, 0, (.8*3**9)/3**smscale, "#f0e7e7", "Mars", 3.39e6),
//     new Planet(9.1e20, midX - 413e9 / mscale, midY, 0, (.5*3**9)/3**smscale, "#d0c5d6", "Ceres", 476e3),
//     new Planet(1.89813e27, midX - 742.21e9 / mscale, midY, 0, (.4*3**9)/3**smscale, "#ebf3f6", "Jupiter", 69.911e6),
//     new Planet(5.683e26, midX - 1.4613e12 / mscale, midY, 0, (.9*3**8)/3**smscale, "#ceb8b8", "Saturn", 58.232e6),
//     new Planet(8.681e25, midX - 2.9365e12 / mscale, midY, 0, (.6*3**8)/3**smscale, "#e1eeee", "Uranus", 25.362e6),
//     new Planet(1.024e26, midX - 4.4729e12 / mscale, midY, 0, (.4*3**8)/3**smscale, "#5b5ddf", "Neptune", 24.622e6),
//     new Planet(1.309e22, midX - 5.91e12 / mscale, midY, 0, (.3*3**8)/3**smscale, "#fff1d5", "Pluto", 1.1883e6),
//     new Planet(3.1e21, midX - 6.847e12 / mscale, midY, 0, (.3*3**8)/3**smscale, "#c1440e", "Makemake", 715e3)
// ];

var planets = [];

const solarSystem = [
    [1.989e30, midX, midY, 0, 0, "#FDB813", "Sun", 6.957e8],
    [3.285e23, midX - 69.058e9 / mscale, midY, 0, (.9*3**9)/3**smscale, "#e5e5e5", "Mercury", 2.44e6],
    [4.867e24, midX - 108.94e9 / mscale, midY, 0, (1*3**9)/3**smscale, "#a57c1b", "Venus", 6.0518e6],
    [5.9724e24, midX - 151.78e9 / mscale, midY, 0, (1*3**9)/3**smscale, "#4f4cb0", "Earth", 6.3781e6],
    [6.39e24, midX - 247.52e9 / mscale, midY, 0, (.8*3**9)/3**smscale, "#f0e7e7", "Mars", 3.39e6],
    [9.1e20, midX - 413e9 / mscale, midY, 0, (.5*3**9)/3**smscale, "#d0c5d6", "Ceres", 476e3],
    [1.89813e27, midX - 742.21e9 / mscale, midY, 0, (.4*3**9)/3**smscale, "#ebf3f6", "Jupiter", 69.911e6],
    [5.683e26, midX - 1.4613e12 / mscale, midY, 0, (.9*3**8)/3**smscale, "#ceb8b8", "Saturn", 58.232e6],
    [8.681e25, midX - 2.9365e12 / mscale, midY, 0, (.6*3**8)/3**smscale, "#e1eeee", "Uranus", 25.362e6],
    [1.024e26, midX - 4.4729e12 / mscale, midY, 0, (.4*3**8)/3**smscale, "#5b5ddf", "Neptune", 24.622e6],
    [1.309e22, midX - 5.91e12 / mscale, midY, 0, (.3*3**8)/3**smscale, "#fff1d5", "Pluto", 1.1883e6],
    [3.1e21, midX - 6.847e12 / mscale, midY, 0, (.3*3**8)/3**smscale, "#c1440e", "Makemake", 715e3]
]

function addSolSys() {
    for (let x in solarSystem) {
        planets.push(new Planet(...solarSystem[x]));
    }
}

function random(low, high) {
    return (Math.random() * (high-low)) + low;
}

function randint(low, high) {
    var integer = random(low, high + 1);
    return Math.floor(integer);
}

function randPlanet() {
    planets.push(new Planet(...solarSystem[randint(0, 11)]))
}

function updateSimArea() {
    simArea.clear();
    simArea.frameNo += 1;

    for (let x in planets) {
        for (let y in planets) {
            if (x != y) {
                planets[x].newPull(planets[y]);
            }
        }
    }

    var offSet = 0;
    for (let x = 0; x < planets.length; x++) {
        if (planets[x - offSet].mass == 0) {
            let firstHalf = planets.slice(0, x - offSet);
            if (x - offSet != planets.length) {
                let secondHalf = planets.slice(x - offSet + 1);
                planets = firstHalf.concat(secondHalf);
            } else {
                planets = firstHalf;
            }

            offSet++;
            continue;
        }
        planets[x - offSet].update();
        planets[x - offSet].writeMass(x - offSet + 1);
    }
}

addSolSys();
startSim();
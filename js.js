"use strict";
/**
 * Du Thanh Minh - 21130444 - DH21DTC
 * */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let fireImg = new Image();
fireImg.src = "assets/fire.png";
let iceImg = new Image();
iceImg.src = "assets/ice.png";
let darkImg = new Image();
darkImg.src = "assets/dark-ball.png";
let poitionImg = new Image();
poitionImg.src = "assets/poition-ball.png";
let lifeImg = new Image();
lifeImg.src = "assets/heart.png";
let keyPressed = [];
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
let BRICK_HP = 20;
let BALL_DAME = 10;
let BALL_RADIUS = 10;
let LIFE = 3;
let PAUSED = true;
// let ballSpawnRate = 0.2;
let PADDLE_HP_REGEN = 0.02;
let PADDLE_MP_REGEN = 0.02;
let SPHERE_DROP_RATE = 0.00005;
let dropRate = 0.1;
let LEVEL = 1;
let requestID;
let skills = [{
        skillName: "Đại phân thân chi pháp",
        key: "J",
        des: "Ngay lập tức triệu hồi 3 quả cầu bay lên trên trời",
        isSkillCoolDown: false,
        coolDown: 10,
        manaCost: 20,
        isUnlocked: true,
    },
    {
        skillName: "Cường hóa vũ trang",
        key: "K",
        des: "Người chơi nhận được thêm 50% kích thước đồng thời tốc độ hồi máu được tăng mạnh",
        isSkillCoolDown: false,
        coolDown: 20,
        manaCost: 50,
        isUnlocked: false
    },
    {
        skillName: "Vũ điệu cuồng phong",
        key: "L",
        des: "Tất cả quả cầu được cường hóa sức mạnh và kích thước trong 5s",
        isSkillCoolDown: false,
        coolDown: 40,
        manaCost: 70,
        isUnlocked: false,
    }, {
        skillName: "Thái dương phi thiên",
        key: "R",
        des: "Lập tức vận khí công triệu hồi một đại thái dương sức mạnh không thể cản phá bay lên trời và nổ tung sau đó gây một lượng sát thương cực kỳ to lớn",
        isSkillCoolDown: false,
        coolDown: 50,
        manaCost: 100,
        isUnlocked: false,
    }

];

let inventories = [{
        name: "hp bottle",
        quantity: 5,
    },
    {
        name: "mp bottle",
        quantity: 5,
    },
];
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    distance(thatPoint) {
        let dx = this.x - thatPoint.x;
        let dy = this.y - thatPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
class Velocity {
    constructor(vX, vY) {
        this.vX = vX;
        this.vY = vY;
    }
    reverseX() {
        this.vX *= -1;
    }
    reverseY() {
        this.vY *= -1;
    }
}
class Shape {
    constructor(point, velocity) {
        this.point = point;
        this.velocity = velocity;
        this.opacity = 1;
        this.color = "255,255,0";
    }
    update() {
        this.point.x += this.velocity.vX;
        this.point.y += this.velocity.vY;
    }
    fadeOut(seconds) {
        let times = 10;
        let count = 0;
        let interval = setInterval(() => {
            count++;
            this.opacity = count % 2 === 0 ? 0.2 : 0.8;
            if (count > times) clearInterval(interval);
        }, (seconds * 1000) / times);
    }
}
class Paddle extends Shape {
    constructor(point, velocity, width, height) {
        super(point, velocity);
        this.width = width;
        this.height = height;
        this.hp = 100;
        this.mp = 100;
    }
    draw() {
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fillRect(this.point.x, this.point.y, this.width, this.height);
    }
    getCenterPoint() {
        return new Point(this.point.x + (this.width / 2), this.point.y + (this.height / 2));
    }
    updateHp() {
        this.hp += PADDLE_HP_REGEN;
        if (this.hp <= 0) {
            LIFE--;
            this.hp = 100;
            toggle("#canvas");
        }
        if (this.hp >= 100) {
            this.hp = 100;
        }
    }
    updateMp() {
        this.mp += PADDLE_MP_REGEN;
        if (this.mp >= 100) {
            this.mp = 100;
        }
    }
    update() {
        this.checkBallCollied();
        this.updateHp();
        this.updateMp();
        if (keyPressed[2]) { this.point.x -= this.velocity.vX; }
        if (keyPressed[3]) { this.point.x += this.velocity.vX; }
        if (keyPressed[4]) { this.width += 5; }
    }
    checkBallCollied() {
        if (this.point.x <= 0) { this.point.x = 0; } else if (this.point.x >= canvas.width - this.width) {
            this.point.x = canvas.width - this.width;
        }
    }
}
class Ball extends Shape {
    constructor(point, velocity, radius) {
        super(point, velocity);
        this.radius = radius;
        this.type = 0;
    }
    draw() {
        drawCircle
            (this.point.x, this.point.y, this.radius,
                `rgba(${this.color},${this.opacity}`);
    }
    getBottom() {
        return this.point.y + this.radius;
    }
    getTop() {
        return this.point.y - this.radius;
    }
    getRight() { return this.point.x + this.radius; }
    getLeft() { return this.point.x - this.radius; }
}
class Effect {
    constructor(text, value, color, type) {
        this.text = text;
        this.value = value;
        this.color = color;
        this.type = type;
    }
}
class Item extends Shape {
    constructor(point) {
        super(point, new Velocity(0, 3));
        this.radius = 18;
        this.effect = this.randomEffect();
    }
    randomEffect() {
        let random = Math.random();
        if (random > 0.5) {
            return new Effect("+1", 1, "white", "+");
        } else if (random > 0.3) {
            return new Effect("+2", 2, "lightBlue", "+");
        } else if (random > 0.2) {
            return new Effect("+5", 5, "yellow", "+");
        } else if (random > 0.1) {
            return new Effect("x2", 2, "green", "*");
        } else if (random > 0.05) {
            return new Effect("x3", 3, "violet", "*");
        } else if (random > 0.02) {
            return new Effect("x5", 5, "orange", "*");
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.point.x, this.point.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.effect.color;
        ctx.fill();
        ctx.stroke();
        ctx.font = '12pt Calibri';
        ctx.fillStyle = "black";
        ctx.textAlign = 'center';
        ctx.fillText(this.effect.text, this.point.x, this.point.y + 3);

    }
    activateEffect() {
        switch (this.effect.type) {
            case "+":
                createBall(this.effect.value, "down");
                break;
            case "*":
                createBall((balls.length * this.effect.value) - balls.length, "down");
                break;
            default:
                // statements_def
                break;
        }
    }
    colliedWithPaddle(paddle) {
        let xCollied =
            (Math.abs(this.point.x - paddle.getCenterPoint().x) - this.radius -
                (paddle.width / 2)) <= 0;
        let yCollied = (Math.abs(this.point.y - paddle.getCenterPoint().y) - this.radius -
            (paddle.height / 2)) <= 0;
        if (xCollied && yCollied) {
            this.activateEffect();
            return true;
        }
        return false;
    }

}
class Sphere extends Shape {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.width = 30;
        this.image = null;
    }
    setImage(image) {
        this.image = image;
    }

    draw() {
        ctx.drawImage(this.image, this.point.x, this.point.y, this.width, this.width);
    }
    isColliedWithPaddle(paddle) {
        let xCollied =
            (Math.abs(this.point.x - paddle.getCenterPoint().x) - this.width -
                (paddle.width / 2)) <= 0;
        let yCollied = (Math.abs(this.point.y - paddle.getCenterPoint().y) - this.width -
            (paddle.height / 2)) <= 0;
        if (xCollied && yCollied) {
            return true;
        }
        return false;
    }
}
class Fire extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.damage = 20;
        this.setImage(fireImg);
    }
    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            paddle.hp -= this.damage;
            toggle("assets/fire-screen.png");
            return true;
        }
        return false;
    }
}
class Ice extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.damage = 5;
        this.setImage(iceImg);
    }
    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            paddle.hp -= this.damage;
            paddle.color = "165, 242, 243";
            paddle.velocity.vX = 7.5;
            toggle("assets/ice-screen.png");
            setTimeout(() => {
                paddle.fadeOut(2);
            }, 3000);

            setTimeout(() => {
                paddle.color = "255,255,0";
                paddle.velocity.vX = 15;
            }, 5000);
            return true;
        }
        return false;
    }
}

class Poition extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.damage = 5;
        this.setImage(poitionImg);
    }
    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            let count = 0;
            let screen = $("#screen-img");
            let target = $(".wraper");
            screen.attr("src", "assets/toxic-screen.jpg");
            target.css("visibility", "visible");
            let interval = setInterval(() => {
                paddle.hp -= this.damage;
                count++;
                target.css("opacity", count % 2 === 0 ? "0.7" : "0.3");
                if (count === 5) {
                    clearInterval(interval);
                }
            }, 500);
            setTimeout(() => {
                paddle.fadeOut(2);
            }, 3000);
            setTimeout(() => {
                target.css("visibility", "hidden");
            }, 2500);
            return true;
        }
        return false;
    }
}
class Dark extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.damage = 5;
        this.setImage(darkImg);
    }
    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            paddle.hp -= this.damage;
            paddle.color = "0, 98, 255";
            paddle.velocity.reverseX();
            setTimeout(() => {
                paddle.fadeOut(2);
            }, 3000);
            setTimeout(() => {
                paddle.opacity = 1.0;
                paddle.color = "255,255,0";
                paddle.velocity.reverseX();
            }, 5000);


            return true;
        }
        return false;
    }
}



class Brick extends Shape {
    constructor(point) {
        super(point, null);
        this.hp = BRICK_HP;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.dropFireRate = SPHERE_DROP_RATE;
    }
    draw() {
        ctx.fillStyle = "grey";
        ctx.fillRect(this.point.x, this.point.y, this.width, this.height);
        ctx.fillStyle = "red";
        ctx.fillRect(this.point.x, this.point.y, this.width * (this.hp / BRICK_HP), this.height);

    }
    /**
     * Check if this brick collied with a given ball;
     * **/
    colliedWithBall(ball) {
        let nearestX = Math.max(this.point.x, Math.min(ball.point.x, this.point.x + BRICK_WIDTH));
        let nearestY = Math.max(this.point.y, Math.min(ball.point.y, this.point.y + BRICK_HEIGHT));
        let nearestPoint = new Point(nearestX, nearestY);
        let distance = ball.point.distance(nearestPoint);
        if (distance <= ball.radius) {
            if (ball.type === 0) {
                ball.velocity.reverseY();
                ball.point.y += ball.point.y > this.point.y ? 5 : -5;
                dropItem(this.point.x, this.point.y);
                this.hp -= BALL_DAME;
            }
            this.hp -= (BALL_DAME / 2);
            return true;
        }
        return false;
    }
    collied(balls) {
        return balls.some(ball => this.colliedWithBall(ball));
    }
    dropFire() {
        if (Math.random() < this.dropFireRate) {
            let randomBall = Math.ceil(Math.random() * 4);
            switch (randomBall) {
                case 1:
                    spheres.push(new Ice(new Point(this.point.x, this.point.y)));
                    break;
                case 2:
                    spheres.push(new Fire(new Point(this.point.x, this.point.y)));
                    break;
                case 3:
                    spheres.push(new Poition(new Point(this.point.x, this.point.y)));
                    break;
                case 4:
                    spheres.push(new Dark(new Point(this.point.x, this.point.y)));
                    break;

                default:
                    // statements_def
                    break;
            }
        }
    }

}

function dropItem(x, y) {
    if (Math.random() < dropRate) {
        items.push(new Item(new Point(x, y)));
    }
}

let ball = new Ball(new Point(canvas.width / 2 + 50, canvas.height - 33), new Velocity(3, 3), BALL_RADIUS);
let balls = [ball];
let bricks = generateBicks();
let paddle1 = new Paddle(new Point(canvas.width / 2, canvas.height - 20), new Velocity(15, 15), 100, 20);
let items = [];
let spheres = [];

init("Press space to start");

function init(title) {
    updateStats();
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "yellow";
    paddle1.draw();
    ball.draw();
    bricks.forEach(brick => {
        brick.draw();
    });

    ctx.font = '50pt Calibri';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

}

function generateBicks() {
    let bricks = [];
    let rows = 3;
    let columns = 11;
    let gap = 5;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            bricks.push(new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 100), BRICK_HP));
        }
    }
    return bricks;
}

function toggle(screenImg) {
    let screen = $("#screen-img");
    let target = $(".wraper");
    screen.attr("src", screenImg);
    target.css("visibility", "visible");
    for (let i = 0; i < 3; i++) {
        target.css("opacity", "0.7");
        setTimeout(() => {
            target.css("opacity", "0.3");
        }, 500);
    }

    setTimeout(() => {
        // target.removeClass("animate__animated animate__shakeX animate__faster");
        target.css("visibility", "hidden");
    }, 2000);
}

function checkWallCollision() {
    balls.forEach(ball => {
        if (ball.getTop() <= 0) {
            ball.point.x += 2;
            ball.velocity.reverseY();
        }
        if (ball.getRight() >= canvas.width) {
            ball.point.y += 2;
            ball.velocity.reverseX();
        }
        if (ball.getLeft() <= 0) {
            ball.point.y += 2;
            ball.velocity.reverseX();

        }
    });
    let filterBalls = balls.filter(ball => {
        return ball.getBottom() <= canvas.height;
    });
    balls = filterBalls;
}

function isCollied(balls, paddle) {
    balls.forEach(ball => {
        let xCollied =
            (Math.abs(ball.point.x - paddle.getCenterPoint().x) - ball.radius -
                (paddle.width / 2)) <= 0;
        let yCollied = (Math.abs(ball.point.y - paddle.getCenterPoint().y) - ball.radius -
            (paddle.height / 2)) <= 0;
        if (xCollied && yCollied) {
            ball.point.y -= 2;
            ball.velocity.reverseY();
        }
    });
}

function checkBricksCollied() {
    let fillterdBricks = bricks.filter(brick => {
        brick.collied(balls);
        return brick.hp > 0;
    });
    bricks = fillterdBricks;
}

function checkItemCollied() {
    let fillterdItems = items.filter(item => {
        return !item.colliedWithPaddle(paddle1);
    });
    items = fillterdItems;
}

function checkFireCollied() {
    let fillterdspheres = spheres.filter(sphere => {
        return !sphere.colliedWithPaddle(paddle1);
    });
    spheres = fillterdspheres;
}

function checkLose() {
    if (balls.length <= 0) {
        LIFE--;
        toggle("assets/blood-screen.png");
        generateBall();
    }
    if (LIFE === 0) {
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        location.reload();
        cancelAnimationFrame(requestID);
    }
}

function checkWin() {
    if (bricks.length <= 0) {
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(requestID);
        init("Bạn đã chiến thắng");
    }
}

function updateLife() {
    const lifeCanvas = document.getElementById("life-canvas");
    const lifeCtx = lifeCanvas.getContext('2d');
    lifeCtx.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
    for (let i = 1; i <= LIFE; i++) {
        lifeCtx.drawImage(lifeImg, i * 35, 0, 30, 30);
    }
}

function updateSkills() {
    skills.forEach((skill, index) => {
        let skillDiv = $("#skill-" + (index + 1));
        if (!skill.isUnlocked) {
            skillDiv.css("filter", "grayscale(100%)");
        }
        skillDiv.find(".mana-cost").text(skill.manaCost);
        skillDiv.find(".skill-name").text(skill.skillName);
        skillDiv.find(".skill-key").text(`${skill.key}]`);
        skillDiv.find(".skill-mana").text(`${skill.manaCost} Mana`);
        skillDiv.find(".skill-cooldown").text(`${skill.coolDown}s Cooldown`);
        skillDiv.find(".skill-text").text(`${skill.des}`);
        if (paddle1.mp < skill.manaCost) {
            skillDiv.css("opacity", "0.5");
        } else {
            skillDiv.css("opacity", "1");
        }
    });
}

function updateInventories() {
    inventories.forEach((item, index) => {
        if (item.quantity > 0) {
            $("#lot-" + (index + 9)).find(".quantity").text("X" + item.quantity);
        } else {
            $("#lot-" + (index + 9)).children().css("visibility","hidden");    
        }
    });
}

function updateStats() {
    updateLife();
    updateSkills();
    updateInventories();
    $("#damage-atk").text(BALL_DAME);
    $("#primary-radius").text(BALL_RADIUS);
    $("#item-drop-rate").text(dropRate * 100 + "%");
    $(".hp-bar-real").css("width", paddle1.hp + "%");
    $(".mp-bar-real").css("width", paddle1.mp + "%");
    $("#hp-regen").text(PADDLE_HP_REGEN.toFixed(2));
    $("#mp-regen").text(PADDLE_MP_REGEN.toFixed(2));
}

function update() {
    updateStats();
    ball.update();
    balls.forEach(ball => {
        ball.update();
    });
    items.forEach(item => {
        item.update();
    });
    spheres.forEach(sphere => {
        sphere.update();
    });
    paddle1.update();
    checkWallCollision();
    isCollied(balls, paddle1);
    checkBricksCollied();
    checkItemCollied();
    checkFireCollied();
    checkWin();
    checkLose();
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        ball.draw();
    });
    paddle1.draw();
    bricks.forEach(brick => {
        brick.draw();
        brick.dropFire();
    });
    items.forEach((item) => {
        item.draw();
    });
    spheres.forEach((sphere) => {
        sphere.draw();
    });

}

function createCollDownAnimation(skill, coolDown) {
    let target = $("#skill-" + skill);
    let coolDownMili = coolDown * 1000;
    const UPDATE_INTERVAL = 1000 / 60;
    let time = coolDownMili - UPDATE_INTERVAL;
    target.css("--time-left", "100%");
    const intervalId = setInterval(() => {
        const passedTime = time / coolDownMili * 100;
        target.css("--time-left", passedTime + "%");
        time -= UPDATE_INTERVAL;
        if (time < 0) {
            clearInterval(intervalId);
        }
    }, UPDATE_INTERVAL);
}

function useItem(item) {

    switch (item) {
        case "mp":
            castSkill("+20 mana", false);
            paddle1.mp += 20;
            inventories[1].quantity--;
            break;
        case "hp":
            paddle1.mp += 20;
            inventories[0].quantity--;
            break;
        default:
            // statements_def
            break;
    }
}

function castSkill(skillName, isUlti) {
    let skillE = $("<h3>");
    skillE.addClass('skill-cast animate__animated');
    skillE.addClass('animate__fadeOutUp');
    skillE.text(skillName);
    let fontSize = isUlti ? "3.5rem" : "2.5rem";
    skillE.css("left", isUlti ? 200 : 300);
    skillE.css("font-size", fontSize);
    skillE.css("bottom", 50);
    $(".game-board").append(skillE);
    setTimeout(() => {
        $(".skill-cast").remove();
    }, 2000);
}

/**
 * Ham xu ly khi nguoi dung su dung skill
 * Neu nhu skill co kha thuc thi 
 **/
function useSkill(skill) {
    if (PAUSED) return;
    let skillObject = skills[skill - 1];
    let isSkillCoolDown = skillObject.isSkillCoolDown;
    let coolDown = skillObject.coolDown;
    let manaCost = skillObject.manaCost;
    let isUnlocked = skillObject.isUnlocked;
    if (isSkillCoolDown) {
        castSkill("Kỹ năng đang hồi", false);
        return;
    } else if (paddle1.mp < manaCost) {
        castSkill("Không đủ mana", false);
        return;
    } else if (!isUnlocked) {
        castSkill("Kỹ năng chưa mở khóa", false);
        return;
    }
    switch (skill) {
        case 1:
            castSkill(skillObject.skillName, false);
            createBall(5, "up");
            paddle1.mp -= manaCost;
            skillObject.isSkillCoolDown = true;
            createCollDownAnimation(1, coolDown);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);
            break;
        case 2:
            castSkill(skillObject.skillName, false);
            paddle1.width += 100;
            PADDLE_HP_REGEN += 0.1;
            skillObject.isSkillCoolDown = true;
            paddle1.mp -= manaCost;
            paddle1.color = "255,140,0";
            createCollDownAnimation(2, coolDown);
            setTimeout(() => {
                paddle1.color = "255,255,0";
                paddle1.width = 100;
                PADDLE_HP_REGEN -= 0.1;
            }, 5 * 1000);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);
            break;
        case 3:
            castSkill(skillObject.skillName, false);
            skillObject.isSkillCoolDown = true;
            paddle1.mp -= manaCost;
            createCollDownAnimation(3, coolDown);
            BALL_DAME *= 1.5;
            balls.forEach(ball => {
                ball.radius += 10;
                ball.color = "255,255,255";
            });
            setTimeout(() => {
                let count = 0;
                let interval = setInterval(() => {
                    let flag = count % 2 === 0 ? true : false;
                    balls.forEach(ball => {
                        ball.opacity = flag ? 0.3 : 1;
                        ball.color = "255,255,255";
                    });
                    count++;
                    if (count == 20) clearInterval(interval);
                }, 100);
            }, 3 * 1000);
            setTimeout(() => {
                BALL_DAME /= 1.5;
                balls.forEach(ball => {
                    ball.radius -= 10;
                    ball.color = "255,0,0";
                });
            }, 5 * 1000);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);
            break;
        case 4:
            castSkill(skillObject.skillName, true);
            skillObject.isSkillCoolDown = true;
            paddle1.mp -= manaCost;
            let superBall = createSuperBall();
            createCollDownAnimation(4, coolDown);
            setTimeout(() => {
                let count = 0;
                superBall.velocity.vY = 0;
                let interval = setInterval(() => {
                    count++;
                    let randomSize = (Math.random() + 1);
                    let flag = count % 2 === 0;
                    let newRadius = 50 * randomSize;
                    superBall.radius = newRadius;
                    let newX = flag ? superBall.point.x + superBall.radius :
                        superBall.point.x - superBall.radius;
                    superBall.point.x = newX;
                    if (count === 10) {
                        clearInterval(interval);
                    }
                }, 100);
            }, 1200);
            setTimeout(() => {
                balls = balls.filter(ball => {
                    return ball.type === 0;
                });
            }, 2 * 1000);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);
            break;
        default:
            break;
    }
}

function createSuperBall() {
    let superBall = new Ball(
        new Point(paddle1.point.x, paddle1.point.y - 100), new Velocity(0, -5), 50);
    superBall.type = 1;
    superBall.color = "242,125,12";
    balls.push(superBall);
    return superBall;
}

function generateBall() {
    let y = canvas.height - 30;
    let vY = -5;
    let vX = 5;
    let x = paddle1.point.x + paddle1.width / 2;
    balls.push(new Ball(new Point(x, y), new Velocity(vX, vY), BALL_RADIUS));
}

function createBall(ballNumber, direction) {
    let y = direction === "up" ? canvas.height - 30 : canvas.height / 2;
    let vY = direction === "up" ? -5 : 5;
    let vX = 5;
    let count = 0;
    let interval = setInterval(() => {
        count++;
        let x = Math.ceil(Math.random() * canvas.width / 2);
        balls.push(new Ball(new Point(x, y), new Velocity(vX, vY), BALL_RADIUS));
        if (count === ballNumber) clearInterval(interval);
    }, 100);
}

function clearReact() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startGame(level) {
    PAUSED = false;
    LEVEL = level;
    $(".game-menu").hide();
    $(".level-label").text("Level:" + level);
    switch (level) {
        case 1:
            clearReact();
            loop();
            break;
        case 2:
            ball = new Ball(new Point(canvas.width / 2 + 50, canvas.height - 33), new Velocity(3, 3), BALL_RADIUS);
            balls = [ball];
            BRICK_HP = 100;
            SPHERE_DROP_RATE = 0.00010;
            bricks = generateBicks();
            clearReact();
            loop();
            break;

        default:
            // statements_def
            break;
    }
}

function pause() {
    PAUSED = !PAUSED;
    if (PAUSED) {
        $(".game-menu").show();
    } else startGame(LEVEL);
}

function loop() {
    if (!PAUSED) {
        cancelAnimationFrame(requestID);
        requestID = window.requestAnimationFrame(loop);
        update();
        draw();
    }
}
$(document).on("keydown", event => {
    let key = event.key;
    if (key === "s") {
        keyPressed[0] = true;
    } else if (key === "w") {
        keyPressed[1] = true;
    } else if (key === "a") {
        keyPressed[2] = true;
    } else if (key === "d") {
        keyPressed[3] = true;
    } else if (key === "m") {
        keyPressed[4] = true;
    } else if (key === "j") {
        useSkill(1);
    } else if (key === "k") {
        useSkill(2);
    } else if (key === "l") {
        useSkill(3);
    } else if (key === "r") {
        useSkill(4);
    } else if (key === "2") {
        useItem("mp");
    } else if (key === "Escape") {
        pause();
    } else if (key === " ") {
        PAUSED = false;
        startGame(LEVEL);
    }
});
$(document).on("keyup", event => {
    let key = event.key;
    if (key === "s") {
        keyPressed[0] = false;
    } else if (key === "w") {
        keyPressed[1] = false;
    } else if (key === "a") {
        keyPressed[2] = false;
    } else if (key === "d") {
        keyPressed[3] = false;
    } else if (key === "m") {
        keyPressed[4] = false;
    }
});

$(".skill").on("mouseover", (event) => {
    $(event.target).find(".skill-des").css("display", "block");
});
$(".skill").on("mouseout", (event) => {
    $(event.target).find(".skill-des").css("display", "none");
});
$(".main-menu li").click((event) => {
    let target = $(event.target).data("target");
    switch (target) {
        case "continue":
            pause();
            break;
        case "levels":
            $(".main-menu").hide();
            $(".level-menu").css("display", "flex");
            $(".level-menu").show();
            break;
        default:
            // statements_def
            break;
    }
});
$(".level-menu li").click((event) => {
    let level = $(event.target).data("level");
    if (level === "back") {
        $(".level-menu").hide();
        $(".main-menu").show();
    } else {
        startGame(Number(level));
    }

});
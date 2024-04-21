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
let coinImg = new Image();
coinImg.src = "assets/coin.png";
let keyPressed = [];
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
let BRICK_HP = 10;
let BALL_DAME = 10;
let BALL_RADIUS = 10;
let LIFE = 3;
let PAUSED = true;
let coins = 10;
// let ballSpawnRate = 0.2;
let PADDLE_HP_REGEN = 0.02;
let PADDLE_MP_REGEN = 0.02;
let PADDLE_SPEED = 10;
let PADDLE_SIZE = 100;
let CritRate = 0.1;
let SPHERE_DROP_RATE = 0.00005;
let dropRate = 0.05;
let LEVEL = 1;
let requestID;
let poitionInterval = [];
let ball;
let balls;
let bricks;
let paddle1;
let items;
let spheres;

/**
 * Du Thanh Minh - 21130444 - DH21DTC
 * */


/**
 Map các kỹ năng có trong trò chơi
 * */
let skills = [{
    skillName: "Đại phân thân chi pháp",
    key: "J",
    des: "Ngay lập tức triệu hồi 5 quả cầu bay lên trên trời",
    isSkillCoolDown: false,
    coolDown: 10,
    manaCost: 40,
    isUnlocked: true,
},
    {
        skillName: "Cường hóa vũ trang",
        key: "K",
        des: "Người chơi nhận được thêm 50% kích thước đồng thời tốc độ hồi máu được tăng mạnh và kháng lại tất cả hiệu ứng bất lợi",
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
        coolDown: 1,
        manaCost: 80,
        isUnlocked: false,
    }, {
        skillName: "Khai sinh thái cực",
        key: "T",
        des: "Khai sinh thái cực sức mạnh vô biên, một khi triển khai thì long trời lỡ đất",
        isSkillCoolDown: false,
        coolDown: 1,
        manaCost: 100,
        isUnlocked: false,
    }

];
/**
 * Item tồn tại trong game
 * */
let shopItems = [{
    id: "i1",
    name: "Vô cực kiếm ",
    price: 40,
    img: "assets/item/vo-cuc-kiem.png",
    des: "Khi trang bị người chơi nhận được 20 điểm sức mạnh",
    dame: 20,
}, {
    id: "i2",
    name: "Dạ minh châu",
    price: 40,
    img: "assets/item/da-minh-chau.png",
    des: "Dạ minh châu huyền bí có sức mạnh phục hồi phi thường, ai sở hữu sẽ được 30% điểm hồi máu",
    hpRegen: 0.3,
},
    {
        id: "i3",
        name: "Giày tăng tốc",
        price: 30,
        img: "assets/item/giay.png",
        des: "Đôi giày tinh quái, khi mang bên người được nhận 30% tốc độ di chuyển",
        speed: 5,
    },
    {
        id: "i4",
        name: "Bí kiếp tuyệt học",
        price: 200,
        img: "assets/item/bi-kiep-tuyet-hoc.png",
        des: "Bí kiếp thất truyền đã lâu, ai sở hữu nó sẽ nhận được 40 điểm sức mạnh và 30% tỉ lệ chí mạng",
        dame: 40,
        critRate: 0.3,
    },
    {
        id: "i5",
        name: "Cổ thạch",
        price: 180,
        img: "assets/item/co-thach.png",
        des: "Cổ thạch có các cổ tự kỳ lạ giúp tăng 70% khả năng hồi mana",
        mpRegen: 0.7,
    },
    {
        id: "i6",
        name: "Hắc thư",
        price: 200,
        img: "assets/item/hac-thu.png",
        des: "Cuốn sách phép thuật đen tối trong truyền thuyết ai lĩnh ngộ được sẽ  giúp tăng 30% kích thước",
        width: 0.3,
    },
    {
        id: "i7",
        name: "Huyền tinh bị nguyền rủa",
        price: 200,
        img: "assets/item/lam-thach.png",
        des: "Huyền tinh hắc ám kỳ lạ này giúp người chơi kháng hiệu ứng đi ngược",
        darkRes: true,
    },
    {
        id: "i8",
        name: "Vương miệng nhà vua",
        price: 150,
        img: "assets/item/nhan bang.png",
        des: "Vương miệng cổ từ ngàn đời xưa ai mang nó bên mình sẽ nhận ngay 25% may mắn",
        luck: 0.25,
    },
    {
        id: "i9",
        name: "Bình máu",
        price: 10,
        img: "assets/hp_bottle.png",
        des: "Lập tức hồi phục 20 máu",
    },
    {
        id: "i10",
        name: "Bình mana",
        img: "assets/mp_bottle.png",
        price: 10,
        des: "Lập tức hồi phục 20 mana",
    },
    {
        id: "i11",
        name: "Bình giải độc",
        img: "assets/item/de-poision-bottle.png",
        price: 10,
        des: "Lập tức giải mọi loại độc",
    },
    {
        id: "i12",
        name: "Quạt đại phong",
        img: "assets/item/fan.png",
        price: 40,
        des: "Khi được sử dụng, lật tức quạt ra đại cơn đại cuồng phong thổi đi tất cả kỹ năng của địch",
    },
    {
        id: "i13",
        name: "Mảnh cổ phổ",
        img: "assets/item/manh-bi-kiep.png",
        price: 100,
        des: "Khi thu thập đủ 10 mảnh có thể hợp thành 1 cổ phổ, khi lĩnh ngộ sẽ mở khóa võ công trấn phái",
    },
];

let inventories = {
    bag1: [],
    bag2: [{
        id: "i9",
        quantity: 3
    },
        {
            id: "i10",
            quantity: 3
        }
    ]
};

/**
 *Các đối tượng trong game
 * */

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
        this.bkb = false;
        this.mp = 100;
        this.darkRes = false;
    }

    draw() {
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fillRect(this.point.x, this.point.y, this.width, this.height);
        if (this.darkRes) {
            ctx.fillStyle = "purple";
            ctx.fillRect(this.point.x, this.point.y - 10, this.width, 4);
        }
    }

    getCenterPoint() {
        return new Point(this.point.x + (this.width / 2), this.point.y + (this.height / 2));
    }

    resetStat() {
        PADDLE_HP_REGEN = 0.02;
        PADDLE_MP_REGEN = 0.02;
        PADDLE_SPEED = 10;
        CritRate = 0.1;
        PADDLE_SIZE = 100;
        dropRate = 0.05;
        BALL_DAME = 10;
    }

    dePoition() {
        for (let i = 0; i < poitionInterval.length; i++) {
            clearInterval(poitionInterval[i]);
            clearTimeout(poitionInterval[i]);
        }
        $(".wraper").css("visibility", "hidden");
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
        this.width = PADDLE_SIZE;
        if (keyPressed[2]) {
            this.point.x -= this.velocity.vX;
        }
        if (keyPressed[3]) {
            this.point.x += this.velocity.vX;
        }
        if (keyPressed[4]) {
            this.width += 5;
        }
    }

    checkBallCollied() {
        if (this.point.x <= 0) {
            this.point.x = 0;
        } else if (this.point.x >= canvas.width - this.width) {
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

    getRight() {
        return this.point.x + this.radius;
    }

    getLeft() {
        return this.point.x - this.radius;
    }
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
                createBall(this.effect.value, "down", 0);
                break;
            case "*":
                createBall((balls.length * this.effect.value) - balls.length, "down", 0);
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

    isOutGame() {
        return this.point.y > canvas.height + 20;
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

    isOutGame() {
        return this.point.y > canvas.height + 20;
    }
}

class Fire extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.damage = 30;
        this.setImage(fireImg);
    }

    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            if (!paddle.bkb) {
                paddle.hp -= this.damage;
                updateStats();
                toggle("assets/fire-screen.png");
            }
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
            if (!paddle.bkb) {
                paddle.hp -= this.damage;
                paddle.color = "165, 242, 243";
                paddle.velocity.vX = 7.5;
                updateStats();
                toggle("assets/ice-screen.png");
                setTimeout(() => {
                    paddle.fadeOut(2);
                }, 3000);
                setTimeout(() => {
                    paddle.color = "255,255,0";
                    paddle.velocity.vX = PADDLE_SPEED;
                }, 5000);
            }
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
            if (!paddle.bkb) {
                let count = 0;
                let screen = $("#screen-img");
                let target = $(".wraper");
                screen.attr("src", "assets/toxic-screen.jpg");
                target.css("visibility", "visible");
                let interval = setInterval(() => {
                    paddle.hp -= this.damage;
                    updateStats();
                    count++;
                    target.css("opacity", count % 2 === 0 ? "0.7" : "0.3");
                    if (count === 5) {
                        clearInterval(poitionInterval[0]);
                    }
                }, 500);
                let fadeTimeOut = setTimeout(() => {
                    paddle.fadeOut(2);
                }, 3000);
                let wraperTimeOut = setTimeout(() => {
                    target.css("visibility", "hidden");
                }, 2500);

                poitionInterval.push(interval);
                poitionInterval.push(fadeTimeOut);
                poitionInterval.push(wraperTimeOut);

            }
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
            if (!paddle.darkRes && !paddle.bkb) {
                paddle.hp -= this.damage;
                updateStats();
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
            }
            return true;
        }
        return false;
    }
}

class Coin extends Sphere {
    constructor(point) {
        super(point, new Velocity(0, 5));
        this.value = this.getRandomValue(5) + 5;
        this.velocity.vY = this.getRandomValue(5) + (this.value - 5);
        this.setImage(coinImg);
    }

    getRandomValue(max) {
        return Math.ceil(Math.random() * max);
    }

    colliedWithPaddle(paddle) {
        if (this.isColliedWithPaddle(paddle)) {
            coins += this.value;
            updateStats();
            castSkill(`+ ${this.value} coins`, false);
            return true;
        }
    }
}

class Brick extends Shape {
    constructor(point, hp, type) {
        super(point, null);
        this.hp = hp;
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.type = type;
        this.maxHp = BRICK_HP;
        this.dropSphereRate = SPHERE_DROP_RATE;
    }

    configureLevel(level) {
        if (level === 2) {
            this.width = BRICK_WIDTH * 3;
            this.height = BRICK_HEIGHT * 3;
            this.hp = BRICK_HP * 20;
            this.maxHp = BRICK_HP * 20;
            this.dropSphereRate = SPHERE_DROP_RATE * 3;

        }
    }

    draw() {
        ctx.fillStyle = "grey";
        ctx.fillRect(this.point.x, this.point.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.point.x, this.point.y, this.width * (this.hp / this.maxHp), this.height);
    }

    /**
     * Check if this brick collied with a given ball;
     * **/
    colliedWithBall(ball) {
        let nearestX = Math.max(this.point.x, Math.min(ball.point.x, this.point.x + this.width));
        let nearestY = Math.max(this.point.y, Math.min(ball.point.y, this.point.y + this.height));
        let nearestPoint = new Point(nearestX, nearestY);
        let distance = ball.point.distance(nearestPoint);
        if (distance <= ball.radius) {
            if (ball.type === 0) {
                ball.velocity.reverseY();
                ball.point.y += ball.point.y > this.point.y ? 5 : -5;
                dropItem(this.point.x, this.point.y);
                let isCritDame = Math.random() < CritRate;
                this.hp -= isCritDame ? BALL_DAME * 2 : BALL_DAME;
                if (isCritDame) castSkill("Crit damage:" + BALL_DAME * 2, false);
            } else if (ball.type === 3) {
                balls = balls.filter(i => i.point.x !== ball.point.x);
            }
            this.hp -= (BALL_DAME / 2);
            return true;
        }
        return false;
    }

    collied(balls) {
        return balls.some(ball => this.colliedWithBall(ball));
    }

    animate() {
        let interval;
        let count = 0;
        clearInterval(interval);
        interval = setInterval(() => {
            let newX = count % 2 === 0 ? this.point.x + 5 : this.point.x - 5;
            this.point.x = newX;
            count++;
            if (count == 10) clearInterval(interval);
        }, 200);
    }

    dropCoin() {
        spheres.push(new Coin(new Point(this.point.x, this.point.y)));
    }

    dropSphere() {
        if (Math.random() < this.dropSphereRate) {
            this.animate();
            setTimeout(() => {
                switch (this.type) {
                    case 1:
                        spheres.push(new Fire(new Point(this.point.x, this.point.y)));
                        break;
                    case 2:
                        spheres.push(new Ice(new Point(this.point.x, this.point.y)));
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
            }, 2000);
        }
    }
}

class Dragon extends Brick {
    constructor(point, hp) {
        super(point, null);
        this.hp = hp;
        this.width = 850;
        this.height = 150;
        this.type = 1;
        this.image = this.loadImg();
        this.maxHp = this.hp;
        this.dropSphereRate = SPHERE_DROP_RATE * 10;
    }

    loadImg() {
        const image = new Image(this.width, this.height); // Using optional size for image
        image.src = "assets/dragon.png";
        return image;
    }

    draw() {
        ctx.fillStyle = "grey";
        ctx.fillRect(this.point.x, this.point.y, this.width, 10);
        ctx.fillStyle = "red";
        ctx.fillRect(this.point.x, this.point.y, this.width * (this.hp / this.maxHp), 10);
        ctx.drawImage(this.image, this.point.x, this.point.y, this.width, this.height);
    }

    useSkills(skill) {
        switch (skill) {
            case 1:
                let i = 0;
                let interval;
                clearInterval(interval);
                interval = setInterval(() => {
                    let fire = new Fire(new Point(this.point.x, this.point.y + 100));
                    fire.point.x = this.point.x + (i * 70);
                    fire.width = 70;
                    spheres.push(fire);
                    i++;
                    if (i > 10) clearInterval(interval);
                }, 200);
                break;
            default:
                // statements_def
                break;
        }
    }

    dropSphere() {
        if (Math.random() < this.dropSphereRate) {
            this.animate();
            let randomSkill = Math.ceil(Math.random() * 3);
            let timeout;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // useSkill(randomSkill);
                this.useSkills(1);
            }, 3000);

        }
    }
}

function dropItem(x, y) {
    if (Math.random() < dropRate) {
        items.push(new Item(new Point(x, y)));
    }
}

function configure(level) {
    switch (level) {
        case 1:
            break;
        case 2:
            BRICK_HP = 100;
            SPHERE_DROP_RATE = 0.00010;
            skills[1].isUnlocked = true;
            dropRate = 0.05;
            break;
        case 3:
            BRICK_HP = 200;
            SPHERE_DROP_RATE = 0.00040;
            skills[1].isUnlocked = true;
            skills[2].isUnlocked = true;
            break;
        case 4:
            BRICK_HP = 400;
            SPHERE_DROP_RATE = 0.0006;
            skills[1].isUnlocked = true;
            skills[2].isUnlocked = true;
            skills[3].isUnlocked = true;
            break;
        case 5:
            BRICK_HP = 200;
            SPHERE_DROP_RATE = 0.0002;
            break;
        case 6:
            BRICK_HP = 500;
            SPHERE_DROP_RATE = 0.0002;
            break;

        default:
            // statements_def
            break;
    }
    ball = new Ball(new Point(canvas.width / 2 + 50, canvas.height - 33), new Velocity(5, 5), BALL_RADIUS);
    balls = [ball];
    bricks = generateBicks(level);
    paddle1 = new Paddle(new Point(canvas.width / 2, canvas.height - 20), new Velocity(PADDLE_SPEED, PADDLE_SPEED), PADDLE_SIZE, 20);
    items = [];
    spheres = [];
    updateStats();
}

configure(1);

init("Press space to start");

/**
 Cấu hình khởi tạo game
 * */
function init(title) {
    updateStats();
    updateInventories();
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "yellow";
    renderShopItems();
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

function getColor(level) {
    let colorMap = new Map([
        [1, "#BD5B2F"],
        [2, "#0DC0E1"],
        [3, "#46CC40"],
        [4, "#6D37FF"],
        [5, "#AD3DFF"],
        [6, "#D002AF"],

    ]);
    return colorMap.get(level);
}

function generateBicks(level) {
    // level = 10;
    let bricks = [];
    let rows = 3;
    let columns = 11;
    let gap = 5;
    let brickColor;
    let type;
    switch (level) {
        case 1:
        case 2:
            brickColor = getColor(level);
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    let brick = new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 100), BRICK_HP, level);
                    brick.color = brickColor;
                    bricks.push(brick);
                }
            }
            break;
        case 3:
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    type = i === 0 ? 2 : level;
                    brickColor = getColor(type);
                    let brick = new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 100), BRICK_HP, type);
                    brick.color = brickColor;
                    bricks.push(brick);
                }
            }
            break;
        case 4:
            for (let i = 0; i < rows + 1; i++) {
                for (let j = 0; j < columns; j++) {
                    type = i === 0 ? 1 : level;
                    brickColor = getColor(type);
                    let brick = new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 100), BRICK_HP, type);
                    brick.color = brickColor;
                    bricks.push(brick);
                }
            }
            break;
        case 5:
            for (let i = 0; i < 4; i++) {
                if (i === 0) {
                    for (let j = 0; j < 2; j++) {
                        type = 1;
                        brickColor = getColor(type);
                        let brick = new Brick(new Point(j * (BRICK_WIDTH + gap * 29) + 250, i * (BRICK_HEIGHT + gap * 9) + 40), BRICK_HP, type);
                        brick.configureLevel(2);
                        brick.color = brickColor;
                        bricks.push(brick);
                    }
                } else {
                    for (let j = 0; j < columns; j++) {
                        type = 1;
                        brickColor = getColor(type);
                        let brick = new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 80), BRICK_HP, type);
                        brick.color = brickColor;
                        bricks.push(brick);
                    }
                }
            }
            break;
        case 6:
            bricks.push(new Dragon(new Point(20, 20), 50000));
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < columns; j++) {
                    type = 2;
                    brickColor = getColor(type);
                    let brick = new Brick(new Point(j * (BRICK_WIDTH + gap) + 40, i * (BRICK_HEIGHT + gap) + 200), BRICK_HP, type);
                    brick.color = brickColor;
                    bricks.push(brick);
                }
            }
            break;
        default:
            // statements_def
            break;
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
        if (brick.hp > 0) {
            return true;
        } else {
            let random = Math.random();
            if (dropRate * 2 > random) brick.dropCoin();
        }
    });
    if (bricks != fillterdBricks) {
        bricks = fillterdBricks;
    }
}

/**
 Kiểm tra va chạm
 * */
function checkItemCollied() {
    let fillterdItems = items.filter(item => {
        return !item.colliedWithPaddle(paddle1) && !item.isOutGame();
    });
    items = fillterdItems;
}

function checkSpheresCollied() {
    let fillterdspheres = spheres.filter(sphere => {
        return !sphere.colliedWithPaddle(paddle1) && !sphere.isOutGame();
    });
    // fillterdspheres = spheres.filter(sphere => {
    //     return !sphere.isOutGame();
    // });
    if (spheres.length !== fillterdspheres.length) {
        spheres = fillterdspheres;
    }
}

/**
 * Du Thanh Minh - 21130444 - DH21DTC
 * */
function checkLose() {
    if (balls.length <= 0) {
        LIFE--;
        updateStats();
        toggle("assets/blood-screen.png");
        generateBall();
    }
    if (LIFE === 0) {
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(requestID);
        loseAnimate();
        LIFE = 3;
    }
}

function renderText(text, row) {
    let count = 0;
    let interval2 = setInterval(() => {
        ctx.fillStyle = "black";
        ctx.font = "30px serif";
        ctx.fillText(text[count++], 50 + count * 23, 300 + (row * 50));
        if (count >= text.length) clearInterval(interval2);
    }, 70);
}

function loseAnimate() {
    let count = 0;
    let interval2 = setInterval(() => {
        renderText(texts[count], count);
        if (count++ >= texts.length) clearInterval(interval2);
    }, 2500);
    let width = 10;
    let interval = setInterval(() => {
        ctx.fillStyle = getColor(LEVEL);
        ctx.fillRect(0, 0, width, canvas.height);
        width += 10;
        if (width >= canvas.width + 10) clearInterval(interval);
    }, 15);
    let texts = ["Ha ha ta là vô địch thiên hạ",
        "Muốn đánh bại ta ư? Hãy mơ đi"
    ];

}

function passLevelAnimate() {
    let count = 0;
    let interval2 = setInterval(() => {
        renderText(texts[count], count);
        if (count++ >= texts.length) clearInterval(interval2);
    }, 2500);
    let width = 10;
    let interval = setInterval(() => {
        ctx.fillStyle = getColor(LEVEL);
        ctx.fillRect(0, 0, width, canvas.height);
        width += 10;
        if (width >= canvas.width + 10) clearInterval(interval);
    }, 15);
    let texts = ["Nhà ngươi khá lắm, đừng vội mừng",
        "Ta sẽ con gặp ngươi lần sau"
    ];

}

function airdropCoins(coins) {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let i = 0;
    let interval = setInterval(() => {
        let randomX = Math.ceil(Math.random() * 10);
        let coin = new Coin(new Point(50 + (70 * randomX), 50));
        coin.velocity.vY = 10;
        spheres.push(coin);
        i++;
        if (i >= coins) clearInterval(interval);
    }, 300);
    let milisec = 0;
    let gameInterval = setInterval(() => {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        paddle1.update();
        paddle1.draw();
        spheres.forEach(s => s.update());
        spheres.forEach(s => s.draw());
        checkSpheresCollied();
        updateStats();
        milisec += 16.6;
        if (milisec >= 5000 + LEVEL * 1000) clearInterval(gameInterval);
    }, 16.6);
}

function checkWin() {
    if (bricks.length <= 0) {
        cancelAnimationFrame(requestID);
        airdropCoins(5 + LEVEL * 5);
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            LEVEL++;
            passLevelAnimate();
            setTimeout(() => {
                startGame(LEVEL);
            }, 8000 + LEVEL * 1000);
        }, 5000 + LEVEL * 1000);
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

function renderSkills() {
    skills.forEach((skill, index) => {
        let skillDiv = $("#skill-" + (index + 1));
        let grayScale = skill.isUnlocked ? "grayscale(0%)" : "grayscale(100%)";
        skillDiv.css("filter", grayScale);
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

function updateSkills() {
    skills.forEach((skill, index) => {
        let skillDiv = $("#skill-" + (index + 1));
        if (paddle1.mp < skill.manaCost) {
            skillDiv.css("opacity", "0.5");
        } else {
            skillDiv.css("opacity", "1");
        }
    });
}

function updateInventories() {
    paddle1.resetStat();
    inventories.bag1.forEach((item, index) => {
        let targetItem = shopItems.filter(i => i.id === item.id)[0];
        let imgSrc = targetItem.img;
        let imgE = $("<img>");
        BALL_DAME += targetItem.dame ? targetItem.dame : 0;
        PADDLE_SPEED += targetItem.speed ? targetItem.speed : 0;
        paddle1.velocity.vX = PADDLE_SPEED;
        paddle1.darkRes = targetItem.darkRes;
        CritRate += targetItem.critRate ? targetItem.critRate : 0;
        PADDLE_HP_REGEN *= targetItem.hpRegen ? (1 + targetItem.hpRegen) : 1;
        PADDLE_MP_REGEN *= targetItem.mpRegen ? (1 + targetItem.mpRegen) : 1;
        PADDLE_SIZE *= targetItem.width ? (1 + targetItem.width) : 1;

        imgE.attr("src", imgSrc);
        let lot = $("#lot-" + (index + 1));
        lot.empty();
        lot.append(imgE);

    });
    inventories.bag2.forEach((item, index) => {
        let targetItem = shopItems.filter(i => i.id === item.id)[0];
        let imgSrc = targetItem.img;
        let imgE = $("<img>");
        imgE.attr("src", imgSrc);
        imgE.attr("width", 50);
        imgE.attr("height", 50);
        let lot = $("#lot-" + (index + 9));
        let qualityE = $("<span>");
        qualityE.text("X" + item.quantity);
        qualityE.addClass('quantity');
        lot.empty();
        if (targetItem.id === "i13" && item.quantity >= 10) {
            showUnlockSkill();
            return;
        }
        if (item.quantity > 0) {
            lot.append(imgE);
            lot.append(qualityE);
        }
    });
}

function updateHpMpBar() {
    $(".hp-bar-real").css("width", paddle1.hp + "%");
    $(".mp-bar-real").css("width", paddle1.mp + "%");
}

function updateStats() {
    renderSkills();
    $(".gold-value").text(coins);
    $("#damage-atk").text(BALL_DAME);
    $("#speed").text(PADDLE_SPEED);
    $("#crit-rate").text(CritRate * 100 + "%");
    $("#width").text(PADDLE_SIZE);
    $("#primary-radius").text(BALL_RADIUS);
    $("#item-drop-rate").text(dropRate * 100 + "%");
    $("#hp-regen").text(PADDLE_HP_REGEN.toFixed(2));
    $("#mp-regen").text(PADDLE_MP_REGEN.toFixed(2));
    updateLife();
    updateHpMpBar();
}

function update() {
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
    checkSpheresCollied();
    updateHpMpBar();
    updateSkills();
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
        brick.dropSphere();
    });
    items.forEach((item) => {
        item.draw();
    });
    spheres.forEach((sphere) => {
        sphere.draw();
    });

}

/**
 * Du Thanh Minh - 21130444 - DH21DTC
 * */
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

function useItem(lot) {
    let item = inventories.bag2[lot - 1];
    let itemId = item !== undefined ? item.id : 0;
    let quantity = item !== undefined ? item.quantity : 0;
    switch (itemId) {
        case "i9":
            if (quantity > 0) {
                castSkill("+20 hp", false);
                paddle1.hp += 20;
                item.quantity--;
            } else {
                castSkill("Không có vật phẩm này", false);
            }
            break;
        case "i10":
            if (quantity > 0) {
                castSkill("+20 mana", false);
                paddle1.mp += 20;
                item.quantity--;
            } else {
                castSkill("Không có vật phẩm này", false);
            }
            break;
        case "i11":
            if (quantity > 0) {
                castSkill("Giải mọi loại độc", false);
                paddle1.dePoition();
                item.quantity--;
            } else {
                castSkill("Không có vật phẩm này", false);
            }
            break;
        case "i12":
            if (quantity > 0) {
                castSkill("Đại cuồng phong", false);
                let noneCoinsSpheres = spheres.filter((s) => s.constructor.name !== "Coin");
                item.quantity--;
                noneCoinsSpheres.forEach(s => {
                    s.velocity.reverseY();
                });
            } else {
                castSkill("Không có vật phẩm này", false);
            }
            break;
        default:
            castSkill("Không có vật phẩm này", false);
            break;
    }
    updateInventories();
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
    if (skillName.includes('Crit')) {
        skillE.css("bottom", 500);
    }
    $(".game-board").append(skillE);
    setTimeout(() => {
        $(".skill-cast").remove();
    }, 5000);
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
            createBall(5, "up", 0);
            paddle1.mp -= manaCost;
            skillObject.isSkillCoolDown = true;
            createCollDownAnimation(1, coolDown);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);
            break;
        case 2:
            castSkill(skillObject.skillName, false);
            PADDLE_SIZE += 100;
            paddle1.bkb = true;
            PADDLE_HP_REGEN += 0.1;
            skillObject.isSkillCoolDown = true;
            paddle1.mp -= manaCost;
            paddle1.color = "255,140,0";
            createCollDownAnimation(2, coolDown);
            setTimeout(() => {
                paddle1.color = "255,255,0";
                PADDLE_SIZE -= 100;
                paddle1.bkb = false;
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
        case 5:
            castSkill(skillObject.skillName, true);
            skillObject.isSkillCoolDown = true;
            paddle1.mp -= manaCost;
            let superBalls = [];
            let superBall1 = createSuperBall();
            let superBall2 = createSuperBall();
            superBall1.point.x = 400;
            superBall2.point.x = 600;
            superBalls.push(superBall1);
            superBalls.push(superBall2);
            createCollDownAnimation(5, coolDown);
            setTimeout(() => {
                let count = 0;
                superBalls[0].velocity.vY = 0;
                superBalls[1].velocity.vY = 0;
                superBalls.forEach(superBall => {
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
                });
            }, 1200);
            setTimeout(() => {
                balls = balls.filter(ball => {
                    return ball.type !== 1;
                });
            }, 2 * 1000);
            setTimeout(() => {
                skillObject.isSkillCoolDown = false;
            }, coolDown * 1000);

            createBall(50, "up", 3);
            break;
        default:
            break;
    }
    updateStats();

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

function createBall(ballNumber, direction, type) {
    let y = direction === "up" ? canvas.height - 30 : canvas.height / 2;
    let vX = 5;
    let count = 0;
    let interval = setInterval(() => {
        count++;
        let x = Math.ceil(Math.random() * canvas.width / 2) + 20;
        let offsetV = Math.ceil(Math.random() * 2);
        let vY = direction === "up" ? -5 - offsetV : 5;
        let ball = new Ball(new Point(x, y), new Velocity(vX, vY), BALL_RADIUS);
        ball.type = type;
        if (type === 3) {
            ball.color = "255,255,255";
            ball.radius *= 0.7;
            ball.velocity.vY -= 4;

        }
        balls.push(ball);
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
    configure(level);
    clearReact();
    updateInventories();
    updateLife();
    loop();
}

function pause() {
    PAUSED = !PAUSED;
    if (PAUSED) {
        $(".game-menu").show();
    } else {
        // startGame(LEVEL)
        $(".game-menu").hide();
        loop();
    }
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
    } else if (key === "a" || key === "A") {
        keyPressed[2] = true;
    } else if (key === "d" || key === "D") {
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
    } else if (key === "t") {
        useSkill(5);
    } else if (key === "1") {
        useItem(1);
    } else if (key === "2") {
        useItem(2);
    } else if (key === "3") {
        useItem(3);
    } else if (key === "4") {
        useItem(4);
    } else if (key === "Escape") {
        pause();
    } else if (key === " ") {
    }
});
$(document).on("keyup", event => {
    let key = event.key;
    if (key === "s") {
        keyPressed[0] = false;
    } else if (key === "w") {
        keyPressed[1] = false;
    } else if (key === "a" || key === "A") {
        keyPressed[2] = false;
    } else if (key === "d" || key === "D") {
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
            updateLife();
            updateInventories();
            pause();
            break;
        case "levels":
            $(".main-menu").hide();
            $(".level-menu").css("display", "flex");
            $(".level-menu").show();
            break;
        case "about-me":
            $(".main-menu").hide();
            $(".intro").show();
            break;
        case "tutorial":
            $(".main-menu").hide();
            $(".tutorial").show();
            break;
        default:
            // statements_def
            break;
    }
});
$(".back").click(() => {
    $(".level-menu").hide();
    $(".intro").hide();
    $(".tutorial").hide();
    $(".main-menu").show();
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

$(".shop-icon").click(() => {
    $(".stats").hide();
    $(".shop").show();
    $(".shop-icon").hide();
    $(".back-icon").show();
    $(".skills-container").hide();
});
$(".back-icon").click(() => {
    $(".stats").show();
    $(".shop").hide();
    $(".shop-icon").show();
    $(".back-icon").hide();
    $(".skills-container").show();
});

$(".item img").on("mouseover", (event) => {
    $(event.target).parent().find(".item-des").css("display", "block");
});
$(".item img").on("mouseout", (event) => {
    $(event.target).parent().find(".item-des").css("display", "none");
});

$("#shop-items .item").on("click", (event) => {
    let id = event.currentTarget.id;
    let index = Number(id.substring(1, id.length));
    let bag = index > 8 ? "bag" + 2 : "bag" + 1;
    buyItem(id, bag);
});

function buyItem(id, bag) {
    let targetItem = shopItems.filter(item => item.id === id)[0];
    let inventoryBag = inventories[bag];
    let isExist = inventoryBag.some(item => item.id === targetItem.id);
    if (coins >= targetItem.price) {
        if (bag === "bag1" && !isExist) {
            coins -= targetItem.price;
            inventoryBag.push({id: targetItem.id, quantity: 1});
            updateInventories();
            updateStats();
        } else if (bag === "bag2") {
            coins -= targetItem.price;
            let currentItem = inventoryBag.filter(item => item.id === id)[0];
            let currentQuantity = currentItem !== undefined ? currentItem.quantity : 0;
            let quantity = isExist ? currentQuantity + 1 : 1;
            if (currentItem === undefined) {
                inventoryBag.push({id: targetItem.id, quantity: quantity});
            } else {
                currentItem.quantity = quantity;
            }
            updateInventories();
            updateStats();
        }
    }
}

function showUnlockSkill() {
    $(".notify").show();
    skills[4].isUnlocked = true;
    $("#skill-5").parent().show();
}

function renderShopItems() {
    shopItems.forEach((item, index) => {
        let itemDesE = $("#i" + (index + 1));
        itemDesE.find(".item-name").text(item.name);
        itemDesE.find(".item-price").text(item.price);
        itemDesE.find(".item-text").text(item.des);

    });
}

$(".btn").click(() => {
    $(".notify").hide();
});
/**
 * Du Thanh Minh - 21130444 - DH21DTC
 * */
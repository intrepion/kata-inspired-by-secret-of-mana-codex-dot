import {
  AREAS,
  STONE,
  WIDTH,
  HEIGHT,
  warningRadius,
  warningDuration,
  type Game,
  type Point,
} from "./domain";
const TAU = Math.PI * 2;
function circle(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fill();
}
function polygon(
  c: CanvasRenderingContext2D,
  points: number[][],
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
}
function tree(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  area: number,
) {
  ellipse(c, x, y + 7, 25 * s, 10 * s, "#112c303d");
  c.fillStyle = "#725d46";
  c.fillRect(x - 4 * s, y - 35 * s, 8 * s, 40 * s);
  const palette =
    area === 4
      ? ["#806d9c", "#a18cb7", "#c0a5cb"]
      : area === 3
        ? ["#795c58", "#a17a66", "#c79570"]
        : ["#24554b", "#33705a", "#51906c"];
  circle(c, x, y - 44 * s, 27 * s, palette[0]);
  circle(c, x - 15 * s, y - 41 * s, 19 * s, palette[1]);
  circle(c, x + 14 * s, y - 50 * s, 21 * s, palette[1]);
  circle(c, x - 3 * s, y - 62 * s, 20 * s, palette[2]);
  c.fillStyle = "#dbefb027";
  c.fillRect(x - 11 * s, y - 68 * s, 15 * s, 4 * s);
}
function stone(c: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ellipse(c, x, y + 16, 35, 11, "#13282866");
  polygon(
    c,
    [
      [x - 24, y + 14],
      [x - 17, y - 24],
      [x, y - 40],
      [x + 18, y - 23],
      [x + 24, y + 14],
    ],
    "#748c81",
  );
  polygon(
    c,
    [
      [x, y - 40],
      [x + 18, y - 23],
      [x + 24, y + 14],
      [x + 3, y + 9],
    ],
    "#506d66",
  );
  c.strokeStyle = "#d9f4c9";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y - 27);
  c.lineTo(x - 8, y - 11);
  c.lineTo(x + 8, y - 11);
  c.lineTo(x, y + 3);
  c.stroke();
  circle(c, x, y - 13, 5, "#fff4bb");
  ellipse(c, x, y + 27, 41 + Math.sin(t) * 3, 12, "#c5efa728");
}
function gate(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  open: boolean,
  accent: string,
) {
  ellipse(c, x, y + 39, 43, 12, "#10252b77");
  c.fillStyle = "#6f8276";
  c.fillRect(x - 35, y - 47, 15, 78);
  c.fillRect(x + 20, y - 47, 15, 78);
  polygon(
    c,
    [
      [x - 41, y - 45],
      [x - 28, y - 67],
      [x + 28, y - 67],
      [x + 41, y - 45],
    ],
    "#a5ac89",
  );
  c.fillStyle = open ? accent : "#5c6870";
  c.globalAlpha = open ? 0.35 : 0.7;
  c.fillRect(x - 19, y - 43, 38, 74);
  c.globalAlpha = 1;
  c.strokeStyle = accent;
  c.lineWidth = 2;
  c.strokeRect(x - 15, y - 40, 30, 68);
}
function house(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ellipse(c, x + w / 2, y + h, w * 0.6, 12, "#18362755");
  c.fillStyle = "#d3ba8b";
  c.fillRect(x, y + 30, w, h - 30);
  c.fillStyle = "#baa17c";
  c.fillRect(x + w / 2, y + 30, w / 2, h - 30);
  polygon(
    c,
    [
      [x - 10, y + 36],
      [x + w / 2, y - 15],
      [x + w + 10, y + 36],
    ],
    "#535f63",
  );
  polygon(
    c,
    [
      [x + w / 2, y - 15],
      [x + w + 10, y + 36],
      [x + w / 2, y + 36],
    ],
    "#3b4d53",
  );
  c.fillStyle = "#f2d592";
  c.fillRect(x + 15, y + 51, 21, 22);
  c.fillStyle = "#65574c";
  c.fillRect(x + w - 37, y + 50, 23, h - 50);
  c.strokeStyle = "#818376";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x + 25, y + 51);
  c.lineTo(x + 25, y + 73);
  c.stroke();
}
function traveler(
  c: CanvasRenderingContext2D,
  p: Game["party"][0],
  leader: boolean,
  time: number,
  reduced: boolean,
) {
  const x = p.x,
    y = p.y;
  ellipse(c, x, y + 12, 15, 6, "#152b3670");
  if (p.hp <= 0) {
    ellipse(c, x, y + 5, 15, 7, p.color);
    c.fillStyle = "#fff0c5";
    c.font = "18px serif";
    c.fillText("✦", x - 7, y - 15);
    return;
  }
  if (leader) {
    c.strokeStyle = "#fff1b8";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(x, y + 11, 21, 8, 0, 0, TAU);
    c.stroke();
  }
  const bob = reduced ? 0 : Math.sin(time * 7 + p.x * 0.03) * 1.3;
  c.save();
  c.translate(x, y + bob);
  if (p.invulnerable > 0) c.globalAlpha = 0.62 + Math.sin(time * 30) * 0.25;
  c.fillStyle = "#283d44";
  c.fillRect(-8, 4, 6, 10);
  c.fillRect(3, 4, 6, 10);
  polygon(
    c,
    [
      [-13, -7],
      [0, -14],
      [13, -7],
      [15, 6],
      [0, 11],
      [-15, 6],
    ],
    p.color,
  );
  polygon(
    c,
    [
      [0, -12],
      [13, -7],
      [15, 6],
      [0, 11],
    ],
    p.element === "ember"
      ? "#c58b61"
      : p.element === "tide"
        ? "#4d9bb6"
        : "#8975b8",
  );
  c.fillStyle = "#f6dcc0";
  c.fillRect(-9, -23, 18, 17);
  circle(c, 0, -17, 10, "#f6dcc0");
  polygon(
    c,
    [
      [-11, -21],
      [-5, -31],
      [7, -29],
      [12, -18],
      [3, -22],
      [-3, -18],
    ],
    p.element === "ember"
      ? "#735c45"
      : p.element === "tide"
        ? "#2a5969"
        : "#e4e2d1",
  );
  c.fillStyle = "#283742";
  c.fillRect(3, -17, 3, 3);
  c.fillStyle = "#fff3d0";
  c.fillRect(-10, -3, 21, 3);
  if (p.element === "ember") {
    polygon(
      c,
      [
        [14, 4],
        [16, -27],
        [20, -27],
        [21, 4],
      ],
      "#eae9c9",
    );
    c.fillStyle = "#8a6950";
    c.fillRect(11, 2, 13, 4);
  } else {
    c.strokeStyle = p.element === "tide" ? "#947861" : "#d6cdd6";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(16, 9);
    c.lineTo(16, -30);
    c.stroke();
    circle(c, 16, -29, 5, p.element === "tide" ? "#a2f4ed" : "#f0ddff");
  }
  if (p.strike > 0) {
    c.strokeStyle = "#fff6cc";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, -2, 43, -1.1, 1.1);
    c.stroke();
  }
  c.restore();
}
function enemy(
  c: CanvasRenderingContext2D,
  e: Game["enemies"][0],
  time: number,
) {
  const x = e.x,
    y = e.y,
    s = e.boss ? 1.9 : 1;
  ellipse(c, x, y + 12 * s, 18 * s, 7 * s, "#182a3670");
  const color =
    e.flash > 0
      ? "#fff5dc"
      : e.element === "ember"
        ? "#d89a7a"
        : e.element === "tide"
          ? "#94d6d6"
          : "#a1bf79";
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  polygon(
    c,
    [
      [-21, 5],
      [-18, -13],
      [-8, -27],
      [5, -30],
      [20, -10],
      [22, 8],
      [0, 15],
    ],
    color,
  );
  polygon(
    c,
    [
      [-21, 5],
      [-7, -3],
      [0, 15],
    ],
    "#55776d",
  );
  if (e.boss) {
    polygon(
      c,
      [
        [-18, -19],
        [-26, -41],
        [-5, -27],
      ],
      "#b6a77a",
    );
    polygon(
      c,
      [
        [9, -25],
        [22, -43],
        [24, -9],
      ],
      "#b6a77a",
    );
    circle(c, 0, -35, 8, "#e9ca87");
    c.fillStyle = "#f5e7b5";
    c.fillRect(-2, -43, 4, 15);
  }
  c.fillStyle = "#35494c";
  c.fillRect(-10, -10, 7, 5);
  c.fillRect(7, -10, 7, 5);
  c.fillStyle = "#f8eaa8";
  c.fillRect(-8, -10, 3, 3);
  c.fillRect(9, -10, 3, 3);
  c.restore();
  if (e.hp < e.maxHp) {
    c.fillStyle = "#132d38";
    c.fillRect(x - 25, y - 40 * s, 50, 4);
    c.fillStyle = "#e0bc82";
    c.fillRect(x - 25, y - 40 * s, (50 * e.hp) / e.maxHp, 4);
  }
  if (e.burn > 0) circle(c, x + 18, y - 25, 6, "#ffb16b");
  if (e.slow > 0) {
    c.strokeStyle = "#a3eafb";
    c.strokeRect(x - 22 * s, y - 32 * s, 44 * s, 48 * s);
  }
  if (e.boss) {
    c.fillStyle = "#f8edcb";
    c.font = "bold 12px sans-serif";
    c.textAlign = "center";
    c.fillText(e.name, x, y - 48 * s);
    c.textAlign = "left";
  }
  void time;
}
export function draw(
  c: CanvasRenderingContext2D,
  g: Game,
  reduced = false,
  target?: Point,
) {
  const a = AREAS[g.area],
    t = reduced ? 0 : g.time;
  c.clearRect(0, 0, WIDTH, HEIGHT);
  c.fillStyle = a.color;
  c.fillRect(0, 0, WIDTH, HEIGHT);
  c.fillStyle = a.floor;
  c.fillRect(32, 52, 896, 492);
  const grad = c.createLinearGradient(0, 0, 960, 576);
  grad.addColorStop(0, "#dcedbd0e");
  grad.addColorStop(1, "#11283c50");
  c.fillStyle = grad;
  c.fillRect(32, 52, 896, 492);
  // Meadow texture, worn path and original environmental details.
  for (let i = 0; i < 190; i++) {
    const x = 48 + ((i * 173) % 865),
      y = 60 + ((i * 97) % 470);
    c.fillStyle = i % 3 === 0 ? "#dcf0c21b" : "#122d3d14";
    c.fillRect(x, y, 3 + (i % 4), 2);
    if (i % 6 === 0) {
      c.strokeStyle = "#d4e5b427";
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 3, y - 5);
      c.moveTo(x, y);
      c.lineTo(x + 3, y - 4);
      c.stroke();
    }
  }
  c.strokeStyle =
    g.area === 2 ? "#b9d2c554" : g.area === 3 ? "#c49b7d66" : "#c5b88b51";
  c.lineWidth = 66;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(50, 288);
  c.bezierCurveTo(265, 258, 440, 323, 910, 288);
  c.stroke();
  c.lineWidth = 37;
  c.strokeStyle = "#e6d5a113";
  c.stroke();
  for (let i = 0; i < 24; i++) {
    const x = 90 + i * 34,
      y = 281 + Math.sin(i * 0.72) * 18;
    ellipse(c, x, y, 6, 3, "#ded5a323");
  }
  if (g.area === 2) {
    for (const o of a.obstacles) {
      ellipse(
        c,
        o.x + o.w / 2,
        o.y + o.h / 2,
        o.w * 0.62,
        o.h * 0.6,
        "#294f68",
      );
      ellipse(
        c,
        o.x + o.w / 2,
        o.y + o.h / 2,
        o.w * 0.53,
        o.h * 0.49,
        "#4aa7bc",
      );
      for (let n = 0; n < 4; n++) {
        c.strokeStyle = "#c7e4dd44";
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(
          o.x + o.w / 2,
          o.y + o.h / 2 + n * 12,
          o.w * 0.4,
          6 + Math.sin(t + n) * 2,
          0,
          0,
          Math.PI,
        );
        c.stroke();
      }
    }
  } else if (g.area === 3) {
    for (const o of a.obstacles) {
      c.fillStyle = "#443b47";
      c.fillRect(o.x - 7, o.y - 6, o.w + 14, o.h + 12);
      c.fillStyle = "#bc765d";
      c.fillRect(o.x, o.y, o.w, o.h);
      for (let n = 0; n < 5; n++) {
        c.strokeStyle = "#ffcc7b99";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(o.x + 10, o.y + n * 28 + 10);
        c.bezierCurveTo(
          o.x + 25,
          o.y + n * 28 + Math.sin(t) * 4,
          o.x + 55,
          o.y + n * 28 + 17,
          o.x + o.w - 10,
          o.y + n * 28 + 10,
        );
        c.stroke();
      }
    }
  } else if (g.area === 0) {
    a.obstacles.forEach((o) => house(c, o.x, o.y, o.w, o.h));
  } else {
    for (const o of a.obstacles) {
      for (let n = 0; n < 5; n++)
        tree(
          c,
          o.x + 18 + (n % 3) * 34,
          o.y + 50 + Math.floor(n / 3) * 58,
          1.2,
          g.area,
        );
    }
  }
  for (let i = 0; i < 16; i++) {
    tree(c, 25 + i * 62, 60 + (i % 3) * 16, 0.8, g.area);
    tree(c, 28 + i * 62, 555 + (i % 2) * 12, 0.88, g.area);
  }
  for (let i = 0; i < 6; i++) {
    tree(c, 22, 95 + i * 77, 1, g.area);
    if (i !== 2 && i !== 3) tree(c, 942, 95 + i * 77, 1, g.area);
  }
  stone(c, STONE.x, STONE.y, t);
  c.fillStyle = "#e2ebc2";
  c.font = "11px sans-serif";
  c.textAlign = "center";
  c.fillText("WAYSTONE", STONE.x, STONE.y + 48);
  c.textAlign = "left";
  gate(c, 900, 288, g.area === 0 || g.cleared.includes(g.area), a.accent);
  if (g.area > 0) gate(c, 59, 288, true, a.accent);
  if (g.area === 0) {
    circle(c, 245, 215, 10, "#e3c9a0");
    polygon(
      c,
      [
        [230, 225],
        [246, 215],
        [260, 225],
        [265, 247],
        [230, 247],
      ],
      "#a4a9bb",
    );
    c.fillStyle = "#f4e4bd";
    c.font = "12px sans-serif";
    c.fillText("Elder Sola", 213, 192);
    for (let i = 0; i < 6; i++) {
      const x = 620 + i * 23;
      circle(c, x, 385 + (i % 2) * 16, 7, "#c88776");
      c.fillStyle = "#e6cd96";
      c.fillRect(x - 3, 388 + (i % 2) * 16, 6, 11);
    }
  }
  for (const e of g.enemies) {
    if (e.hp > 0 && e.windup > 0) {
      const r = warningRadius(e);
      c.fillStyle = "#ff98753b";
      c.strokeStyle = "#ffd0a2";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(e.target.x, e.target.y, r, 0, TAU);
      c.fill();
      c.stroke();
      c.lineWidth = 5;
      c.strokeStyle = "#fd9d74";
      c.beginPath();
      c.arc(
        e.target.x,
        e.target.y,
        r,
        -Math.PI / 2,
        -Math.PI / 2 + TAU * (1 - e.windup / warningDuration(e)),
      );
      c.stroke();
      c.fillStyle = "#ffdfc0";
      c.font = "20px serif";
      c.fillText("!", e.target.x - 4, e.target.y + 6);
    }
  }
  const actors = [
    ...g.enemies
      .filter((e) => e.hp > 0)
      .map((e) => ({ y: e.y, draw: () => enemy(c, e, t) })),
    ...g.party.map((p, i) => ({
      y: p.y,
      draw: () => traveler(c, p, i === g.leader, t, reduced),
    })),
  ];
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  for (const e of g.effects) {
    c.globalAlpha = Math.min(1, e.life * 2);
    if (e.text) {
      c.fillStyle = e.kind === "hurt" ? "#ffb8a3" : "#fff4c6";
      c.font = "bold 18px sans-serif";
      c.textAlign = "center";
      c.fillText(e.text, e.x, e.y - 35 - (reduced ? 0 : (0.65 - e.life) * 30));
      c.textAlign = "left";
    } else {
      const color =
        e.kind === "ember"
          ? "#ffb27a"
          : e.kind === "tide"
            ? "#b3eef6"
            : e.kind === "gale"
              ? "#e7ccff"
              : "#fff2b5";
      c.strokeStyle = color;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(e.x, e.y, 15 + (0.65 - e.life) * 70, 0, TAU);
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  if (target) {
    c.strokeStyle = "#f7eac2a0";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(target.x, target.y, 10, 0, TAU);
    c.stroke();
    c.beginPath();
    c.moveTo(target.x - 15, target.y);
    c.lineTo(target.x + 15, target.y);
    c.moveTo(target.x, target.y - 15);
    c.lineTo(target.x, target.y + 15);
    c.stroke();
  }
  if (!reduced) {
    for (let i = 0; i < 16; i++) {
      const x = 70 + ((i * 173 + Math.sin(t * 0.4 + i) * 18) % 820),
        y = 75 + ((i * 83 + Math.sin(t * 0.6 + i) * 21) % 430);
      circle(c, x, y, 1.5, a.accent);
    }
  }
  const vignette = c.createRadialGradient(480, 280, 150, 480, 280, 530);
  vignette.addColorStop(0, "#101d2100");
  vignette.addColorStop(1, "#0b172b65");
  c.fillStyle = vignette;
  c.fillRect(0, 0, WIDTH, HEIGHT);
}

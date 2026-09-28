let gl = null;
let program = null;
let uAngle = null;

const vsSource = `
  attribute vec2 aPosition;
  attribute vec3 aColor;
  uniform float uAngle;
  varying vec3 vColor;

  void main() {
    float c = cos(uAngle);
    float s = sin(uAngle);
    vec2 rotated = vec2(
      aPosition.x * c - aPosition.y * s,
      aPosition.x * s + aPosition.y * c
    );
    gl_Position = vec4(rotated, 0.0, 1.0);
    vColor = aColor;
  }
`;

const fsSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

function setupWebGL(canvas) {
  let context = canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl");
  if (!context) {
    alert("Не вдалося ініціалізувати WebGL.");
    return null;
  }
  return context;
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Помилка шейдера:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Помилка лінкування:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

let angle = 0;
let lastTime = 0;
const ROTATION_SPEED = 1.0; // радіан за секунду

function render(now) {
  now *= 0.001;                 // мілісекунди >> секунди
  const deltaTime = now - lastTime;
  lastTime = now;
  angle += ROTATION_SPEED * deltaTime;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(uAngle, angle);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
}

function init() {
  const canvas = document.getElementById("glcanvas");
  gl = setupWebGL(canvas);
  if (!gl) return;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.4, 0.6, 1.0);

  program = createProgram(vsSource, fsSource);
  gl.useProgram(program);

  // квадрат із двох трикутників (x, y, r, g, b)
  // значення 0.4 по x і 0.5 по y дають квадрат на canvas 640 на 480
  const vertices = new Float32Array([

    -0.4,  0.5,   1.0, 0.0, 0.0,   // лівий верхній — червоний
    -0.4, -0.5,   0.0, 1.0, 0.0,   // лівий нижній — зелений
     0.4, -0.5,   0.0, 0.0, 1.0,   // правий нижній — синій

    -0.4,  0.5,   1.0, 0.0, 0.0,   // лівий верхній — червоний
     0.4, -0.5,   0.0, 0.0, 1.0,   // правий нижній — синій
     0.4,  0.5,   1.0, 1.0, 0.0    // правий верхній — жовтий
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const FSIZE = vertices.BYTES_PER_ELEMENT;
  const stride = 5 * FSIZE;

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(aPosition);

  const aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 2 * FSIZE);
  gl.enableVertexAttribArray(aColor);

  uAngle = gl.getUniformLocation(program, "uAngle");

  requestAnimationFrame(render);
}

window.onload = init;
import { Component, onCleanup, onMount } from "solid-js";
import styles from "./ShaderBackground.module.css";

const fragShaderSrc = `#version 300 es
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  out vec4 fragColor;

  /* https://blog.frost.kiwi/GLSL-noise-and-radial-gradient/ */
  float gradientNoise(in vec2 uv) {
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
  }

  void main() {
    vec2 center = vec2(resolution.x / 2.0, 1.1 * resolution.y);
    float scale = min(resolution.y, resolution.x * 2.1) / 2.1;
    vec2 p = (gl_FragCoord.xy - center) / scale;
    float l = 1.0 - length(p);

    vec3 color = tanh((1.1 + sin(p.x + time + vec3(0, 2, 4))) / 5e2 / max(l, -l * 0.1));

    /* Debanding with some noise */
    color += (1.0 / 255.0) * gradientNoise(gl_FragCoord.xy) - (0.5 / 255.0);

    fragColor += vec4(color, 1.0);
  }
`;

const vertShaderSrc = `#version 300 es
in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const ShaderBackground: Component = () => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const maybeGl = canvas.getContext("webgl2");
    if (!maybeGl) {
      console.log("WebGL2 not supported");
      return;
    }
    const gl = maybeGl;

    const resize = () => {
      // Request size of canvas from size of element.
      // We size element with 100vh, 100vw and position
      // fixed at 0 0, this way everything looks perfect
      // and does not jump when different
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    resize();
    window.addEventListener("resize", resize);
    onCleanup(() => {
      window.removeEventListener("resize", resize);
    });

    function compile(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }

      return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, vertShaderSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragShaderSrc);

    if (!vs || !fs) {
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawingBufferColorSpace = "srgb";

    const uRes = gl.getUniformLocation(program, "resolution");
    const uTime = gl.getUniformLocation(program, "time");

    const start = performance.now();

    function render() {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    render();
  });

  return <canvas class={styles.shaderBg} ref={canvas} />;
};

export default ShaderBackground;

import * as twgl  from 'twgl.js';
import { mat4 } from 'gl-matrix';

const vertexShader = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform highp mat4 uPositionMatrix;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = uPositionMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;

const fragmentShader = `
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;
  uniform highp mat4 uColorMatrix;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = uColorMatrix * vec4(texelColor.rgb, 1);
  }
`;

export class Screen {

  constructor(gl) {
    this.gl = gl;

    this.program = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
    this.buffers = twgl.createBufferInfoFromArrays(gl, {
      aVertexPosition: [
        -1.0, -1.0,  0,
         1.0, -1.0,  0,
         1.0,  1.0,  0,
        -1.0,  1.0,  0
      ],
      aTextureCoord:  [
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  0.0
      ],
      indices: [
        0,  1,  2,
        0,  2,  3
      ]
    });
  }


  display(colorMatrix, texture, width, height) {
    var gl = this.gl
    gl.canvas.width = width;
    gl.canvas.height = height;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program.program);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST); 
    gl.depthFunc(gl.LEQUAL); 
    
    twgl.setBuffersAndAttributes(gl, this.program, this.buffers);

    const positionMatrix = mat4.create();
    
    twgl.setUniforms(this.program, {
      uPositionMatrix: positionMatrix,
      uSampler: {texture: texture},
      uColorMatrix: colorMatrix
    });
  
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}

export const fragmentShader = `
  varying vec2 vUv;
  uniform vec2 uPlaneScale;
  uniform vec2 uTextureBounds;
  uniform float uOpacity;
  uniform sampler2D uTexture;

  vec2 aspect(vec2 size) {
    return size / min(size.x, size.y);
  }

  void main() {
    vec2 s = aspect(uPlaneScale);
    vec2 i = aspect(uTextureBounds);
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    vec2 uv = vUv * s / new + offset;
    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }
`

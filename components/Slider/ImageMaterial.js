// import { extend } from '@react-three/fiber'
// import { shaderMaterial } from '@react-three/drei'
// // import glsl from "babel-plugin-glsl/macro"

// const ImageMaterial = shaderMaterial(
//   {
//     tex: null,
//     viewportHeight: 1.0,
//     scale: [1, 1],
//     imageBounds: [1, 1],
//     uOffset: null,
//   },
//   glsl`
//   uniform vec2 uOffset;
//   varying vec2 vUv;

//   #define M_PI 3.1415926535897932384626433832795

//   vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
//     position.x = position.x + (sin(uv.y * M_PI) * offset.x);
//     position.y = position.y + (sin(uv.x * M_PI) * offset.y);
//     return position;
//   }

//   void main() {
//     vUv = uv;
//     vec3 newPosition = deformationCurve(position, uv, uOffset); // last argument should be uOffset
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//   }
//   `,
//   glsl`
//   varying vec2 vUv;
//   uniform sampler2D tex;
//   uniform float viewportHeight;
//   uniform vec2 scale;
//   uniform vec2 imageBounds;

//   vec2 aspect(vec2 size) {
//     return size / min(size.x, size.y);
//   }

//   // Function to get the distance from a point to a rounded rectangle
//   float roundedRect(vec2 p, vec2 b, float r) {
//       vec2 d = abs(p - vec2(0.5, 0.5)) - b + vec2(r);
//       return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
//   }

//   void main() {
//       vec2 uv = vUv;

//       // Define the border size for the rectangle
//       vec2 borderSize = vec2(0.5, viewportHeight * 0.5 - 0.02);  // Adjusted a bit for border

//       // Calculate the distance to the rounded rectangle
//       float dist = roundedRect(uv, borderSize, 0.05);  // Final argument is border radius

//       vec2 s = aspect(scale);          // Scale aspect ratio
//       vec2 i = aspect(imageBounds);    // Image aspect ratio

//       float rs = s.x / s.y;
//       float ri = i.x / i.y;

//       // Adjust UV based on aspect ratios
//       vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
//       vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
//       uv = vUv * s / new + offset;

//       // Use the distance function to create the mask
//       if (dist < 0.0) {
//           // gl_FragColor = texture2D(tex, uv);
//           vec4 color = texture2D(tex, uv);
//           gl_FragColor = vec4(color[0], color[1], color[2], viewportHeight + 0.1);
//       } else {
//           discard;
//       }
//   }
//    `
// )
// extend({ ImageMaterial })

"use client";

import useTabVisible from "@/hooks/ui/use-tab-visible";
import { Canvas, RootState, useFrame, useThree } from "@react-three/fiber";
import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Color, IUniform, Mesh, ShaderMaterial } from "three";

type NormalizedRGB = [number, number, number];

const resolveCSSColor = (color: string): NormalizedRGB => {
  if (typeof document === "undefined") return [1, 1, 1];

  const probe = document.createElement("div");
  probe.style.color = color;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [1, 1, 1];
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  uBrightness: UniformValue<number>;
  uVignetteStrength: UniformValue<number>;
  uVignetteSoftness: UniformValue<number>;
  uBgColor: UniformValue<Color>;
  [uniform: string]: IUniform;
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform float uBrightness;
uniform float uVignetteStrength;
uniform float uVignetteSoftness;
uniform vec3  uBgColor;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;

  // Brightness
  col.rgb *= uBrightness;

  // Radial vignette — grows from corners inward.
  // uVignetteStrength = 0 → no effect, 1 → edges fully blend to uBgColor.
  // uVignetteSoftness controls how gradual the falloff is (0 = sharp, 1 = very gradual).
  vec2  vigUv  = vUv - 0.5;                        // center at (0,0)
  float dist   = length(vigUv);                    // 0 at center, ~0.71 at corners
  float inner  = 0.5 - uVignetteSoftness * 0.4;   // blend start (pulled inward by softness)
  float shape  = smoothstep(inner, 0.71, dist);    // 0 at center, 1 at corners
  float vignette = shape * uVignetteStrength;      // 0 strength = fully off
  col.rgb = mix(col.rgb, uBgColor, clamp(vignette, 0.0, 1.0));

  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane(
  { uniforms },
  ref,
) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      mesh.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial & {
        uniforms: SilkUniforms;
      };
      material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  /** 0 = full color, 1 = black. Default 1. */
  brightness?: number;
  /**
   * vignetteStrength: 0 = off, 1 = edges fully blend to vignetteColor. Default 0.
   * vignetteSoftness: 0 = sharp edge, 1 = very gradual falloff. Default 1.
   * vignetteColor: color to blend toward at edges. Default "var(--background)".
   */
  vignetteStrength?: number;
  vignetteSoftness?: number;
  vignetteColor?: string;
}

const Silk: React.FC<SilkProps> = ({
  speed = 5,
  scale = 1,
  color = "var(--primary)",
  noiseIntensity = 1.2,
  rotation = 0,
  brightness = 1,
  vignetteStrength = 0,
  vignetteSoftness = 1,
  vignetteColor = "var(--background)",
}) => {
  const meshRef = useRef<Mesh>(null);
  const isTabVisible = useTabVisible();
  const [isReady, setIsReady] = useState(false);

  const uniforms = useMemo<SilkUniforms>(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...resolveCSSColor(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
      uBrightness: { value: brightness },
      uVignetteStrength: { value: vignetteStrength },
      uVignetteSoftness: { value: vignetteSoftness },
      uBgColor: { value: new Color(...resolveCSSColor(vignetteColor)) },
    }),
    [], // created once — props are synced imperatively below
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as ShaderMaterial & { uniforms: SilkUniforms };
    mat.uniforms.uSpeed.value = speed;
    mat.uniforms.uScale.value = scale;
    mat.uniforms.uNoiseIntensity.value = noiseIntensity;
    mat.uniforms.uRotation.value = rotation;
    mat.uniforms.uColor.value.setRGB(...resolveCSSColor(color));
    mat.uniforms.uBrightness.value = brightness;
    mat.uniforms.uVignetteStrength.value = vignetteStrength;
    mat.uniforms.uVignetteSoftness.value = vignetteSoftness;
    mat.uniforms.uBgColor.value.setRGB(...resolveCSSColor(vignetteColor));
  }, [
    speed,
    scale,
    noiseIntensity,
    rotation,
    color,
    brightness,
    vignetteStrength,
    vignetteSoftness,
    vignetteColor,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: isReady ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={isTabVisible ? "always" : "never"}
        style={{ width: "100%", height: "100%" }}
        onCreated={() => setIsReady(true)}
      >
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
};

export default Silk;

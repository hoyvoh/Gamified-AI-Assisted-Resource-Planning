import type { ReactNode } from "react";

type ThreeValue =
  | boolean | number | string | null | undefined | object | ReactNode
  | Float32Array | ((e: { stopPropagation: () => void }) => void)
  | [number, number] | [number, number, number] | [number, number, number, number]
  | [number, number, number, number, number] | [number, number, number, number, number, number]
  | [number, number, number, number, number, number, number]
  | [number, number, number][];

type Props = { children?: ReactNode; [k: string]: ThreeValue };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: Props;
      boxGeometry: Props;
      bufferAttribute: Props;
      bufferGeometry: Props;
      capsuleGeometry: Props;
      circleGeometry: Props;
      color: Props;
      cylinderGeometry: Props;
      directionalLight: Props;
      fog: Props;
      group: Props;
      line: Props;
      lineBasicMaterial: Props;
      mesh: Props;
      meshBasicMaterial: Props;
      meshStandardMaterial: Props;
      octahedronGeometry: Props;
      pointLight: Props;
      points: Props;
      pointsMaterial: Props;
      ringGeometry: Props;
      sphereGeometry: Props;
      torusGeometry: Props;
    }
  }
}

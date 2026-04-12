declare module "three" {
  export type ColorRepresentation = string | number;

  export interface Material {}

  export interface Object3D {
    name: string;
    visible: boolean;
    isMesh?: boolean;
    traverse: (callback: (child: Object3D) => void) => void;
  }

  export interface Group extends Object3D {
    position: {
      x: number;
      y: number;
      z: number;
      setScalar: (value: number) => void;
    };
    rotation: {
      y: number;
    };
    scale: {
      setScalar: (value: number) => void;
    };
  }

  export interface Mesh extends Object3D {
    isMesh: true;
    castShadow: boolean;
    receiveShadow: boolean;
    material: Material | Material[];
  }

  export interface MeshStandardMaterial extends Material {
    emissive: Color;
    emissiveIntensity: number;
  }

  export interface MeshPhysicalMaterial extends Material {
    emissive: Color;
    emissiveIntensity: number;
  }

  export class Color {
    constructor(value?: string);
    clone(): Color;
    copy(color: Color): Color;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
  }

  export class Box3 {
    min: Vector3;
    max: Vector3;
    setFromObject(object: Object3D): Box3;
    getSize(target: Vector3): Vector3;
    getCenter(target: Vector3): Vector3;
  }
}

declare module "three/examples/jsm/utils/SkeletonUtils.js" {
  export function clone<T>(source: T): T;
}

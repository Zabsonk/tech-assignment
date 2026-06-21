export interface SceneConfig {
    x?: number;
    y?: number;

    // Pivot point based on object dimensions.
    pivotX?: ObjectPos;
    pivotY?: ObjectPos;

    // Positioning based on parent container dimensions. x/y will be added to the calculated position.
    centeriseX?: ObjectPos;
    centeriseY?: ObjectPos;

    scaleX?: number;
    scaleY?: number;
    width?: number;
    height?: number;
    alpha?: number;
    visible?: boolean;
    rotation?: number;

    // If set, the builder will create a Sprite with given texture
    asset?: string;
    [key: string]: unknown;
}

export interface SceneData extends SceneConfig {
    id: string;
    path: string;
    parent: SceneData | null;
    children: Map<string, SceneData>;
}

// -1 - left/top aligned
// 0 - center aligned
// 1 - right/bottom aligned
export type ObjectPos = -1 | 0 | 1;

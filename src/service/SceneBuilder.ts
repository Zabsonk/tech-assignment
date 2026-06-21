export interface SceneData {
    x: number;
    y: number;
    scaleX?: number;
    scaleY?: number;
}

export class SceneBuilder {
    private sceneData: Map<string, SceneData> = new Map();
    public static build() {}
}

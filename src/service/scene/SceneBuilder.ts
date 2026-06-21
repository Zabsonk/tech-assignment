import { Container, Sprite, Text } from 'pixi.js';
import { type SceneConfig, type SceneData } from './SceneData';
import { AssetsManager } from '../AssetsManager';
import assetsConfig from '../../../config/assetsConfig.json';

export class SceneBuilder {
    private static _scenes = new Map<string, SceneData>();

    private constructor() {}

    public static async init(): Promise<void> {
        SceneBuilder._scenes.clear();

        const loaded = await Promise.all(
            assetsConfig.layouts.map(async ({ name, src }) => {
                const response = await fetch(src);
                const config: SceneConfig = await response.json();
                return { name, config };
            }),
        );

        for (const { name, config } of loaded) {
            SceneBuilder._scenes.set(name, {
                ...config,
                id: name,
                path: name,
                parent: null,
                children: new Map(),
            });
        }
    }

    public static build<TType extends Container = Container, TConfig = undefined>(
        sceneName: string,
        parentContainer: Container,
        type?: new (...args: any[]) => Container,
        config?: TConfig,
    ): TType {
        const sceneData = SceneBuilder.get(sceneName);
        if (!sceneData) {
            throw new Error(`[SceneBuilder] scene "${sceneName}" not found`);
        }

        const sceneObject = SceneBuilder._buildNode(sceneData, parentContainer, type, config);
        parentContainer.addChild(sceneObject);
        return sceneObject as TType;
    }

    public static get(path: string): SceneData | undefined {
        return SceneBuilder._scenes.get(path);
    }

    private static _buildNode<TConfig>(
        data: SceneData,
        parent: Container,
        type?: new (config?: TConfig) => Container,
        config?: TConfig,
    ): Container {
        let sceneObject: Container;
        if (data.asset) {
            sceneObject = new Sprite(AssetsManager.get(data.asset));
        } else {
            sceneObject = type ? new type(config ?? undefined) : new Container();
        }
        const { x, y } = SceneBuilder._calculatePositions(data, parent);
        sceneObject.x = x;
        sceneObject.y = y;

        sceneObject.width = data.width ?? sceneObject.width;
        sceneObject.height = data.height ?? sceneObject.height;

        sceneObject.scale.x *= data.scaleX ?? 1;
        sceneObject.scale.y *= data.scaleY ?? 1;

        sceneObject.alpha = data.alpha ?? 1;
        sceneObject.visible = data.visible ?? true;
        sceneObject.rotation = (data.rotation ?? 0) * (Math.PI / 180);

        const { x: pivotX, y: pivotY } = SceneBuilder._calculatePivots(data, sceneObject);
        sceneObject.pivot.x = pivotX;
        sceneObject.pivot.y = pivotY;

        if (sceneObject instanceof Text) {
            sceneObject.anchor.x = data.anchorX ?? 0;
            sceneObject.anchor.y = data.anchorY ?? 0;
        }

        return sceneObject;
    }

    private static _calculatePositions(
        data: SceneData,
        parent: Container,
    ): { x: number; y: number } {
        let x = 0;
        let y = 0;

        if (data.centeriseX !== undefined) {
            x = data.centeriseX === 0 ? parent.width / 2 : data.centeriseX === 1 ? parent.width : 0;
        }
        if (data.centeriseY !== undefined) {
            y =
                data.centeriseY === 0
                    ? parent.height / 2
                    : data.centeriseY === 1
                      ? parent.height
                      : 0;
        }
        return {
            x: x + (data.x ?? 0),
            y: y + (data.y ?? 0),
        };
    }

    private static _calculatePivots(
        data: SceneData,
        sceneObject: Container,
    ): { x: number; y: number } {
        return {
            x:
                data?.pivotX === 0
                    ? sceneObject.width / 2
                    : data?.pivotX === 1
                      ? sceneObject.width
                      : 0,
            y:
                data?.pivotY === 0
                    ? sceneObject.height / 2
                    : data?.pivotY === 1
                      ? sceneObject.height
                      : 0,
        };
    }
}

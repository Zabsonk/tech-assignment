import { Container, Sprite } from 'pixi.js';
import { type SceneConfig, type SceneData } from './SceneData';
import { AssetsManager } from '../service/AssetsManager';

const SCENE_FILE = 'scene.json';
const LAYOUTS_MARKER = 'layouts/';

const layoutFiles = import.meta.glob('../layouts/**/scene.json', {
    import: 'default',
}) as Record<string, () => Promise<SceneConfig>>;

export class SceneBuilder {
    private static _scenes = new Map<string, SceneData>();

    private constructor() {}

    public static async init(): Promise<void> {
        SceneBuilder._scenes.clear();

        const fullPathToId = new Map<string, string>();

        const loaded = await Promise.all(
            Object.entries(layoutFiles).map(async ([filePath, load]) => ({
                filePath,
                config: await load(),
            })),
        );

        for (const { filePath, config } of loaded) {
            const fullPath = SceneBuilder._toFullPath(filePath);
            if (fullPath === null) continue;

            const id = fullPath.split('/').at(-1)!;

            fullPathToId.set(fullPath, id);

            const node: SceneData = {
                ...config,
                id,
                path: id,
                parent: null,
                children: new Map(),
            };

            SceneBuilder._scenes.set(id, node);
        }

        for (const [fullPath, id] of fullPathToId) {
            const parts = fullPath.split('/');
            if (parts.length < 2) continue;

            const parentFullPath = parts.slice(0, -1).join('/');
            const parentId = fullPathToId.get(parentFullPath);
            if (!parentId) continue;

            const node = SceneBuilder._scenes.get(id);
            const parent = SceneBuilder._scenes.get(parentId);
            if (node && parent) {
                node.parent = parent;
                parent.children.set(id, node);
            }
        }
    }

    public static build<TType extends Container = Container>(
        sceneName: string,
        parentContainer: Container,
        type?: new () => TType,
    ): TType | undefined {
        const sceneData = SceneBuilder.get(sceneName);
        if (!sceneData) {
            console.warn(`Scene "${sceneName}" not found.`);
            return undefined;
        }

        const sceneObject = SceneBuilder._buildNode(sceneData, parentContainer, type);
        parentContainer.addChild(sceneObject);
        return sceneObject as TType;
    }

    public static get(path: string): SceneData | undefined {
        return SceneBuilder._scenes.get(path);
    }

    private static _toFullPath(filePath: string): string | null {
        const normalized = filePath.replace(/\\/g, '/');
        const markerIdx = normalized.indexOf(LAYOUTS_MARKER);
        if (markerIdx === -1) return null;

        const afterMarker = normalized.slice(markerIdx + LAYOUTS_MARKER.length);
        if (!afterMarker.endsWith('/' + SCENE_FILE)) return null;

        return afterMarker.slice(0, -(SCENE_FILE.length + 1));
    }

    private static _buildNode(
        data: SceneData,
        parent: Container,
        type?: new () => Container,
    ): Container {
        let sceneObject: Container;
        if (data.asset) {
            sceneObject = new Sprite(AssetsManager.get(data.asset));
        } else {
            sceneObject = type ? new type() : new Container();
        }
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
        sceneObject.x = x + (data.x ?? 0);
        sceneObject.y = y + (data.y ?? 0);

        sceneObject.width = data.width ?? sceneObject.width;
        sceneObject.height = data.height ?? sceneObject.height;

        sceneObject.scale.x *= data.scaleX ?? 1;
        sceneObject.scale.y *= data.scaleY ?? 1;

        sceneObject.alpha = data.alpha ?? 1;
        sceneObject.visible = data.visible ?? true;
        sceneObject.rotation = (data.rotation ?? 0) * (Math.PI / 180);

        sceneObject.pivot.x =
            data?.pivotX === 0 ? sceneObject.width / 2 : data?.pivotX === 1 ? sceneObject.width : 0;
        sceneObject.pivot.y =
            data?.pivotY === 0
                ? sceneObject.height / 2
                : data?.pivotY === 1
                  ? sceneObject.height
                  : 0;

        return sceneObject;
    }
}

import { SceneConfig } from '../scene/SceneData';

// Parcel glob import: import * as x from '../layouts/**/scene.json'
// Result is a map of { filePath: parsedJson }
declare module '../layouts/**/scene.json' {
    const scenes: Record<string, SceneConfig>;
    export = scenes;
}

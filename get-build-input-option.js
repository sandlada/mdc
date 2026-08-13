import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {string} rootDir
 * @param {Array<string>} ignore
 * @returns {Array<string>}
 */
function resolvePaths(rootDir, ignore = []) {
    /**
     * @type {Array<string>}
     */
    const results = [];

    function walk(dir) {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                const relativeDir = path.relative(rootDir, filePath);
                if (!ignore.some((pattern) => relativeDir.startsWith(pattern))) {
                    walk(filePath);
                }
            } else {
                results.push(path.relative(rootDir, filePath));
            }
        });
    }

    walk(rootDir);
    return results;
}

/**
 * src/....ts
 */
export const getComponentModuleInputEntries = () => {
    const allPaths = resolvePaths(path.join(__dirname, './src')).filter((e) => e.endsWith(`.ts`))

    console.log(allPaths);


    /**
     * @type {Record<string, string>}
     */
    const entries = {};
    for (const filePath of allPaths) {
        const filePathArray = filePath.split(path.sep);
        if (filePathArray.length <= 1) {
            // continue;
        }

        const compFile = filePathArray[filePathArray.length - 1];
        const compFolder = filePathArray[1]
        const compPath = `src${path.sep}${filePathArray.join(path.sep)}`;
        entries[`${compPath.replace(`src${path.sep}`, ``).replace(`.ts`, ``)}`] = compPath;
    }
    return entries;
};

console.log(getComponentModuleInputEntries());

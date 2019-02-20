import score from "../score";
import readConfig from "../readConfig";

const ctCfgFile = "contest.json";

/**
 * Parse Object into Date object
 * @param {Object} timeData
 */
function parseTime(timeData) {
    try {
        if (Array.isArray(timeData)) return new Date(...timeData);
        else return new Date(timeData);
    } catch (err) {
        throw new Error("Invalid Time");
    }
}

/**
 * Parse Problem List
 * @param {Array} container
 */
function parseContainer(container) {
    if (!Array.isArray(container)) throw new Error("Invalid Container");
    return container
        .map((x) => String(x).toUpperCase())
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Parse contest config file
 */
function parseCtCfg(configData) {
    let {
        name,
        startTime,
        endTime,
        mode,
        probList,
        allowedCodeExt
    } = configData;

    name = String(name);
    mode = String(mode);
    if (!score.hasOwnProperty(mode)) throw new Error("Invalid mode");

    startTime = parseTime(startTime);
    endTime = parseTime(endTime);

    if (startTime >= endTime) throw new Error("Start time is after end time");

    return {
        name: name,
        mode: mode,
        startTime: startTime,
        endTime: endTime,
        probList: parseContainer(probList),
        allowedCodeExt: parseContainer(allowedCodeExt)
    };
}

/**
 * Read Config from contest.json
 */
function contestConfig() {
    try {
        return parseCtCfg(readConfig(contestConfig));
    } catch (err) {
        throw new Error(
            `Invalid contest file (${contestConfig}): ${err.message}`
        );
    }
}

export default contestConfig;
export { parseCtCfg, ctCfgFile };

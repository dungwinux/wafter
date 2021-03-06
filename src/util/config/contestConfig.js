"use strict";

const score = require("../score");
const Config = require("./config");
const getNow = require("../getNow");

/**
 * Parse ISO 8601 into Date object
 * @param {String} timeData ISO 8601 String
 */
function parseTime(timeData) {
    // Must be a number
    if (new Date(timeData).toJSON() !== timeData)
        throw new Error("Invalid Time");
    else return new Date(timeData);
}

/**
 * Parse Problem List
 * @param {Array<String>} container
 */
function parseContainer(container) {
    if (!Array.isArray(container)) throw new Error("Invalid Container");
    let parsedContainer = container
        .filter((x) => typeof x === "string")
        .map((x) => x.replace(/\s/g, "").toUpperCase())
        .sort((a, b) => a.localeCompare(b));
    return [...new Set(parsedContainer)];
}

/**
 * Parse & validate contest config data into formatted one
 * @param {Object} configData
 */
function parseCtCfg(configData) {
    let {
        name,
        startTime,
        endTime,
        mode,
        probList,
        allowedCodeExt,
        allowEveryoneReg
    } = configData;

    name = String(name);
    mode = String(mode);
    allowEveryoneReg = !!allowEveryoneReg;

    if (!Reflect.has(score, mode)) throw new Error("Invalid mode");

    startTime = parseTime(startTime);
    endTime = parseTime(endTime);

    if (startTime >= endTime) throw new Error("Start time is after end time");

    probList = parseContainer(probList);
    if (probList.length === 0)
        throw new Error(
            "Problem list is empty or malformed! Please add problem code to 'probList' in contest.json"
        );

    allowedCodeExt = parseContainer(allowedCodeExt);
    if (allowedCodeExt.length === 0)
        throw new Error(
            "Allowed code extension list is empty or malformed! Please add code extension to 'allowedCodeExt' in contest.json"
        );

    return {
        name: name,
        mode: mode,
        startTime: startTime,
        endTime: endTime,
        probList: parseContainer(probList),
        allowedCodeExt: parseContainer(allowedCodeExt),
        allowEveryoneReg: allowEveryoneReg
    };
}

/**
 * Create sample of contest config
 */
function getSample() {
    const now = getNow();
    const start = now.toJSON();
    now.setHours(now.getHours() + 1);
    const end = now.toJSON();
    return {
        name: "Contest",
        mode: "OI",
        startTime: start,
        endTime: end,
        probList: [],
        allowedCodeExt: [".CPP", ".C"],
        allowEveryoneReg: false
    };
}

module.exports = new Config("contest.json", parseCtCfg, getSample);

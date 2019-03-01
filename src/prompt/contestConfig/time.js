"use strict";

const Enquirer = require("enquirer");

const enquirer = new Enquirer();

const getNow = () => {
    const now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes((Math.ceil(now.getMinutes() / 15) + 1) * 15);
    return now;
};

const timeList = (() => {
    let now = getNow();
    const res = {};
    for (let i = 0; i < 40; ++i) {
        res[now.toLocaleString()] = now;
        now.setMinutes(now.getMinutes() + 15);
    }
    return res;
})();

const offSetList = (() => {
    let now = new Date(0);
    const res = {};
    for (let i = 1; i <= 20; ++i) {
        now.setMinutes(now.getMinutes() + 15);
        let str = "";
        if (now.getHours() > 7)
            str += (now.getHours() - 7).toString() + " hour(s) ";
        if (now.getMinutes() !== 0)
            str += now.getMinutes().toString() + " minute(s)";
        res[str.trim()] = i * 15 * 60 * 1000;
    }
    return res;
})();

const timePrompt = enquirer.prompt([
    {
        type: "select",
        name: "startTime",
        message: "Start time:",
        choices: Object.keys(timeList),
        limit: 5,
        result: (val) => timeList[val]
    },
    {
        type: "select",
        name: "offset",
        message: "Duration:",
        choices: Object.keys(offSetList),
        limit: 5,
        initial: "1 hour(s)",
        result: (val) => offSetList[val]
    }
]);

module.exports = timePrompt.then((value) => {
    value.endTime = new Date(value.startTime.getTime() + value.offset);
    delete value.offset;
});

import zipdir from "zip-dir";
import isZip from "is-zip";
import Console from "console";
import { basename, extname, join } from "path";

import kon from "../config/kon";
import { submitCode } from "../data/database";
import { updateSubmission } from "../data/database";

const Judgers = kon.judgers;

/**
 * Zip task folder then send it to Judgers
 */
export function initJudger() {
    const arcPath = "Tasks.zip";
    zipdir(kon.tasks, { saveTo: arcPath }, (err, buf) => {
        if (err) throw err;
        if (!isZip(buf)) throw Error("Invalid folder");
        Judgers.forEach((judger) => {
            judger.clone(arcPath).then(
                (boo) => {
                    if (!boo) throw Error();
                    Console.log(`Sucessfully cloned ${judger.serverAddress}]`);
                },
                () => {
                    Console.log(`Failed to clone ${judger.serverAddress}`);
                }
            );
        });
    });
}

/**
 * Parse Submission from kon.js for verdict
 * @param {Submission} sub Submission from kon.js
 * @returns {String} verdict
 */
function getVerdict(sub) {
    const tests = sub.tests;

    let verdict = "AC";
    if (tests)
        tests.some((x, i, arr) => {
            if (x.verdict !== "AC") {
                verdict = arr[i];
                return true;
            }
        });
    else verdict = "CE";

    return verdict;
}

/**
 * Update submission status from log from kons'
 */
export function reloadSubs() {
    const judgerPromise = Judgers.map((judger) => judger.get());
    Promise.all(judgerPromise)
        .then((list) => [].concat.apply([], list))
        .then((subs) => {
            subs.forEach((sub) => {
                const verdict = getVerdict(sub);
                updateSubmission(sub.id, verdict, sub.finalScore, sub.tests);
            });
        })
        .catch((err) => {
            throw err;
        });
}

/**
 * Add submission to database then send part of it to Judger
 * @param {PathLike} source_code_path Path to source code
 * @param {String} user_id User's ID
 * @param {String} prob_name file's name
 */
export async function sendCode(source_code_path, user_id, prob_name) {
    try {
        prob_name = prob_name.toUpperCase();
        const prob_id = basename(prob_name, extname(prob_name));
        const sub_id = await submitCode(source_code_path, user_id, prob_id);
        const qPromise = Judgers.map((judger) => judger.qLength());

        const judgersQ = await Promise.all(qPromise);
        const judgerNum = judgersQ
            .map((val, iter) => [val, iter])
            .sort()
            .shift()[1];
        const judger = Judgers[judgerNum];

        judger.send(source_code_path, prob_name, sub_id).catch((err) => {
            throw err;
        });
        setTimeout(() => reloadSubs(), 100);
    } catch (err) {
        throw err;
    }
}

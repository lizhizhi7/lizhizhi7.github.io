const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');
const SECRET_ID = process.env.TENCENT_COS_SECRET_ID
const SECRET_KEY = process.env.TENCENT_COS_SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const DEBUG = process.env.DEBUG;
const SOURCE_PATH = './_site';
const MAX_UPLOAD_FILES = 2000;

var cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY
});
cos.headBucket({
    Bucket: BUCKET_NAME,
    Region: BUCKET_REGION,
}, function (err, data) {
    if (err) {
        console.error(err.error);
        console.error('Bucket Not Exists!');
        process.exit(1);
    }
});

let FILE_NUMBER = 0;
const uploadFiles = async (items) => {
    // First Call.
    if (!items) {
        items = traverseDirSync(SOURCE_PATH, { nodir: true });
        console.log("Files Counting:", items.length);
        FILE_NUMBER = items.length;
    }
    // Upload Successfully.
    if(items.length == 0) {
        console.log("Uploading Successfully!");
        return;
    }
    let key;
    const promises = [];

    items.splice(0, MAX_UPLOAD_FILES).forEach((item) => {
        key = path.relative(SOURCE_PATH, item.path);
        if (path.sep === '\\') {
            key = key.replace(/\\/g, '/');
        }
        const itemParams = {
            Bucket: BUCKET_NAME,
            Region: BUCKET_REGION,
            Key: key,
            Body: fs.createReadStream(item.path),
            onProgress: (progressData) => {
                if (DEBUG) {
                    console.log(filePath, JSON.stringify(progressData));
                }
            },
        };
        promises.push(cos.putObject(itemParams));
    });
    try {
        await Promise.all(promises);
    } catch (err) {
        console.error(`Uploading Error`, err);
    } finally {
        console.log(`Progress: ${parseInt((1 - items.length / FILE_NUMBER) * 100)}%`);
        await uploadFiles(items);
    }
}


/**
 * Read filesystem recursively.
 * @param {string} dir Directory need to read.
 * @param {{
 *      depthLimit?: number;
 *      rootDepth?: number;
 *      filter?: (item: { path: string; stats: fs.Stats }) => boolean;
 *      nodir?: boolean;
 *      nofile?: boolean;
 *      traverseAll?: boolean;
 * }} opts Options
 * @param {{ path: string; stats: fs.Stats }[]} ls For recursive usage
 * @returns Array of path & fs.Stats
 */
function traverseDirSync(dir, opts, ls) {
    if (!ls) {
        ls = [];
        dir = path.resolve(dir);
        opts = opts ?? {};
        if (opts?.depthLimit ?? -1 > -1) {
            opts.rootDepth = dir.split(path.sep).length + 1;
        }
    }
    const paths = fs.readdirSync(dir).map((p) => dir + path.sep + p);
    for (let i = 0; i < paths.length; i++) {
        const pi = paths[i];
        const st = fs.statSync(pi);
        const item = { path: pi, stats: st };
        const isUnderDepthLimit =
            !opts?.rootDepth || pi.split(path.sep).length - opts.rootDepth < (opts?.depthLimit ?? -1);
        const filterResult = opts?.filter ? opts.filter(item) : true;
        const isDir = st.isDirectory();
        const shouldAdd = filterResult && (isDir ? !opts?.nodir : !opts?.nofile);
        const shouldTraverse = isDir && isUnderDepthLimit && (opts?.traverseAll || filterResult);
        if (shouldAdd) {
            ls?.push(item);
        }
        if (shouldTraverse) {
            ls = traverseDirSync(pi, opts, ls);
        }
    }
    return ls;
}
console.log("Uploading Start");
uploadFiles();
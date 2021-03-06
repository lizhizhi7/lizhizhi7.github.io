const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');
const SECRET_ID = process.env.TENCENT_COS_SECRET_ID
const SECRET_KEY = process.env.TENCENT_COS_SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const PIC_BUCKET_NAME = process.env.PIC_BUCKET_NAME;
const PIC_BUCKET_REGION = process.env.PIC_BUCKET_REGION;
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
        console.error('WebSite Bucket Not Exists!');
        process.exit(1);
    }
});
cos.headBucket({
    Bucket: PIC_BUCKET_NAME,
    Region: PIC_BUCKET_REGION,
}, function (err, data) {
    if (err) {
        console.error(err.error);
        console.error('Pic Bucket Not Exists!');
        process.exit(1);
    }
});

let FILE_NUMBER = 0;
const uploadFiles = async (items) => {
    // First Call.
    if (!items) {
        items = traverseDirSync(SOURCE_PATH, {
            nodir: true,
            filter: ({ path, stats }) => {
                if (!stats.isDirectory() && path.indexOf('/img/background-') > 0) {
                    return false
                }
                return true;
            }
        });
        console.log("Files Counting:", items.length);
        FILE_NUMBER = items.length;
    }
    // Upload Successfully.
    if (items.length == 0) {
        console.log("Files Uploading Successfully!");
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
        console.error(`Files Uploading Error`, err);
    } finally {
        console.log(`Files Progress: ${parseInt((1 - items.length / FILE_NUMBER) * 100)}%`);
        await uploadFiles(items);
    }
}

let PIC_NUMBER = 0;
const uploadPics = async (items) => {
    // First Call.
    if (!items) {
        items = traverseDirSync(SOURCE_PATH, {
            nodir: true,
            filter: ({ path, stats }) => {
                if (stats.isDirectory() || (!stats.isDirectory() && path.indexOf('/img/background-') > 0)) {
                    return true;
                }
                return false;
            }
        });
        console.log("Pics Counting:", items.length);
        PIC_NUMBER = items.length;
    }
    // Upload Successfully.
    if (items.length == 0) {
        console.log("Pics Uploading Successfully!");
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
            Bucket: PIC_BUCKET_NAME,
            Region: PIC_BUCKET_REGION,
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
        console.error(`Pics Uploading Error`, err);
    } finally {
        console.log(`Pics Progress: ${parseInt((1 - items.length / FILE_NUMBER) * 100)}%`);
        await uploadPics(items);
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
uploadPics();
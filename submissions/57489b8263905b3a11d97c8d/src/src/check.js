/**
 * Created by kriz on 23/05/16.
 */

import fs from 'fs';
import {init, test} from './solution';


function main(target, testcases){
    let data;
    if (fs.existsSync(`${target}/data.gz`))
        data = zlib.gunzipSync(fs.readFileSync(`${target}/data.gz`));
    else if (fs.existsSync(`${target}/data`))
        data = fs.readFileSync(`${target}/data`);
    init(data);
    let global_score = 0, total = 0;
    for (let file of fs.readdirSync(testcases).sort())
    {
        let tc = JSON.parse(fs.readFileSync(`${testcases}/${file}`, 'utf8'));
        let score = 0;
        for (let word in tc)
        {
            let correct = tc[word];
            let res = test(word);
            if (res==correct)
            {
                score++;
                global_score++;
            }

            total++;
        }
    }
    console.log(`${global_score/total * 100}%`);
}

process.exit(main(process.argv[2], process.argv[3])||0);

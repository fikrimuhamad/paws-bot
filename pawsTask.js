import fetch from 'node-fetch';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyURL = 'http://ioqrue:1m3sbi7@55.57.111.25:80'; //FORMAT PROXY http://username:password@ip:port
let agent = new HttpsProxyAgent(proxyURL); // jika ingin tidak memakai proxy matikan agent tambahkan // atau ubah menjadi //agent ( line 24 )

function getToken(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    return data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
}
    
function number(number, decimals = 0, decPoint = ',', thousandsSep = '.') {
    const n = parseFloat(number).toFixed(decimals);
    const parts = n.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decPoint);
}

async function getCURL(url, method = 'GET', headers = {}, body = null, returnJson = true) {
    const options = {
        method,
        headers,
        agent
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = returnJson ? await response.json() : await response.text();
    
    return data;
}

// Fungsi format angka
function formatNumber(number, decimals = 0, decPoint = ',', thousandsSep = '.') {
    const n = parseFloat(number).toFixed(decimals);
    const parts = n.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decPoint);
}


const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge WebView2";v="131"',
    'origin': 'https://app.paws.community'
};

(async () => {
    const dataList = getToken('dataAkun.txt');

    console.log(`-------------------------------`);
    console.log(` |            MENU            | `);
    console.log(` [  PAWS.BOT AUTO CLEAR TASK  ] `);
    console.log(`-------------------------------\n`);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    console.log(`[.] MENJALANKAN AUTO CLEAR TASK UNTUK ${dataList.length} AKUN...\n`);

    while (true) {
        for (let i = 0; i < dataList.length; i++) {
            const token = dataList[i];
            const no = i + 1;

            try {
                const params = new URLSearchParams(token);
                const user = JSON.parse(decodeURIComponent(params.get('user')));

                console.log(`====================================================`);
                console.log(`[[#${no}] MENGAMBIL DATA AKUN: ${user.username || ""}]`);

                const infoAkun = await getCURL(
                    'https://api.paws.community/v1/user/auth',
                    'POST',
                    headers,
                    { data: token, referralCode: "wwUszmLF" }
                );

                if (!infoAkun.data) {
                    console.log(`[!] GAGAL MENGAMBIL DATA AKUN #${no}\n`);
                    continue;
                }

                const { chatId, userData, referralData, gameData } = infoAkun.data[1];

                console.log(`[ #.NAME ] : ${userData.firstname || ""} ${userData.lastname || ""} (${chatId})`);
                console.log(`[ #.BALANCE ] : ${formatNumber(gameData.balance)} PAWS`);
                console.log(`[ #.REFF CODE ] : ${referralData.code}`);
                console.log(`[ #.TOTAL REFF ] : ${formatNumber(referralData.referralsCount)}\n`);

                if (infoAkun.data[0]) {
                    const headersss = {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${infoAkun.data[0]}`
                    };

                    await processTasks('https://api.paws.community/v1/quests/list', headersss, "TASK REGULAR");
                    await processTasks('https://api.paws.community/v1/quests/list?type=christmas', headersss, "TASK CHRISTMAS");
                    const cekSaldo = await getCURL('https://api.paws.community/v1/user', 'GET', headersss);
                    if (cekSaldo.success) {
                        const { gameData } = cekSaldo.data.user;
                        console.log(`\n[#] BALLANCE ${formatNumber(gameData.balance)} PAWS`);
                    } else {
                        console.log(`[!] GAGAL CEK BALLANCE!!`);
                    }
                }
            } catch (error) {
                console.error(`[!] ERROR PADA AKUN #${no}: ${error.message}\n`);
            }
        }

        console.log(`[${getCurrentTime()}] SEMUA AKUN BERHASIL DIPROSES, DELAY 24 JAM...`);
        await delay(86400000); // 24 jam
        console.clear();
        console.log(`[${getCurrentTime()}] MEMULAI AUTO CLAIM UNTUK ${dataList.length} AKUN...\n`);
    }
})();

async function processTasks(url, headers, taskType) {
    try {
        const infoClaim = await getCURL(url, 'GET', headers);

        if (!infoClaim.data || !Array.isArray(infoClaim.data)) {
            console.log(`[x] ${taskType} DATA TIDAK DITEMUKAN\n`);
            return;
        }

        for (const task of infoClaim.data) {
            if (!task.progress.claimed) {
                try {
                    const claimTask = await getCURL('https://api.paws.community/v1/quests/completed', 'POST', headers, { questId: task._id });

                    if (claimTask.success) {
                        const gasClaim = await getCURL('https://api.paws.community/v1/quests/claim', 'POST', headers, { questId: task._id });

                        if (gasClaim.success) {
                            console.log(`[#] CLAIM ${task.title.toUpperCase()} => BERHASIL!`);
                        } else {
                            console.log(`[!] GAGAL CLAIM ${task.title.toUpperCase()}!`);
                        }
                    } else {
                        console.log(`[#] CLAIM ${task.title.toUpperCase()} SKIPPED (MANUAL REQUIRED)`);
                    }
                } catch (error) {
                    console.log(`[!] ERROR CLAIM TASK ID ${task._id}: ${error.message}`);
                }
            }
        }

        console.log(`[#] SEMUA ${taskType} BERHASIL DICLAIM!`);
        
    } catch (error) {
        console.log(`[x] ERROR PADA ${taskType}: ${error.message}\n`);
    }
}


function getCurrentTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const timeFormatter = new Intl.DateTimeFormat('en-GB', options);
    const timeParts = timeFormatter.formatToParts(now);

    const hours = timeParts.find(part => part.type === 'hour').value;
    const minutes = timeParts.find(part => part.type === 'minute').value;
    const seconds = timeParts.find(part => part.type === 'second').value;

    return `${hours}:${minutes}:${seconds}`;
}

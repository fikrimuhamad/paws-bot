import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline-sync';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyURL = 'http://ioqrue:1m3sbi7@55.57.111.25:80'; //FORMAT PROXY http://username:password@ip:port
let agent = new HttpsProxyAgent(proxyURL); // jika ingin tidak memakai proxy matikan agent tambahkan // atau ubah menjadi //agent ( line 24 )

// Fungsi untuk membaca file dan mengembalikan isi sebagai array
function readFileLines(filename) {
    if (!fs.existsSync(filename)) {
        console.error(`File ${filename} tidak ditemukan.`);
        return [];
    }

    const content = fs.readFileSync(filename, 'utf8').trim();
    if (content === '') {
        return []; // Kembalikan array kosong jika file kosong
    }

    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

// Fungsi untuk menghapus baris dari file queryReff.txt setelah berhasil/gagal
function removeLineFromFile(filename, lineToRemove) {
    if (!fs.existsSync(filename)) {
        console.error(`File ${filename} tidak ditemukan.`);
        return;
    }

    const data = fs.readFileSync(filename, 'utf-8');
    const trimmedLineToRemove = lineToRemove.trim();

    const updatedData = data
        .split('\n')
        .filter(line => line.trim() !== trimmedLineToRemove) // Hapus baris yang cocok
        .join('\n');

    fs.writeFileSync(filename, updatedData, 'utf-8');
}

// Fungsi format angka
function formatNumber(number, decimals = 0, decPoint = ',', thousandsSep = '.') {
    const n = parseFloat(number).toFixed(decimals);
    const parts = n.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decPoint);
}

// Fungsi untuk melakukan permintaan HTTP
async function getCURL(url, method = 'GET', headers = {}, body = null, returnJson = true) {
    const options = {
        method,
        headers,
        agent
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = returnJson ? await response.json() : await response.text();
        return { status: response.status, data };
    } catch (error) {
        console.error(`Error fetching URL: ${error.message}`);
        return { status: 500, data: null };
    }
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

// Fungsi utama untuk menjalankan proses
(async () => {
    console.log(`-------------------------------`);
    console.log(` |            MENU            | `);
    console.log(` [      PAWS AUTO REFFERAL    ] `);
    console.log(`-------------------------------\n`);

    const dataAkun = readFileLines('dataAkun.txt');
    
    if (dataAkun.length === 0) {
        console.log('[!] Tidak ada data akun yang tersedia.');
        return;
    }

    console.log(`[.] Menjalankan auto refferal dengan total ${dataAkun.length} akun...`);

    let no = 1;
    for (const query of dataAkun) {
        try {
        const params = new URLSearchParams(query);
        const user = JSON.parse(decodeURIComponent(params.get('user')));
        console.log(`\n===============-# [${no}/${dataAkun.length}] RUNNING QUERY ${user.username} # ================\n`);

        const infoAkun = await getCURL('https://api.paws.community/v1/user/auth', 'POST', headers, {'data': query, "referralCode":"wwUszmLF"});
        if (infoAkun.status == 201 && infoAkun.data.data != undefined) {
            const { chatId, userData, referralData, gameData } = infoAkun.data.data[1];
            
            // Tampilkan data yang dibutuhkan
            console.log(`[ #.NAME ] : ${userData.firstname || ""} ${userData.lastname || ""} (${chatId})`);
            console.log(`[ #.BALANCE ] : ${formatNumber(gameData.balance)} PAWS`);
            console.log(`[ #.REFF CODE ] : ${referralData.code}`);
            console.log(`[ #.TOTAL REFF ] : ${formatNumber(referralData.referralsCount)}`);

                if (referralData.referralsCount >= 10) {
                    console.log(`[*] TOTAL REFF SUDAH LEBIH DARI 10, TOTAL: ${referralData.referralsCount} REFF - SKIP AKUN!!`);
                   
                    const headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                        'Content-Type': 'application/json',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge WebView2";v="131"',
                        'origin': 'https://app.paws.community',
                        'authorization': `Bearer ${infoAkun.data.data[0]}`,
                    };
                        
                    const Cektask10Reff = await getCURL('https://api.paws.community/v1/quests/completed', 'POST', headers, 
                        {
                            "questId": "671b8ecb22d15820f13dc61a"
                          });
                    if (Cektask10Reff) {
                        const task10Reff = await getCURL('https://api.paws.community/v1/quests/claim', 'POST', headers, 
                            {
                                "questId": "671b8ecb22d15820f13dc61a"
                              });
                        if (task10Reff.data.data.status == true) {
                            console.log(`[+] BERHASIL CLAIM TASK 10 REFF!!`);
                        } else {
                            console.log(`[!] GAGAL CLAIM TASK 10 REFF!! - REFF BARU ${referralData.referralsCount} KURANG ${referralData.referralsCount} REFF LAGI!!`);
                        }
                    } else {
                        console.log(`[!] GAGAL CEK TASK 10 REFF!! COBA LAGI!!`);
                    }
                    
                    
                    continue; // Skip ke akun berikutnya
                }

                const totalNeededReff = 10 - referralData.referralsCount;
                console.log('\n--------------------------------------------------');
                console.log(`[*] MENJALANKAN KEKURANGAN TOTAL: ${totalNeededReff} REFF`);

               

                let processedReff = 0; // Hitung referral yang sudah diproses
                let success = false;

                    for (let i = 0; i < totalNeededReff; i++) {
                       
                        const reffCode = referralData.code;
                        const queryReff = await readFileLines('queryReff.txt'); // Ambil data referral dari file

                        if (queryReff.length === 0) {
                            console.log("[-] Tidak ada data referral di queryReff.txt. Proses dihentikan.");
                            break; // Skip ke akun berikutnya
                        }
                        
                            for (const referralCode of queryReff) {
                            try {
                                

                        // const referralCode = queryReff[0];


                                const response = await getCURL(
                                    `https://api.paws.community/v1/user/auth`,
                                    'POST',
                                    headers,
                                    { data: referralCode, referralCode: reffCode }
                                );

                                if (response.status === 201 && response.data?.data) {
                                    const { chatId, userData } = response.data.data[1];
                                    const result = response.data.data[3];

                                    if (result?.isShowWinnerModal && result?.isShowBumsModal) {
                                        console.log(`  |-> BERHASIL NGEREFF DENGAN AKUN ${userData.firstname?.toUpperCase() || ''} ${userData.lastname?.toUpperCase() || ''} [ ${userData.username?.toUpperCase() || ''} ( ${chatId} )]!!`);
                                        processedReff++; // Tambah jumlah referral yang diproses
                                        await removeLineFromFile('queryReff.txt', referralCode);

                                        if (referralData.referralsCount >= 10) {
                                            console.log(`[*] TOTAL REFF SUDAH LEBIH DARI 10, TOTAL: ${referralData.referralsCount} REFF - SKIP AKUN!!`);
                                            success = true; // Skip ke akun berikutnya
                                            break;
                                        }
                                        success = true; // Tandai sebagai sukses
                                        break;
                                    } else {
                                        console.log(`  |-> GAGAL NGEREFF!! QUERY SUDAH NGEREFF!!`);
                                        await removeLineFromFile('queryReff.txt', referralCode);
                                    }
                                } else {
                                    console.log(`  |-> GAGAL NGEREFF!! MSG: ${response.data?.error?.toUpperCase() || 'UNKNOWN ERROR'}!!`);
                                    await removeLineFromFile('queryReff.txt', referralCode);
                                    continue;
                                }
                            } catch (err) {
                                console.error(`Error saat menjalankan reff: ${err.message}`);
                            }
                        }

                        if (!success) {
                            console.log(`[!] Gagal memproses referral pada attempt terakhir: ${referralCode}`);
                        }

                    if (!success) {
                        // console.log(`  |-> GAGAL NGEREFF!! QUERY GAGAL DIPROSES SETELAH 2 PERCOBAHAN!!`);
                        removeLineFromFile('queryReff.txt', queryReff[i]);
                        console.log('--------------------------------------------------'); // Pembatas setelah gagal
                    }
                }

                console.log(`[+] Semua ${processedReff} referral berhasil diproses.`);
                if(processedReff == 10){
                const headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Content-Type': 'application/json',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge WebView2";v="131"',
                    'origin': 'https://app.paws.community',
                    'authorization': `Bearer ${infoAkun.data.data[0]}`,
                };
                    
                const Cektask10Reff = await getCURL('https://api.paws.community/v1/quests/completed', 'POST', headers, 
                    {
                        "questId": "671b8ecb22d15820f13dc61a"
                      });
                if (Cektask10Reff) {
                    const task10Reff = await getCURL('https://api.paws.community/v1/quests/claim', 'POST', headers, 
                        {
                            "questId": "671b8ecb22d15820f13dc61a"
                          });
                    if (task10Reff.data.data.status == true) {
                        console.log(`[+] BERHASIL CLAIM TASK 10 REFF!!`);
                    } else {
                        console.log(`[!] GAGAL CLAIM TASK 10 REFF!! - REFF BARU ${referralData.referralsCount} KURANG ${referralData.referralsCount} REFF LAGI!!`);
                    }
                } else {
                    console.log(`[!] GAGAL CEK TASK 10 REFF!! COBA LAGI!!`);
                }
            }
        } else if (infoAkun.status == 500) {
                console.log(`  |-> GAGAL NGEREFF!! QUERY MOKAD / SALAH!!`);
            } else {
            console.log(`[-] Gagal mendapatkan informasi akun. Status: ${infoAkun.status}`);
        }
        no++;
    } catch (err) {
        console.error(`Error saat menjalankan reff: ${err.message}`);
    }
    }

    console.log(`\n\n[+] Semua akun berhasil diproses...`);
}

)();

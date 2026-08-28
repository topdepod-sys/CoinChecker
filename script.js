// ============================================================
// SUPABASE
// ============================================================

const supabaseClient = supabase.createClient(
    "https://uoiorjjsodnbtmiyajly.supabase.co",
    "sb_publishable_CbcQOm9l5ZOVuZjWbZNP2g_D2DziBnT"
);

let pgaAdminData = [];
let pgaMotionData = [];


// ============================================================
// AUTH / SESSION
// ============================================================

let authInitialized = false;
let appInitialized = false;


// Tampilkan aplikasi setelah session ditemukan
function showApp() {

    document.body.classList.remove("login-mode");

    const loginBox = document.getElementById("loginBox");
    const content = document.getElementById("content");
    const hud = document.querySelector(".hud-container");

    if (loginBox) {
        loginBox.style.display = "none";
    }

    if (content) {
        content.style.display = "block";
    }

    if (hud) {
        hud.style.display = "none";
    }

    // Jangan menjalankan semuanya berulang-ulang
    if (!appInitialized) {

        appInitialized = true;

        loadData();
        toggleMenu();
        showDeposit();

    }

    resetIdleTimer();

}


// Tampilkan login
function showLogin() {

    appInitialized = false;

    document.body.classList.add("login-mode");

    const loginBox = document.getElementById("loginBox");
    const content = document.getElementById("content");
    const hud = document.querySelector(".hud-container");

    if (loginBox) {
        loginBox.style.display = "block";
    }

    if (content) {
        content.style.display = "none";
    }

    if (hud) {
        hud.style.display = "none";
    }

}


// ============================================================
// AUTH STATE CHANGE
// ============================================================

supabaseClient.auth.onAuthStateChange((event, session) => {

    console.log("AUTH:", event);

    if (session) {
        showApp();
    } else {
        showLogin();
    }

});


// ============================================================
// CEK SESSION SAAT HALAMAN DIBUKA / REFRESH
// ============================================================

window.addEventListener("DOMContentLoaded", async function () {

    startCyberBoot(async function () {

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.getSession();

            if (error) {

                console.error("Session error:", error);

                showLogin();

                return;

            }

            authInitialized = true;

            if (data && data.session) {

                showApp();

            } else {

                showLogin();

            }

        } catch (err) {

            console.error("Auth initialization error:", err);

            showLogin();

        }

    });

});


// ============================================================
// ENTER = LOGIN
// ============================================================

window.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        if (
            document.activeElement &&
            document.activeElement.id === "password"
        ) {

            login();

        }

    }

});


// ============================================================
// LOGIN
// ============================================================

async function login() {

    const inputElement = document.getElementById("email");
    const passwordElement = document.getElementById("password");

    if (!inputElement || !passwordElement) {
        return;
    }

    const loginInput = inputElement.value.trim();
    const password = passwordElement.value.trim();

    if (!loginInput || !password) {

        alert("Isi username/email dan password");

        return;

    }


    let email = loginInput;


    // ========================================================
    // LOGIN MENGGUNAKAN USERNAME
    // ========================================================

    if (!loginInput.includes("@")) {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("email, role")
            .eq("username", loginInput)
            .maybeSingle();


        if (error) {

            console.error(error);

            alert("Gagal mencari username");

            return;

        }


        if (!data) {

            alert("Username tidak ditemukan");

            return;

        }


        if (!data.email) {

            alert("Email user belum tersedia di profiles");

            return;

        }


        email = data.email;

    }


    // ========================================================
    // LOGIN SUPABASE AUTH
    // ========================================================

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email,
        password: password

    });


    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }


    // Tidak perlu showApp() manual.
    // onAuthStateChange akan menjalankannya.

    console.log("Login berhasil:", data.user);

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    clearTimeout(idleTimer);

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {

        console.error("Logout error:", error);

        alert("Gagal logout");

        return;

    }

    appInitialized = false;

    showLogin();

}


// ============================================================
// LOAD DATA HISTORY
// ============================================================

async function loadData() {

    const {
        data,
        error
    } = await supabaseClient
        .from("history_coin")
        .select("*")
        .order("date", {
            ascending: false
        });


    if (error) {

        console.error(error);

        return;

    }


    const table = document.getElementById("data");

    if (!table) {
        return;
    }


    table.innerHTML = data.map(row => `

        <tr>

            <td>${row.date ?? ""}</td>

            <td>${row.info ?? ""}</td>

            <td>${row.username ?? ""}</td>

            <td>${row.by ?? ""}</td>

            <td>${Number(row.coin || 0).toLocaleString()}</td>

            <td>${Number(row.last_coin || 0).toLocaleString()}</td>

        </tr>

    `).join("");

}


// ============================================================
// PAGE NAVIGATION
// ============================================================

function hideAllPages() {

    const pages = [

        "depositPage",
        "withdrawPage",
        "qrisPage",
        "inputCashBackPage",
        "cashBackPage",
        "doubleCashBackPage",
        "doubleAccPage",
        "formulaPage",
        "depositPgaPage",
        "pgaCheckingPage"

    ];


    pages.forEach(id => {

        const element = document.getElementById(id);

        if (element) {

            element.style.display = "none";

        }

    });

}


function showDepositPga() {

    hideAllPages();

    const page = document.getElementById("depositPgaPage");

    if (page) {
        page.style.display = "block";
    }

}


function showPgaChecking() {

    hideAllPages();

    const page = document.getElementById("pgaCheckingPage");

    if (page) {
        page.style.display = "block";
    }

}


function showDeposit() {

    hideAllPages();

    const page = document.getElementById("depositPage");

    if (page) {
        page.style.display = "block";
    }

}


function showWithdraw() {

    hideAllPages();

    const page = document.getElementById("withdrawPage");

    if (page) {
        page.style.display = "block";
    }

}


function showQris() {

    hideAllPages();

    const page = document.getElementById("qrisPage");

    if (page) {
        page.style.display = "block";
    }

}


function showInputCashBack() {

    hideAllPages();

    const page = document.getElementById("inputCashBackPage");

    if (page) {
        page.style.display = "block";
    }

}


function showCashBack() {

    hideAllPages();

    const page = document.getElementById("cashBackPage");

    if (page) {
        page.style.display = "block";
    }

}


function showDoubleCashBack() {

    hideAllPages();

    const page = document.getElementById("doubleCashBackPage");

    if (page) {
        page.style.display = "block";
    }

}


function showDoubleAcc() {

    hideAllPages();

    const page = document.getElementById("doubleAccPage");

    if (page) {
        page.style.display = "block";
    }

}


function showFormula() {

    hideAllPages();

    const page = document.getElementById("formulaPage");

    if (page) {
        page.style.display = "block";
    }

}


// ============================================================
// FORMULA
// ============================================================

function copyBankFormula() {

    const formula = `=ARRAYFORMULA(QUERY({BRI!B5:C999; BRI!I5:J999; BRI!P5:Q999; BRI!W5:X999; BRI!AD5:AE999; BRI!AK5:AL999; BCA!B5:C1499; BCA!I5:J1499; BCA!P5:Q1499; BCA!W5:X1499; BCA!AD5:AE1499; BCA!AK5:AL1499; BNI!B5:C999; BNI!W5:X999; BNI!I5:J999; BNI!P5:Q999; BNI!AD5:AE999; 'BRI II'!B5:C999; 'BRI II'!I5:J999; 'BRI II'!AD5:AE999; 'BRI II'!P5:Q999; 'BRI II'!W5:X999; BSI!B5:C999; BSI!I5:J999; BSI!P5:Q999; BSI!W5:X999; BSI!AD5:AE999; BSI!AK5:AL999; DEPO!B5:C999; DEPO!I5:J999; DEPO!P5:Q999; DEPO!W5:X999; DEPO!AD5:AE999; DEPO!AK5:AL999; BNS!B5:C2004; BNS!E5:F2004}, "SELECT * WHERE Col2 IS NOT NULL",0))`;

    navigator.clipboard.writeText(formula);

    alert("✅ Formula BANK berhasil dicopy");

}


function copyDanaFormula() {

    const formula = `=QUERY({'DN I'!B5:C2005;'DN I'!K5:L2005;'DN I'!T5:U2005;'DN II'!B5:C2005;'DN II'!K5:L2005;'DN II'!T5:U2005;'DN III'!B5:C2005;'DN III'!K5:L2005;'DN III'!T5:U2005;'DN IV'!B5:C2005;'DN IV'!K5:L2005;'DN IV'!T5:U2005},"SELECT * WHERE Col2 IS NOT NULL",0)`;

    navigator.clipboard.writeText(formula);

    alert("✅ Formula DANA berhasil dicopy");

}


function copyWithdrawFormula() {

    const formula = `=QUERY({'WD BCA'!B5:C999;'WD BCA'!I5:J999;'WD BCA'!P5:Q999;'WD BCA'!W5:X999;'WD BCA'!AD5:AE999;'WD BCA'!AK5:AL999;'WD BCA 2'!B5:C999;'WD BCA 2'!I5:J999;'WD BCA 2'!P5:Q999;'WD BCA 2'!W5:X999;'WD BCA 2'!AD5:AE999;'WD BCA 2'!AK5:AL999;'WD BRI'!B5:C999;'WD BRI'!I5:J999;'WD BRI'!P5:Q999;'WD BRI'!W5:X999;'WD BRI'!AD5:AE999;'WD BNI'!B5:C999;'WD BNI'!I5:J999;'WD BNI'!P5:Q999;'WD BNI'!W5:X999;'WD BNI'!AD5:AE999;'BANK TAMPUNG'!B5:C999;'BANK TAMPUNG'!I5:J999;'BANK TAMPUNG'!P5:Q999;'BANK TAMPUNG'!W5:X999;'BANK TAMPUNG'!AD5:AE999;'BANK TAMPUNG'!AK5:AL999;'WD BSI'!B5:C999;'WD BSI'!I5:J999;'WD BSI'!P5:Q999;'WD BSI'!W5:X999;'WD BSI'!AD5:AE999;'WD PGA'!B5:C999;'WD PGA'!I5:J999;'WD PGA'!P5:Q999;'WD PGA'!AD5:AE999;'WD PGA'!AK5:AL999;'WD PGA'!AR5:AS999;'WD PGA'!AY5:AZ999;'WD PGA'!BF5:BG999;'WD PGA'!BM5:BN999;'WD PGA'!BT5:BU999;BNS!F5:G999},"SELECT * WHERE Col2 IS NOT NULL",0)`;

    navigator.clipboard.writeText(formula);

    alert("✅ Formula WITHDRAW berhasil dicopy");

}


function copyCashBackFormula() {

    const formula = `=ARRAYFORMULA(QUERY({
'CB1'!B4:H1003;'CB1'!K4:Q1003;'CB1'!T4:Z1003;'CB1'!AC4:AI1003;'CB1'!AL4:AR1003;
'CB2'!B4:H1003;'CB2'!K4:Q1003;'CB2'!T4:Z1003;'CB2'!AC4:AI1003;'CB2'!AL4:AR1003;
'CB3'!B4:H1003;'CB3'!K4:Q1003;'CB3'!T4:Z1003;'CB3'!AC4:AI1003;'CB3'!AL4:AR1003;
'CB4'!B4:H1003;'CB4'!K4:Q1003;'CB4'!T4:Z1003;'CB4'!AC4:AI1003;'CB4'!AL4:AR1003;
'CB5'!B4:H1003;'CB5'!K4:Q1003;'CB5'!T4:Z1003;'CB5'!AC4:AI1003;'CB5'!AL4:AR1003;
'CB6'!B4:H1003;'CB6'!K4:Q1003;'CB6'!T4:Z1003;'CB6'!AC4:AI1003;'CB6'!AL4:AR1003
},"SELECT * WHERE Col2 IS NOT NULL",0))`;

    navigator.clipboard.writeText(formula);

    alert("✅ Formula CASH BACK berhasil dicopy");

}


// ============================================================
// MENU
// ============================================================

function openMenu() {

    const menu = document.getElementById("menuBox");

    if (!menu) {
        return;
    }

    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";

}


function toggleMenu() {

    const data = [

        ["checkDepositPga", "btnDepositPga", "depositPgaPage"],
        ["checkPgaChecking", "btnPgaChecking", "pgaCheckingPage"],
        ["checkDeposit", "btnDeposit", "depositPage"],
        ["checkWithdraw", "btnWithdraw", "withdrawPage"],
        ["checkQris", "btnQris", "qrisPage"],
        ["checkInputCashBack", "btnInputCashBack", "inputCashBackPage"],
        ["checkCashBack", "btnCashBack", "cashBackPage"],
        ["checkDoubleCashBack", "btnDoubleCashBack", "doubleCashBackPage"],
        ["checkDoubleAcc", "btnDoubleAcc", "doubleAccPage"]

    ];


    data.forEach(item => {

        const checkbox = document.getElementById(item[0]);
        const button = document.getElementById(item[1]);
        const page = document.getElementById(item[2]);

        if (!checkbox || !button) {
            return;
        }

        const checked = checkbox.checked;

        button.style.display =
            checked ? "block" : "none";

        if (!checked && page) {

            page.style.display = "none";

        }

    });

}


// ============================================================
// DEPOSIT CHECKER
// ============================================================

async function processData() {

    const file =
        document.getElementById("csvFile")?.files[0];

    const sheetText =
        document.getElementById("sheetData")?.value;


    if (!file) {

        alert("Upload CSV dulu");

        return;

    }


    if (!sheetText || !sheetText.trim()) {

        alert("Paste Google Sheet dulu");

        return;

    }


    let googleSheet = {};


    sheetText.trim().split("\n").forEach(row => {

        const col = row.trim().split(/\s+/);

        if (col.length < 2) {
            return;
        }

        const username =
            col[0].trim().toLowerCase();

        const coin =
            Number(
                col[1]
                    .replace(/,/g, "")
                    .trim()
            );

        if (!googleSheet[username]) {
            googleSheet[username] = 0;
        }

        googleSheet[username] += coin;

    });


    const csvText = await file.text();

    const rows = csvText.split(/\r?\n/);

    let administration = {};


    rows.forEach((line, index) => {

        if (
            index === 0 &&
            line.toLowerCase().includes("date")
        ) {
            return;
        }


        const col = line.split(",");

        if (col.length < 5) {
            return;
        }


        const info =
            col[1]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const username =
            col[2]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const by =
            col[3]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const coin =
            Number(
                col[4]
                    .replace(/"/g, "")
                    .replace(/,/g, "")
                    .trim()
            );


        if (info !== "deposit") {
            return;
        }


        if (by.startsWith("vjgaacb")) {
            return;
        }


        if (!administration[username]) {
            administration[username] = 0;
        }

        administration[username] += coin;

    });


    let result = [];


    const allUsers = new Set([

        ...Object.keys(administration),
        ...Object.keys(googleSheet)

    ]);


    allUsers.forEach(username => {

        const adminCoin =
            administration[username] || 0;

        const sheetCoin =
            googleSheet[username] || 0;

        const selisih =
            sheetCoin - adminCoin;


        if (selisih !== 0) {

            result.push({

                username,
                administration: adminCoin,
                googleSheet: sheetCoin,
                selisih

            });

        }

    });


    const output =
        document.getElementById("difference");

    if (!output) {
        return;
    }


    output.innerHTML = result.map(row => `

        <tr>

            <td>${row.username}</td>

            <td>${row.administration.toLocaleString()}</td>

            <td>${row.googleSheet.toLocaleString()}</td>

            <td>${row.selisih.toLocaleString()}</td>

        </tr>

    `).join("");


    alert(
        "Deposit selesai : " +
        result.length +
        " berbeda"
    );

}


// ============================================================
// WITHDRAW CHECKER
// ============================================================

async function processWithdraw() {

    const file =
        document.getElementById("withdrawCsv")?.files[0];

    const sheetText =
        document.getElementById("withdrawSheetData")?.value;


    if (!file) {

        alert("Upload CSV Withdraw dulu");

        return;

    }


    if (!sheetText || !sheetText.trim()) {

        alert("Paste Google Sheet Withdraw dulu");

        return;

    }


    let googleSheet = {};


    sheetText.trim().split("\n").forEach(row => {

        const col =
            row.trim().split(/\s+/);

        if (col.length < 2) {
            return;
        }


        const username =
            col[0]
                .replace(/"/g, "")
                .replace(/\s+/g, "")
                .trim()
                .toLowerCase();


        const coin =
            Number(
                col[1]
                    .replace(/"/g, "")
                    .replace(/,/g, "")
                    .trim()
            );


        if (!googleSheet[username]) {
            googleSheet[username] = 0;
        }

        googleSheet[username] += coin;

    });


    const csvText = await file.text();

    const rows =
        csvText.split(/\r?\n/);

    let administration = {};


    rows.forEach((line, index) => {

        if (
            index === 0 &&
            line.toLowerCase().includes("date")
        ) {
            return;
        }


        const col = line.split(",");

        if (col.length < 5) {
            return;
        }


        const info =
            col[1]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const username =
            col[2]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const by =
            col[3]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const coin =
            Number(
                col[4]
                    .replace(/"/g, "")
                    .replace(/,/g, "")
                    .trim()
            );


        if (
            info !== "withdraw" &&
            info !== "withdraw(pga-idf)"
        ) {
            return;
        }


        if (info.includes("reject")) {
            return;
        }


        if (coin <= 0) {
            return;
        }


        if (by.startsWith("vjgaacb")) {
            return;
        }


        if (!administration[username]) {
            administration[username] = 0;
        }

        administration[username] += coin;

    });


    let result = [];


    const allUsers = new Set([

        ...Object.keys(administration),
        ...Object.keys(googleSheet)

    ]);


    allUsers.forEach(username => {

        const adminCoin =
            administration[username] || 0;

        const sheetCoin =
            googleSheet[username] || 0;

        const selisih =
            sheetCoin - adminCoin;


        if (selisih !== 0) {

            result.push({

                username,
                administration: adminCoin,
                googleSheet: sheetCoin,
                selisih

            });

        }

    });


    const output =
        document.getElementById("withdrawDifference");

    if (!output) {
        return;
    }


    output.innerHTML = result.map(row => `

        <tr>

            <td>${row.username}</td>

            <td>${row.administration.toLocaleString()}</td>

            <td>${row.googleSheet.toLocaleString()}</td>

            <td>${row.selisih.toLocaleString()}</td>

        </tr>

    `).join("");


    alert(
        "Withdraw selesai : " +
        result.length +
        " berbeda"
    );

}


// ============================================================
// QRIS
// ============================================================

let qrisResult = [];


async function processQris() {

    const file =
        document.getElementById("qrisCsv")?.files[0];


    if (!file) {

        alert("Upload QRIS CSV dulu");

        return;

    }


    const csvText = await file.text();

    const rows =
        csvText.split(/\r?\n/);

    qrisResult = [];

    let totalAmount = 0;


    rows.forEach((line, index) => {

        if (index === 0) {
            return;
        }


        const match =
            line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

        if (!match) {
            return;
        }


        const col =
            match.map(x =>
                x.replace(/^"|"$/g, "")
            );


        if (col.length < 7) {
            return;
        }


        const transactionId =
            col[2]
                .replace(/"/g, "")
                .trim();


        const amount =
            Number(
                col[3]
                    .replace(/"/g, "")
                    .replace(/,/g, "")
                    .trim()
            );


        const status =
            col[5]
                .replace(/"/g, "")
                .trim()
                .toUpperCase();


        const member =
            col[6]
                .replace(/"/g, "")
                .trim();


        qrisResult.push({

            id: member,
            amount,
            transactionId,
            status

        });


        totalAmount += amount;

    });


    document.getElementById("totalQris").innerHTML =
        qrisResult.length;


    document.getElementById("totalQrisAmount").innerHTML =
        "Rp " +
        totalAmount.toLocaleString();


    document.getElementById("qrisData").innerHTML =
        qrisResult.map(row => `

            <tr>

                <td>${row.id}</td>

                <td>${row.amount.toLocaleString()}</td>

                <td>${row.transactionId}</td>

                <td>${row.status}</td>

            </tr>

        `).join("");


    alert(
        "QRIS selesai : " +
        qrisResult.length +
        " transaksi"
    );

}


function copyQrisIdAmount() {

    if (qrisResult.length === 0) {

        alert("Belum ada data QRIS");

        return;

    }


    const text =
        qrisResult.map(row =>
            row.id + "\t" +
            row.amount.toLocaleString()
        ).join("\n");


    navigator.clipboard.writeText(text);

    alert("ID & AMOUNT berhasil di copy");

}


function copyQrisTransaction() {

    if (qrisResult.length === 0) {

        alert("Belum ada data QRIS");

        return;

    }


    const text =
        qrisResult
            .map(row => row.transactionId)
            .join("\n");


    navigator.clipboard.writeText(text);

    alert("TRANSACTION ID berhasil di copy");

}


function clearQris() {

    qrisResult = [];

    document.getElementById("qrisData").innerHTML = "";
    document.getElementById("totalQris").innerHTML = "0";
    document.getElementById("totalQrisAmount").innerHTML = "Rp 0";
    document.getElementById("qrisCsv").value = "";

    alert("QRIS CLEAR ALL");

}


// ============================================================
// CASH BACK CHECKER
// ============================================================

async function processCashBack() {

    const file =
        document.getElementById("cashBackCsv")?.files[0];

    const sheetText =
        document.getElementById("cashBackSheetData")?.value;


    if (!file) {

        alert("Upload CSV Cash Back dulu");

        return;

    }


    if (!sheetText || !sheetText.trim()) {

        alert("Paste Google Sheet Cash Back dulu");

        return;

    }


    let googleSheet = {};


    sheetText.trim().split("\n").forEach(row => {

        const col =
            row.trim().split(/\s+/);

        if (col.length < 2) {
            return;
        }


        const username =
            col[0]
                .replace(/"/g, "")
                .trim()
                .toLowerCase();


        const coin =
            Number(
                col[1]
                    .replace(/,/g, "")
                    .trim()
            );


        if (isNaN(coin)) {
            return;
        }


        if (!googleSheet[username]) {
            googleSheet[username] = 0;
        }

        googleSheet[username] += coin;

    });


    const csvText =
        await file.text();

    const rows =
        csvText.split(/\r?\n/);

    let administration = {};


    rows.forEach((line, index) => {

        if (
            index === 0 &&
            line.toLowerCase().includes("date")
        ) {
            return;
        }


        let col =
            line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);


        if (!col || col.length < 5) {
            return;
        }


        col = col.map(x =>
            x.replace(/^"|"$/g, "").trim()
        );


        const username =
            col[2].toLowerCase();


        const by =
            col[3].toLowerCase();


        const coin =
            Number(
                col[4].replace(/,/g, "")
            );


        if (!username || isNaN(coin)) {
            return;
        }


        if (
            by !== "vjgaacb" &&
            !by.startsWith("vjgaacb")
        ) {
            return;
        }


        if (!administration[username]) {
            administration[username] = 0;
        }

        administration[username] += coin;

    });


    let result = [];


    const allUsers = new Set([

        ...Object.keys(administration),
        ...Object.keys(googleSheet)

    ]);


    allUsers.forEach(username => {

        const adminCoin =
            administration[username] || 0;

        const sheetCoin =
            googleSheet[username] || 0;

        const selisih =
            sheetCoin - adminCoin;


        if (selisih !== 0) {

            result.push({

                username,
                administration: adminCoin,
                googleSheet: sheetCoin,
                selisih

            });

        }

    });


    document.getElementById("cashBackDifference").innerHTML =
        result.map(row => `

            <tr>

                <td>${row.username}</td>

                <td>${row.administration.toLocaleString()}</td>

                <td>${row.googleSheet.toLocaleString()}</td>

                <td>${row.selisih.toLocaleString()}</td>

            </tr>

        `).join("");


    alert(
        "Cash Back selesai : " +
        result.length +
        " berbeda"
    );

}


// ============================================================
// COPY DIFFERENCE
// ============================================================

function copyWithdrawDifference() {

    const rows =
        document.querySelectorAll(
            "#withdrawDifference tr"
        );


    if (rows.length === 0) {

        alert("Belum ada data Withdraw");

        return;

    }


    const text = [];


    rows.forEach(row => {

        const col =
            row.querySelectorAll("td");


        if (col.length >= 4) {

            text.push(

                col[0].innerText.trim() +
                "\t" +
                col[3].innerText.trim()

            );

        }

    });


    navigator.clipboard.writeText(
        text.join("\n")
    );

    alert(
        "Username + Selisih Withdraw berhasil di copy"
    );

}


function clearWithdraw() {

    document.getElementById("withdrawCsv").value = "";
    document.getElementById("withdrawSheetData").value = "";
    document.getElementById("withdrawDifference").innerHTML = "";

    alert("Withdraw CLEAR ALL");

}


function copyCashBackDifference() {

    const rows =
        document.querySelectorAll(
            "#cashBackDifference tr"
        );


    if (rows.length === 0) {

        alert("Belum ada data Cash Back");

        return;

    }


    const text = [];


    rows.forEach(row => {

        const col =
            row.querySelectorAll("td");


        if (col.length >= 4) {

            const username =
                col[0].innerText.trim();


            const angka =
                Number(
                    col[3].innerText
                        .replace(/\./g, "")
                        .replace(/,/g, "")
                );


            const selisih =
                angka.toLocaleString("en-US");


            text.push(
                username +
                "\t" +
                selisih
            );

        }

    });


    navigator.clipboard.writeText(
        text.join("\n")
    );

    alert(
        "Username + Selisih Cash Back berhasil di copy"
    );

}


function copyDepositDifference() {

    const rows =
        document.querySelectorAll(
            "#difference tr"
        );


    if (rows.length === 0) {

        alert("Belum ada data Deposit");

        return;

    }


    const text = [];


    rows.forEach(row => {

        const col =
            row.querySelectorAll("td");


        if (col.length >= 4) {

            const username =
                col[0].innerText.trim();


            const angka =
                Number(
                    col[3].innerText
                        .replace(/,/g, "")
                );


            const selisih =
                angka.toLocaleString("en-US");


            text.push(
                username +
                "\t" +
                selisih
            );

        }

    });


    navigator.clipboard.writeText(
        text.join("\n")
    );

    alert(
        "Username + Selisih Deposit berhasil di copy"
    );

}


function clearDeposit() {

    document.getElementById("csvFile").value = "";
    document.getElementById("sheetData").value = "";
    document.getElementById("difference").innerHTML = "";

    alert("Deposit CLEAR ALL");

}


// ============================================================
// DOUBLE CASH BACK
// ============================================================

let doubleCashBackResult = [];


async function processDoubleCashBack() {

    const file =
        document.getElementById("doubleCashBackCsv")?.files[0];


    if (!file) {

        alert("Upload CSV dulu");

        return;

    }


    const csvText =
        await file.text();


    const rows =
        csvText.split(/\r?\n/);


    let userList = {};


    rows.forEach((line, index) => {

        if (index === 0) {
            return;
        }


        let col =
            line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);


        if (!col || col.length < 5) {
            return;
        }


        col = col.map(x =>
            x.replace(/^"|"$/g, "").trim()
        );


        const username =
            col[2].toLowerCase().trim();


        const by =
            col[3].toLowerCase().trim();


        const amount =
            Number(
                col[4]
                    .replace(/"/g, "")
                    .replace(/,/g, "")
                    .trim()
            );


        if (!username || isNaN(amount)) {
            return;
        }


        if (!by.startsWith("vjgaacb")) {
            return;
        }


        if (!userList[username]) {
            userList[username] = [];
        }


        userList[username].push(amount);

    });


    doubleCashBackResult = [];


    Object.keys(userList).forEach(username => {

        if (userList[username].length > 1) {

            doubleCashBackResult.push({

                username,
                amount: userList[username][0]

            });

        }

    });


    document.getElementById(
        "doubleCashBackResult"
    ).innerHTML =
        doubleCashBackResult.map(row => `

            <tr>

                <td>${row.username}</td>

                <td>${row.amount.toLocaleString("en-US")}</td>

            </tr>

        `).join("");


    alert(
        "Double Cash Back ditemukan : " +
        doubleCashBackResult.length +
        " user"
    );

}


function copyDoubleCashBack() {

    if (doubleCashBackResult.length === 0) {

        alert("Belum ada data Double Cash Back");

        return;

    }


    const text =
        doubleCashBackResult.map(row =>
            row.username +
            "\t'" +
            row.amount.toLocaleString("en-US")
        ).join("\n");


    navigator.clipboard.writeText(text);

    alert(
        "✅ Username + Amount Double Cash Back berhasil di copy"
    );

}


function clearDoubleCashBack() {

    doubleCashBackResult = [];

    document.getElementById(
        "doubleCashBackResult"
    ).innerHTML = "";

    document.getElementById(
        "doubleCashBackCsv"
    ).value = "";

    alert(
        "Double Cash Back berhasil dihapus"
    );

}


// ============================================================
// DEPOSIT PGA
// ============================================================

function processDepositPga() {

    const file =
        document.getElementById("depositPgaCsv")?.files[0];


    if (!file) {

        alert("Upload CSV PGA dulu");

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (e) {

        const text =
            e.target.result;


        const rows =
            text.split(/\r?\n/);


        let html = "";

        let totalDepositPga = 0;
        let totalAmountPga = 0;


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i].match(
                    /(".*?"|[^",]+)(?=\s*,|\s*$)/g
                );


            if (!row || row.length < 8) {
                continue;
            }


            const id =
                row[0]
                    .replace(/"/g, "")
                    .trim();


            const ref =
                row[1]
                    .replace(/"/g, "")
                    .trim();


            const amount =
                row[7]
                    .replace(/"/g, "")
                    .trim();


            const amountNumber =
                Number(
                    amount.replace(/,/g, "")
                ) || 0;


            totalDepositPga++;
            totalAmountPga += amountNumber;


            html += `

                <tr>

                    <td>${id}</td>

                    <td>${amount}</td>

                    <td>${ref}</td>

                </tr>

            `;

        }


        document.getElementById(
            "depositPgaData"
        ).innerHTML = html;


        document.getElementById(
            "totalDepositPga"
        ).innerHTML = totalDepositPga;


        document.getElementById(
            "totalAmountPga"
        ).innerHTML =
            "Rp " +
            totalAmountPga.toLocaleString("en-US");

    };


    reader.readAsText(file);

}


function copyDepositPga() {

    const rows =
        document.querySelectorAll(
            "#depositPgaData tr"
        );


    if (rows.length === 0) {

        alert("Belum ada data Deposit PGA");

        return;

    }


    const text = [];


    rows.forEach(row => {

        const col =
            row.querySelectorAll("td");


        if (col.length >= 3) {

            const id =
                col[0].innerText.trim();


            const amount =
                Number(
                    col[1].innerText
                        .replace(/,/g, "")
                        .trim()
                );


            const ref =
                col[2].innerText.trim();


            text.push(

                id +
                "\t" +
                amount.toLocaleString("en-US") +
                "\t" +
                ref

            );

        }

    });


    navigator.clipboard.writeText(
        text.join("\n")
    );


    alert(
        "✅ ID + AMOUNT + REFF NUMBER berhasil di copy"
    );

}


function clearDepositPga() {

    document.getElementById(
        "depositPgaCsv"
    ).value = "";

    document.getElementById(
        "depositPgaData"
    ).innerHTML = "";

    document.getElementById(
        "totalDepositPga"
    ).innerHTML = "0";

    document.getElementById(
        "totalAmountPga"
    ).innerHTML = "Rp 0";


    alert("✅ Deposit PGA CLEAR ALL");

}


// ============================================================
// DOUBLE ACC
// ============================================================

let doubleAccResult = [];


async function processDoubleAcc() {

    const file =
        document.getElementById("doubleAccCsv")?.files[0];


    if (!file) {

        alert("Upload CSV dulu");

        return;

    }


    const text =
        await file.text();


    const rows =
        text
            .split(/\r?\n/)
            .slice(1)
            .map(row =>
                row.replace(/"/g, "").split(",")
            )
            .filter(row =>
                row.length >= 5
            );


    let check = {};


    rows.forEach(row => {

        const date =
            row[0]?.trim();

        const info =
            row[1]?.trim();

        const username =
            row[2]?.trim();


        const coin =
            Number(
                row[4]?.replace(/,/g, "")
            );


        const semuaKolom =
            row.join(" ").toLowerCase();


        if (

            info === "Deposit" &&
            !semuaKolom.includes("vjgaacb") &&
            username &&
            coin

        ) {

            const parts =
                date.match(
                    /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/
                );


            if (!parts) {
                return;
            }


            const time =
                new Date(

                    parts[3],
                    parts[2] - 1,
                    parts[1],
                    parts[4],
                    parts[5],
                    parts[6]

                ).getTime();


            const key =
                username + "_" + coin;


            if (!check[key]) {
                check[key] = [];
            }


            check[key].push(time);

        }

    });


    doubleAccResult = [];


    Object.keys(check).forEach(key => {

        const times =
            check[key];


        times.sort(
            (a, b) => a - b
        );


        for (
            let i = 0;
            i < times.length - 1;
            i++
        ) {

            const selisih =
                Math.abs(
                    times[i + 1] -
                    times[i]
                ) / 1000;


            if (selisih <= 1) {

                const data =
                    key.split("_");


                doubleAccResult.push({

                    username: data[0],
                    coin: Number(data[1]),
                    time: times[i + 1],
                    information: "DOUBLE ACC"

                });


                break;

            }

        }

    });


    doubleAccResult.sort(
        (a, b) => b.time - a.time
    );


    document.getElementById(
        "doubleAccData"
    ).innerHTML =
        doubleAccResult.map(
            (row, index) => `

                <tr>

                    <td>${index + 1}</td>

                    <td>${row.username}</td>

                    <td>${Number(row.coin).toLocaleString("en-US")}</td>

                    <td>${row.information}</td>

                </tr>

            `
        ).join("");


    alert(
        "DOUBLE ACC ditemukan : " +
        doubleAccResult.length +
        " user"
    );

}


function copyDoubleAcc() {

    if (doubleAccResult.length === 0) {

        alert("Belum ada data Double ACC");

        return;

    }


    const text =
        doubleAccResult.map(row =>

            row.username +
            "\t'" +
            Number(row.coin)
                .toLocaleString("en-US")

        ).join("\n");


    navigator.clipboard.writeText(text);


    alert(
        "✅ COPY USERNAME + AMOUNT BERHASIL"
    );

}


function clearDoubleAcc() {

    doubleAccResult = [];


    document.getElementById(
        "doubleAccData"
    ).innerHTML = "";


    document.getElementById(
        "doubleAccCsv"
    ).value = "";


    alert(
        "🗑 Double ACC berhasil dihapus"
    );

}


// ============================================================
// INPUT CASH BACK
// ============================================================

let cashBackData = [];

let currentCashBackPage = 1;

let cashBackPerPage = 1000;


function processInputCashBack() {

    const file =
        document.getElementById("cashBackFile")?.files[0];


    if (!file) {

        alert("Pilih CSV dulu");

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (e) {

        const rows =
            e.target.result.split(/\r?\n/);


        cashBackData = [];


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i].trim();


            if (!row) {
                continue;
            }


            const col =
                row.split(",");


            if (col.length < 3) {
                continue;
            }


            const username =
                col[0]
                    .replace(/"/g, "")
                    .trim();


            const kalah =
                Math.round(
                    Number(
                        col[2]
                            .replace(/"/g, "")
                    )
                );


            if (kalah <= -100000) {

                const nilai =
                    Math.abs(kalah);


                const persen =
                    nilai >= 100000000
                        ? 10
                        : 5;


                const bonus =
                    Number(
                        (
                            nilai *
                            persen /
                            100
                        ).toFixed(0)
                    );


                cashBackData.push({

                    username,
                    kalah,
                    persen,
                    bonus

                });

            }

        }


        currentCashBackPage = 1;

        tampilCashBack();

    };


    reader.readAsText(file);

}


function tampilCashBack() {

    const tbody =
        document.getElementById(
            "dataInputCashBack"
        );


    if (!tbody) {
        return;
    }


    const mulai =
        (currentCashBackPage - 1) *
        cashBackPerPage;


    const akhir =
        mulai + cashBackPerPage;


    const data =
        cashBackData.slice(
            mulai,
            akhir
        );


    let html = "";


    data.forEach(function (d, i) {

        html += `

            <tr>

                <td>${mulai + i + 1}</td>

                <td>${d.username}</td>

                <td>${d.kalah.toLocaleString()}</td>

                <td>${d.persen}%</td>

                <td>${d.bonus.toLocaleString()}</td>

            </tr>

        `;

    });


    tbody.innerHTML = html;


    document.getElementById(
        "jumlahCashBack"
    ).innerHTML =
        cashBackData.length;


    let total = 0;


    cashBackData.forEach(
        function (d) {

            total += d.bonus;

        }
    );


    document.getElementById(
        "totalCashBack"
    ).innerHTML =
        total.toLocaleString();


    document.getElementById(
        "pageInfo"
    ).innerHTML =
        "Data " +
        (
            cashBackData.length === 0
                ? 0
                : mulai + 1
        ) +
        " - " +
        Math.min(
            akhir,
            cashBackData.length
        );


    buatPageCashBack();

}


function buatPageCashBack() {

    const box =
        document.getElementById(
            "cashBackPages"
        );


    if (!box) {
        return;
    }


    box.innerHTML = "";


    const jumlahHalaman =
        Math.ceil(
            cashBackData.length /
            cashBackPerPage
        );


    for (
        let i = 1;
        i <= jumlahHalaman;
        i++
    ) {

        box.innerHTML += `

            <button
                onclick="gantiCashBackPage(${i})"
            >
                ${i}
            </button>

        `;

    }

}


function gantiCashBackPage(no) {

    currentCashBackPage = no;

    tampilCashBack();

}


function copyCashBackPage() {

    const mulai =
        (currentCashBackPage - 1) *
        cashBackPerPage;


    const akhir =
        mulai + cashBackPerPage;


    const data =
        cashBackData.slice(
            mulai,
            akhir
        );


    const text =
        data.map(function (d) {

            return (

                d.username +
                "\t'" +
                d.kalah
                    .toLocaleString("en-US")

            );

        }).join("\n");


    navigator.clipboard.writeText(text);

    alert(
        "COPY halaman berhasil"
    );

}


function copyAllCashBack() {

    const text =
        cashBackData.map(function (d) {

            return (

                d.username +
                "\t'" +
                d.kalah
                    .toLocaleString("en-US")

            );

        }).join("\n");


    navigator.clipboard.writeText(text);

    alert(
        "COPY semua data berhasil"
    );

}


function clearInputCashBack() {

    cashBackData = [];

    document.getElementById(
        "dataInputCashBack"
    ).innerHTML = "";

    document.getElementById(
        "jumlahCashBack"
    ).innerHTML = "0";

    document.getElementById(
        "totalCashBack"
    ).innerHTML = "0";

    document.getElementById(
        "pageInfo"
    ).innerHTML = "Data 0 - 0";

    document.getElementById(
        "cashBackPages"
    ).innerHTML = "";

    document.getElementById(
        "cashBackFile"
    ).value = "";

    alert(
        "Input Data Cash Back berhasil di CLEAR"
    );

}


function clearCashBack() {

    cashBackData = [];

    const data =
        document.getElementById(
            "dataInputCashBack"
        );

    if (data) {
        data.innerHTML = "";
    }

    const jumlah =
        document.getElementById(
            "jumlahCashBack"
        );

    if (jumlah) {
        jumlah.innerHTML = "0";
    }

    const total =
        document.getElementById(
            "totalCashBack"
        );

    if (total) {
        total.innerHTML = "0";
    }

    const pageInfo =
        document.getElementById(
            "pageInfo"
        );

    if (pageInfo) {
        pageInfo.innerHTML = "Data 0 - 0";
    }

    const pages =
        document.getElementById(
            "cashBackPages"
        );

    if (pages) {
        pages.innerHTML = "";
    }

    const file =
        document.getElementById(
            "cashBackFile"
        );

    if (file) {
        file.value = "";
    }

}


function clearCoinCashBack() {

    document.getElementById(
        "cashBackDifference"
    ).innerHTML = "";

    document.getElementById(
        "cashBackCsv"
    ).value = "";

    document.getElementById(
        "cashBackSheetData"
    ).value = "";

    alert(
        "Coin Cash Back berhasil dihapus"
    );

}


// ============================================================
// CLOCK
// ============================================================

function updateClock() {

    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Asia/Phnom_Penh"
            }
        );


    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Asia/Phnom_Penh"
            }
        );


    const dateElement =
        document.getElementById(
            "currentDate"
        );


    const timeElement =
        document.getElementById(
            "currentTime"
        );


    if (dateElement) {
        dateElement.innerHTML = date;
    }


    if (timeElement) {
        timeElement.innerHTML = time;
    }

}


setInterval(
    updateClock,
    1000
);

updateClock();


// ============================================================
// AUTO LOGOUT 30 MENIT
// ============================================================

let idleTimer;

const idleLimit =
    30 * 60 * 1000;


function resetIdleTimer() {

    clearTimeout(idleTimer);


    const {
        data
    } =
        supabaseClient.auth.getSession();


    idleTimer =
        setTimeout(async () => {

            const {
                data: sessionData
            } =
                await supabaseClient.auth.getSession();


            if (
                sessionData &&
                sessionData.session
            ) {

                alert(
                    "Session expired. Silahkan login kembali."
                );


                await logout();

            }

        }, idleLimit);

}


[
    "mousemove",
    "mousedown",
    "keypress",
    "touchstart",
    "scroll"
].forEach(event => {

    document.addEventListener(
        event,
        resetIdleTimer
    );

});


// ============================================================
// PGA CHECKING
// ============================================================

function processPgaChecking() {

    const adminFile =
        document.getElementById(
            "pgaAdminFile"
        )?.files[0];


    const motionFiles =
        document.getElementById(
            "pgaMotionFile"
        )?.files;


    if (
        !adminFile ||
        !motionFiles ||
        motionFiles.length === 0
    ) {

        alert(
            "Upload PGA Admin CSV dan PGA Motion XLSX dulu"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (e) {

        const csvText =
            e.target.result;


        const rows =
            csvText
                .split(/\r?\n/)
                .map(r => r.split(","));


        pgaAdminData = [];


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            if (row.length < 8) {
                continue;
            }


            pgaAdminData.push({

                id:
                    row[0]
                        ?.replace(/"/g, "")
                        .trim(),

                ref:
                    row[1]
                        ?.replace(/"/g, "")
                        .trim(),

                amount:
                    row[7]
                        ?.replace(/"/g, "")
                        .replace(/,/g, "")
                        .trim()

            });

        }


        readPgaMotionFiles(
            motionFiles
        );

    };


    reader.readAsText(
        adminFile
    );

}


function readPgaMotionFiles(files) {

    pgaMotionData = [];

    let count = 0;


    for (const file of files) {

        const reader =
            new FileReader();


        reader.onload =
            function (e) {

                const data =
                    new Uint8Array(
                        e.target.result
                    );


                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array"
                        }
                    );


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const json =
                    XLSX.utils.sheet_to_json(
                        sheet
                    );


                json.forEach(row => {

                    const deskripsi =
                        String(
                            row["Deskripsi"] || ""
                        );


                    const userId =
                        deskripsi
                            .replace(
                                "Deposit from ",
                                ""
                            )
                            .trim();


                    pgaMotionData.push({

                        id: userId,

                        ref:
                            String(
                                row["No. Ref"] || ""
                            )
                                .replace(/'/g, "")
                                .trim(),

                        amount:
                            row["Jumlah Bayar"] || ""

                    });

                });


                count++;


                if (
                    count === files.length
                ) {

                    comparePgaData();

                }

            };


        reader.readAsArrayBuffer(
            file
        );

    }

}


function comparePgaData() {

    const tbody =
        document.querySelector(
            "#pgaResultTable tbody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    const adminIndex = {};


    pgaAdminData.forEach(admin => {

        const key =
            String(admin.ref)
                .replace(/'/g, "")
                .trim()
                .toUpperCase();


        adminIndex[key] = admin;

    });


    let totalMatch = 0;


    pgaMotionData.forEach(motion => {

        const refKey =
            String(motion.ref)
                .replace(/'/g, "")
                .trim()
                .toUpperCase();


        const admin =
            adminIndex[refKey];


        if (!admin) {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>${motion.id}</td>

                <td>
                    ${Number(
                        motion.amount
                    ).toLocaleString()}
                </td>

                <td>${motion.ref}</td>

            `;


            tbody.appendChild(tr);

            totalMatch++;

        }

    });


    alert(

        "PGA Checking selesai\n\n" +
        "Data bermasalah: " +
        totalMatch +
        " transaksi"

    );

}


function copyPgaResult() {

    const rows =
        document.querySelectorAll(
            "#pgaResultTable tbody tr"
        );


    if (rows.length === 0) {

        alert(
            "Belum ada hasil PGA"
        );

        return;

    }


    let text = "";


    rows.forEach(row => {

        const col =
            row.querySelectorAll("td");


        if (col.length >= 3) {

            text +=

                col[0].innerText +
                "\t" +
                col[1].innerText +
                "\t" +
                col[2].innerText +
                "\n";

        }

    });


    navigator.clipboard.writeText(
        text
    )
        .then(() => {

            alert(
                "COPY RESULT berhasil"
            );

        })
        .catch(() => {

            alert(
                "COPY gagal"
            );

        });

}


function clearPgaResult() {

    const tbody =
        document.querySelector(
            "#pgaResultTable tbody"
        );


    if (tbody) {

        tbody.innerHTML = "";

    }


    alert(
        "Data PGA sudah dihapus"
    );

}


// ============================================================
// CYBER BOOT SYSTEM
// ============================================================

const bootMessages = [

    "INITIALIZING SYSTEM...",
    "LOADING SECURITY MODULE...",
    "CHECKING DATABASE...",
    "VERIFYING CONNECTION...",
    "SYSTEM READY"

];


function startCyberBoot(callback) {

    const boot =
        document.getElementById(
            "systemBoot"
        );


    const text =
        document.getElementById(
            "bootText"
        );


    if (!boot) {

        if (callback) {
            callback();
        }

        return;

    }


    boot.style.display = "flex";


    let index = 0;


    const interval =
        setInterval(() => {

            if (text) {

                text.innerHTML =
                    "> " +
                    bootMessages[index];

            }


            index++;


            if (
                index >=
                bootMessages.length
            ) {

                clearInterval(
                    interval
                );


                setTimeout(() => {

                    boot.style.display =
                        "none";


                    if (callback) {
                        callback();
                    }

                }, 800);

            }

        }, 600);

}


// ============================================================
// PROTEKSI TAMBAHAN
// ============================================================

// Blok klik kanan
document.addEventListener(
    "contextmenu",
    function (e) {

        e.preventDefault();

        return false;

    },
    true
);


// Blok shortcut tertentu
document.addEventListener(
    "keydown",
    function (e) {

        if (

            e.key === "F12" ||

            (
                e.ctrlKey &&
                e.shiftKey &&
                e.key.toLowerCase() === "i"
            ) ||

            (
                e.ctrlKey &&
                e.shiftKey &&
                e.key.toLowerCase() === "j"
            ) ||

            (
                e.ctrlKey &&
                e.shiftKey &&
                e.key.toLowerCase() === "c"
            ) ||

            (
                e.ctrlKey &&
                e.key.toLowerCase() === "u"
            ) ||

            (
                e.metaKey &&
                e.altKey &&
                e.key.toLowerCase() === "i"
            )

        ) {

            e.preventDefault();

            e.stopPropagation();

            return false;

        }

    },
    true
);


// Blok drag gambar
document.addEventListener(
    "dragstart",
    function (e) {

        if (
            e.target.tagName === "IMG"
        ) {

            e.preventDefault();

            return false;

        }

    },
    true
);


// Deteksi perubahan ukuran DevTools
setInterval(
    function () {

        if (

            window.outerWidth -
            window.innerWidth > 200 ||

            window.outerHeight -
            window.innerHeight > 200

        ) {

            console.clear();

            console.log(
                "Protected Page"
            );

        }

    },
    1000
);
const cryptoList = document.getElementById("crypto-list");
const stockList = document.getElementById("stock-list");
const cryptoError = document.getElementById("crypto-error");
const stockError = document.getElementById("stock-error");
const cryptoTime = document.getElementById("crypto-time");
const stockTime = document.getElementById("stock-time");
const currencyBtn = document.getElementById("currency-btn");
const themeBtn = document.getElementById("theme-btn");


const prevCrypto = {}; 
const prevStock = {};
const trendMemory = {};


let currency = localStorage.getItem("currency") || "USD";
const USD_TO_INR = 83;

currencyBtn.textContent = currency === "USD" ? "₹ INR" : "$ USD";


function getTrend(key, current, previous) {
    let cls = "up";
    let arrow = "↑";

    if (trendMemory[key]) {
        ({ cls, arrow } = trendMemory[key]);
    }

    if (previous !== undefined) {
        if (current > previous) { cls = "up"; arrow = "↑"; }
        else if (current < previous) { cls = "down"; arrow = "↓"; }
    }

    trendMemory[key] = { cls, arrow };
    return { cls, arrow };
}

function formatPrice(price) {
    return currency === "USD"
        ? `$${price}`
        : `₹${(price * USD_TO_INR).toFixed(2)}`;
}


const cryptoIds =
    "bitcoin,ethereum,dogecoin,solana,ripple,cardano,polkadot,litecoin";

const cryptoNames = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    dogecoin: "Dogecoin",
    solana: "Solana",
    ripple: "Ripple",
    cardano: "Cardano",
    polkadot: "Polkadot",
    litecoin: "Litecoin"
};

async function fetchCryptoPrices() {
    try {
        cryptoError.textContent = "";
        cryptoList.innerHTML = "";

        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`
        );
        const data = await res.json();

        for (let coin in data) {
            const current = data[coin].usd;
            const previous = prevCrypto[coin];

            const { cls, arrow } = getTrend(coin, current, previous);
            prevCrypto[coin] = current;

            cryptoList.innerHTML += `
                <li>
                    <span>${cryptoNames[coin]}</span>
                    <span class="price ${cls}">
                        ${formatPrice(current)} ${arrow}
                    </span>
                </li>
            `;
        }

        cryptoTime.textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    } catch {
        cryptoError.textContent = "⚠ Crypto data unavailable";
    }
}

fetchCryptoPrices();
setInterval(fetchCryptoPrices, 10000);


const stockSymbols = ["AAPL", "TSLA", "MSFT"];
const twelveApiKey = "901d73b8179f46aaa5e69f3e18df7765";

async function fetchStockPrices() {
    try {
        stockError.textContent = "";
        stockList.innerHTML = "";

        for (let sym of stockSymbols) {
            const res = await fetch(
                `https://api.twelvedata.com/price?symbol=${sym}&apikey=${twelveApiKey}`
            );
            const data = await res.json();
            if (!data.price) throw new Error();

            const current = Number(data.price);
            const previous = prevStock[sym];

            const { cls, arrow } = getTrend(sym, current, previous);
            prevStock[sym] = current;

            stockList.innerHTML += `
                <li>
                    <span>${sym}</span>
                    <span class="price ${cls}">
                        ${formatPrice(current.toFixed(2))} ${arrow}
                    </span>
                </li>
            `;
        }

        stockTime.textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    } catch {
        stockError.textContent = "⚠ Stock data temporarily unavailable";
    }
}

fetchStockPrices();
setInterval(fetchStockPrices, 120000);


if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀ Light Mode";
}

themeBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeBtn.textContent = isDark ? "☀ Light Mode" : "🌙 Dark Mode";
});

currencyBtn.addEventListener("click", () => {
    currency = currency === "USD" ? "INR" : "USD";
    localStorage.setItem("currency", currency);
    currencyBtn.textContent = currency === "USD" ? "₹ INR" : "$ USD";
    fetchCryptoPrices();
    fetchStockPrices();
});
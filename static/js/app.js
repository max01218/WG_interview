// DOM 元素載入
document.addEventListener("DOMContentLoaded", () => {
    const cartInput = document.getElementById("cartInput");
    const btnCaseA = document.getElementById("btnCaseA");
    const btnCaseB = document.getElementById("btnCaseB");
    const btnClear = document.getElementById("btnClear");
    const btnCheckout = document.getElementById("btnCheckout");
    const errorBox = document.getElementById("errorBox");
    const errorMessage = document.getElementById("errorMessage");
    
    const receiptPlaceholder = document.getElementById("receiptPlaceholder");
    const receiptContent = document.getElementById("receiptContent");
    
    // 收據輸出欄位
    const resDate = document.getElementById("resDate");
    const resItemList = document.getElementById("resItemList");
    const resRawSubtotal = document.getElementById("resRawSubtotal");
    const resPromoSavings = document.getElementById("resPromoSavings");
    const resDiscountedSubtotal = document.getElementById("resDiscountedSubtotal");
    
    const resCouponCard = document.getElementById("resCouponCard");
    const couponExpire = document.getElementById("couponExpire");
    const couponThreshold = document.getElementById("couponThreshold");
    const couponDiscount = document.getElementById("couponDiscount");
    const couponStatusBadge = document.getElementById("couponStatusBadge");
    const couponSavingsRow = document.getElementById("couponSavingsRow");
    const resCouponSavings = document.getElementById("resCouponSavings");
    
    const resFinalTotal = document.getElementById("resFinalTotal");

    // 商品目錄展開與收起
    const toggleDirectory = document.getElementById("toggleDirectory");
    const directoryBody = document.getElementById("directoryBody");
    const directoryChevron = document.getElementById("directoryChevron");

    toggleDirectory.addEventListener("click", () => {
        const isCollapsed = directoryBody.classList.toggle("hidden");
        directoryChevron.textContent = isCollapsed ? "▼" : "▲";
    });

    // 預設樣板資料
    const CASE_A_TEXT = `2015.11.11|0.7|電子 //促銷資訊,格式為:日期|折扣|產品品類,可有多個,每個一行

1*ipad:2399.00 //所購產品,每種一行,格式為:數量*商品:單價
1*顯示器:1799.00
12*啤酒:25.00
5*麵包:9.00

2015.11.11 //結算日期
2016.3.2 1000 200 //優惠券資訊,示例為 2016年3月2日到期,滿1000折200`;

    const CASE_B_TEXT = `3*蔬菜:5.98
8*餐巾紙:3.20

2015.01.01`;

    // 按鈕監聽：快速套用
    btnCaseA.addEventListener("click", () => {
        cartInput.value = CASE_A_TEXT;
        clearReceipt();
    });

    btnCaseB.addEventListener("click", () => {
        cartInput.value = CASE_B_TEXT;
        clearReceipt();
    });

    // 按鈕監聽：清空
    btnClear.addEventListener("click", () => {
        cartInput.value = "";
        clearReceipt();
    });

    // 重設收據狀態
    function clearReceipt() {
        receiptPlaceholder.classList.remove("hidden");
        receiptContent.classList.add("hidden");
        errorBox.classList.add("hidden");
    }

    // 發送結帳請求
    btnCheckout.addEventListener("click", async () => {
        const inputText = cartInput.value.trim();
        if (!inputText) {
            showError("輸入內容不可為空，請輸入結算資訊。");
            return;
        }

        // 顯示載入動畫
        btnCheckout.disabled = true;
        btnCheckout.querySelector("span").textContent = "計算中...";
        errorBox.classList.add("hidden");

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ input_text: inputText }),
            });

            const data = await response.getJSON ? await response.getJSON() : await response.json();

            if (!response.ok) {
                throw new Error(data.error || "未知結帳伺服器錯誤");
            }

            // 成功結算，渲染收據！
            renderReceipt(data);

        } catch (err) {
            showError(err.message);
        } finally {
            btnCheckout.disabled = false;
            btnCheckout.querySelector("span").textContent = "開始結算";
        }
    });

    // 顯示錯誤警報
    function showError(msg) {
        errorMessage.textContent = msg;
        errorBox.classList.remove("hidden");
        receiptPlaceholder.classList.remove("hidden");
        receiptContent.classList.add("hidden");
    }

    // 渲染收據明細
    function renderReceipt(data) {
        errorBox.classList.add("hidden");
        receiptPlaceholder.classList.add("hidden");
        
        // 重啟收據動畫
        receiptContent.classList.remove("hidden");
        receiptContent.style.animation = 'none';
        receiptContent.offsetHeight; /* 觸發重繪 */
        receiptContent.style.animation = null;

        // 1. 填入基本明細
        resDate.textContent = data.settlement_date;
        resRawSubtotal.textContent = `$ ${data.raw_subtotal}`;
        resPromoSavings.textContent = `-$ ${data.promo_savings_total}`;
        resDiscountedSubtotal.textContent = `$ ${data.discounted_subtotal}`;
        resFinalTotal.textContent = data.final_total;

        // 2. 渲染商品項目列表
        resItemList.innerHTML = "";
        data.items.forEach(item => {
            const itemRow = document.createElement("div");
            itemRow.className = "item-row";
            
            // 品類 CSS Tag 對應
            let catClass = "tag-other";
            if (item.category === "電子") catClass = "tag-electronics";
            else if (item.category === "食品") catClass = "tag-food";
            else if (item.category === "日用品") catClass = "tag-daily";
            else if (item.category === "酒類") catClass = "tag-alcohol";

            const hasPromo = item.applied_promo !== null;
            const promoPill = hasPromo 
                ? `<span class="item-discount-pill">已折 ${Math.round((1 - parseFloat(item.applied_promo.rate)) * 100)}%</span>` 
                : "";

            itemRow.innerHTML = `
                <div class="item-main">
                    <span>${item.name} <span style="font-weight: 300; font-size: 0.8rem;">x${item.quantity}</span></span>
                    <span>$ ${parseFloat(item.discounted_total).toFixed(2)}</span>
                </div>
                <div class="item-meta">
                    <span class="category-tag ${catClass}" style="transform: scale(0.85); transform-origin: left center; padding: 0.1rem 0.4rem;">${item.category}</span>
                    <span style="font-size: 0.75rem; color: #94a3b8;">原價: $ ${parseFloat(item.price).toFixed(2)} / 件</span>
                    ${promoPill}
                </div>
            `;
            resItemList.appendChild(itemRow);
        });

        // 3. 渲染優惠券卡片
        if (data.coupon) {
            resCouponCard.classList.remove("hidden");
            couponExpire.textContent = data.coupon.expire_date;
            couponThreshold.textContent = parseFloat(data.coupon.threshold).toFixed(0);
            couponDiscount.textContent = parseFloat(data.coupon.discount_amount).toFixed(0);
            
            if (data.coupon_applied) {
                couponStatusBadge.textContent = "已啟用";
                couponStatusBadge.className = "coupon-status-badge badge-success";
                couponSavingsRow.classList.remove("hidden");
                resCouponSavings.textContent = `-$ ${parseFloat(data.coupon_savings).toFixed(2)}`;
            } else {
                couponSavingsRow.classList.add("hidden");
                // 判定未啟用原因
                const todayParts = data.settlement_date.split('.').map(Number);
                const expireParts = data.coupon.expire_date.split('.').map(Number);
                
                const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
                const expireDate = new Date(expireParts[0], expireParts[1] - 1, expireParts[2]);
                
                if (todayDate > expireDate) {
                    couponStatusBadge.textContent = "已過期";
                    couponStatusBadge.className = "coupon-status-badge badge-fail";
                } else {
                    couponStatusBadge.textContent = "未達門檻";
                    couponStatusBadge.className = "coupon-status-badge badge-fail";
                }
            }
        } else {
            // 沒有優惠券
            resCouponCard.classList.add("hidden");
            couponSavingsRow.classList.add("hidden");
        }
    }
});

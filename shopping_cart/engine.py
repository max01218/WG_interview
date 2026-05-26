from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from typing import Dict, Any
from shopping_cart.parser import CartInputParser

def checkout_from_text(input_text: str) -> str:
    """
    接受原始結帳文字輸入，計算並傳回格式化為兩位小數的最終金額字串。
    這是命令行 CLI 與測試用例的主要進入點。
    """
    settlement_date, promotions, cart, coupon = CartInputParser.parse(input_text)
    final_total = cart.checkout(settlement_date, promotions, coupon)
    return f"{final_total:.2f}"

def checkout_details(input_text: str) -> Dict[str, Any]:
    """
    接受原始結帳文字輸入，計算並傳回極為詳細的結算帳單 JSON 結構。
    非常適合前端 Dashboard 用於呈現視覺化的結算清單、折扣明細與優惠券狀態。
    """
    settlement_date, promotions, cart, coupon = CartInputParser.parse(input_text)
    
    items_breakdown = []
    raw_subtotal = Decimal("0.00")
    promo_savings_total = Decimal("0.00")
    
    for item in cart.items:
        item_raw = item.raw_total
        # 尋找適用促銷
        active_promos = [
            p for p in promotions
            if p.active_date == settlement_date and p.category == item.product.category
        ]
        
        applied_promo = None
        item_discounted = item_raw
        
        if active_promos:
            best_promo = min(active_promos, key=lambda p: p.discount_rate)
            applied_promo = {
                "rate": f"{best_promo.discount_rate:.2f}",
                "category": best_promo.category
            }
            item_discounted = item_raw * best_promo.discount_rate
            
        savings = item_raw - item_discounted
        promo_savings_total += savings
        raw_subtotal += item_raw
        
        items_breakdown.append({
            "name": item.product.name,
            "category": item.product.category,
            "price": f"{item.product.price:.2f}",
            "quantity": item.quantity,
            "raw_total": f"{item_raw:.2f}",
            "discounted_total": f"{item_discounted:.2f}",
            "savings": f"{savings:.2f}",
            "applied_promo": applied_promo
        })
        
    discounted_subtotal = raw_subtotal - promo_savings_total
    
    coupon_applied = False
    coupon_savings = Decimal("0.00")
    coupon_info = None
    
    if coupon:
        is_valid = coupon.is_valid(settlement_date)
        threshold_met = discounted_subtotal >= coupon.threshold
        coupon_applied = is_valid and threshold_met
        if coupon_applied:
            coupon_savings = coupon.discount_amount
            
        coupon_info = {
            "expire_date": coupon.expire_date.strftime("%Y.%m.%d"),
            "threshold": f"{coupon.threshold:.2f}",
            "discount_amount": f"{coupon.discount_amount:.2f}",
            "is_valid": is_valid,
            "threshold_met": threshold_met
        }
        
    final_total = max(Decimal("0.00"), discounted_subtotal - coupon_savings)
    rounded_total = final_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    return {
        "settlement_date": settlement_date.strftime("%Y.%m.%d"),
        "items": items_breakdown,
        "raw_subtotal": f"{raw_subtotal:.2f}",
        "promo_savings_total": f"{promo_savings_total:.2f}",
        "discounted_subtotal": f"{discounted_subtotal:.2f}",
        "coupon": coupon_info,
        "coupon_applied": coupon_applied,
        "coupon_savings": f"{coupon_savings:.2f}",
        "final_total": f"{rounded_total:.2f}"
    }

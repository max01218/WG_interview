from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from typing import List, Dict, Optional

# 初始支援商品目錄註冊表
PRODUCT_TO_CATEGORY: Dict[str, str] = {
    # 電子
    "ipad": "電子",
    "iphone": "電子",
    "顯示器": "電子",
    "筆記型電腦": "電子",
    "鍵盤": "電子",
    # 食品
    "麵包": "食品",
    "餅乾": "食品",
    "蛋糕": "食品",
    "牛肉": "食品",
    "魚": "食品",
    "蔬菜": "食品",
    # 日用品
    "餐巾紙": "日用品",
    "收納箱": "日用品",
    "咖啡杯": "日用品",
    "雨傘": "日用品",
    # 酒類
    "啤酒": "酒類",
    "白酒": "酒類",
    "伏特加": "酒類",
}

class Product:
    """表示商品的領域模型"""
    def __init__(self, name: str, price: Decimal, category: Optional[str] = None):
        self.name = name.strip()
        self.price = price
        # 進行大小寫不敏感的品類匹配，若不在標準品類中則歸類為 "其他"
        normalized_name = self.name.lower()
        self.category = category or PRODUCT_TO_CATEGORY.get(normalized_name, "其他")

    def __repr__(self) -> str:
        return f"Product(name='{self.name}', price={self.price}, category='{self.category}')"


class CartItem:
    """購物車中的單一商品購買明細"""
    def __init__(self, product: Product, quantity: int):
        self.product = product
        self.quantity = quantity

    @property
    def raw_total(self) -> Decimal:
        """未折扣前的高精度商品小計 (單價 * 數量)"""
        return self.product.price * self.quantity

    def __repr__(self) -> str:
        return f"CartItem(product={self.product.name}, quantity={self.quantity})"


class Promotion:
    """品類促銷折扣策略。格式：日期 | 折扣率 | 產品品類"""
    def __init__(self, active_date: date, discount_rate: Decimal, category: str):
        self.active_date = active_date
        self.discount_rate = discount_rate
        self.category = category.strip()

    def __repr__(self) -> str:
        return f"Promotion(date={self.active_date}, rate={self.discount_rate}, category='{self.category}')"


class Coupon:
    """滿額折抵優惠券策略。格式：到期日 滿額門檻 折抵金額"""
    def __init__(self, expire_date: date, threshold: Decimal, discount_amount: Decimal):
        self.expire_date = expire_date
        self.threshold = threshold
        self.discount_amount = discount_amount

    def is_valid(self, settlement_date: date) -> bool:
        """判定優惠券在結算日是否有效 (結算日 <= 到期日)"""
        return settlement_date <= self.expire_date

    def apply(self, total_amount: Decimal) -> Decimal:
        """在滿足滿額門檻時套用折扣，並確保金額不為負數"""
        if total_amount >= self.threshold:
            return max(Decimal("0.00"), total_amount - self.discount_amount)
        return total_amount

    def __repr__(self) -> str:
        return f"Coupon(expires={self.expire_date}, threshold={self.threshold}, discount={self.discount_amount})"


class Cart:
    """購物車核心對象，封裝整套結算業務邏輯"""
    def __init__(self):
        self.items: List[CartItem] = []

    def add_item(self, item: CartItem):
        """將購物明細加入購物車"""
        self.items.append(item)

    def calculate_discounted_total(self, settlement_date: date, promotions: List[Promotion]) -> Decimal:
        """計算套用品類促銷折扣後的小計總額 (保留完整精度)"""
        total = Decimal("0.00")
        for item in self.items:
            # 找出結算當天適用於該商品品類的所有促銷活動
            active_promos = [
                p for p in promotions
                if p.active_date == settlement_date and p.category == item.product.category
            ]
            if active_promos:
                # 若有多個相同品類促銷，採策略最優解 (折扣率最低，即最便宜)
                best_rate = min(p.discount_rate for p in active_promos)
                item_total = item.raw_total * best_rate
            else:
                item_total = item.raw_total
            total += item_total
        return total

    def checkout(self, settlement_date: date, promotions: List[Promotion], coupon: Optional[Coupon]) -> Decimal:
        """
        完整的結帳流程：
        1. 依結算日計算套用品類促銷折扣後的商品總和
        2. 判定並套用滿額優惠券
        3. 最後進行高精度的四捨五入 (ROUND_HALF_UP) 保留兩位小數
        """
        # Step 1: 計算商品與品類折扣
        discounted_total = self.calculate_discounted_total(settlement_date, promotions)

        # Step 2: 判定並套用優惠券
        final_total = discounted_total
        if coupon and coupon.is_valid(settlement_date):
            final_total = coupon.apply(discounted_total)

        # Step 3: 四捨五入保留小數點後兩位
        return final_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

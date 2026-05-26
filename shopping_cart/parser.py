from decimal import Decimal
from datetime import date
from typing import List, Tuple, Optional
from shopping_cart.models import Product, CartItem, Promotion, Coupon, Cart

def parse_date(date_str: str) -> date:
    """
    解析 YYYY.MM.DD 或 YYYY.M.D 格式的日期。
    不依賴於前導零，比 strptime 更為強健。
    """
    date_str = date_str.strip()
    parts = date_str.split('.')
    if len(parts) != 3:
        raise ValueError(f"無效的日期格式: '{date_str}'。預期格式為 YYYY.MM.DD")
    try:
        year = int(parts[0])
        month = int(parts[1])
        day = int(parts[2])
        return date(year, month, day)
    except ValueError as e:
        raise ValueError(f"日期轉換為整數失敗: '{date_str}'。錯誤: {e}")

def clean_line(line: str) -> str:
    """去除行尾的註解 (//...) 及首尾的空白字元"""
    if '//' in line:
        line = line.split('//', 1)[0]
    return line.strip()

class CartInputParser:
    """結帳系統輸入文字解析器"""
    
    @staticmethod
    def parse(input_text: str) -> Tuple[date, List[Promotion], Cart, Optional[Coupon]]:
        """
        將原始文字輸入解析為結帳引擎所需的領域對象。
        採用「特徵簽名比對法」讀取每一行，從而對空行與區塊順序具備極佳的容錯能力。
        
        傳回值:
            (結算日期, 促銷活動列表, 購物車對象, 優惠券對象)
        """
        settlement_date: Optional[date] = None
        promotions: List[Promotion] = []
        cart = Cart()
        coupon: Optional[Coupon] = None
        
        # 按行處理
        lines = input_text.splitlines()
        for idx, raw_line in enumerate(lines, 1):
            line = clean_line(raw_line)
            if not line:
                continue  # 忽略空行
                
            try:
                # 1. 判定是否為品類促銷活動 (含有 '|' 符號)
                if '|' in line:
                    parts = line.split('|')
                    if len(parts) != 3:
                        raise ValueError(f"促銷格式應為 '日期|折扣率|品類'")
                    p_date = parse_date(parts[0])
                    p_rate = Decimal(parts[1].strip())
                    p_category = parts[2].strip()
                    promotions.append(Promotion(p_date, p_rate, p_category))
                    
                # 2. 判定是否為購物車商品明細 (同時含有 '*' 與 ':')
                elif '*' in line and ':' in line:
                    qty_part, item_part = line.split('*', 1)
                    prod_name, price_part = item_part.split(':', 1)
                    
                    quantity = int(qty_part.strip())
                    price = Decimal(price_part.strip())
                    
                    product = Product(prod_name, price)
                    cart.add_item(CartItem(product, quantity))
                    
                # 3. 判定是否為優惠券 (空格分割，且有三個元素，如：2016.3.2 1000 200)
                elif len(line.split()) == 3:
                    parts = line.split()
                    c_date = parse_date(parts[0])
                    c_threshold = Decimal(parts[1])
                    c_discount = Decimal(parts[2])
                    # 若有多張優惠券，本題假設僅保留最後一張（或可拋錯，此處採保留最新）
                    coupon = Coupon(c_date, c_threshold, c_discount)
                    
                # 4. 判定是否為結算日期 (僅為單一日期，如：2015.11.11)
                elif '.' in line and len(line.split()) == 1:
                    settlement_date = parse_date(line)
                    
                else:
                    raise ValueError(f"無法識別的行格式: '{line}'")
                    
            except Exception as e:
                raise ValueError(f"第 {idx} 行解析失敗 (內容: '{line}'): {e}")
                
        # 驗證必要欄位
        if not settlement_date:
            raise ValueError("輸入資料中未包含有效的結算日期")
            
        return settlement_date, promotions, cart, coupon

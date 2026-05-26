import unittest
from decimal import Decimal
from datetime import date
from shopping_cart.models import Product, CartItem, Promotion, Coupon, Cart
from shopping_cart.engine import checkout_from_text, checkout_details

class TestShoppingCartEngine(unittest.TestCase):
    
    def test_case_a_official(self):
        """官方測項 Case A 驗證"""
        input_data = """2015.11.11|0.7|電子 //促銷資訊,格式為:日期|折扣|產品品類,可有多個,每個一行,如果沒有則保留一個空行
        
        1*ipad:2399.00 //所購產品,每種一行,格式為:數量*商品:單價
        1*顯示器:1799.00
        12*啤酒:25.00
        5*麵包:9.00
        
        2015.11.11 //結算日期
        2016.3.2 1000 200 //優惠券資訊,示例為 2016 年 3月2日到期,滿 1000 折 200
        """
        result = checkout_from_text(input_data)
        self.assertEqual(result, "3083.60")
        
    def test_case_b_official(self):
        """官方測項 Case B 驗證"""
        input_data = """
        3*蔬菜:5.98
        8*餐巾紙:3.20
        
        2015.01.01
        
        """
        result = checkout_from_text(input_data)
        self.assertEqual(result, "43.54")
        
    def test_expired_coupon(self):
        """驗證優惠券過期的情況"""
        input_data = """2015.11.11|0.7|電子
        
        1*ipad:2399.00
        
        2015.11.11
        2015.11.10 1000 200 // 優惠券於前一天過期
        """
        # ipad: 2399 * 0.7 = 1679.30
        # 由於優惠券過期，最終價格應為 1679.30
        result = checkout_from_text(input_data)
        self.assertEqual(result, "1679.30")
        
    def test_coupon_threshold_not_met(self):
        """驗證消費金額未達優惠券滿額門檻"""
        input_data = """2015.11.11|0.7|電子
        
        1*ipad:1000.00
        
        2015.11.11
        2016.3.2 1000 200
        """
        # ipad: 1000.00 * 0.7 = 700.00
        # 促銷折扣後小計為 700.00，小於優惠券門檻 1000，故不套用優惠券。最終應為 700.00
        result = checkout_from_text(input_data)
        self.assertEqual(result, "700.00")
        
    def test_coupon_threshold_exactly_met(self):
        """驗證促銷後金額剛好達到優惠券門檻"""
        input_data = """2015.11.11|0.7|電子
        
        1*ipad:1428.58
        
        2015.11.11
        2016.3.2 1000 200
        """
        # ipad: 1428.58 * 0.7 = 1000.006 (高精度金額)
        # 滿額 1000 成立，套用滿額折 200 -> 1000.006 - 200 = 800.006
        # 四捨五入後為 800.01
        result = checkout_from_text(input_data)
        self.assertEqual(result, "800.01")
        
    def test_precision_rounding_half_up(self):
        """驗證商業高精度四捨五入 (ROUND_HALF_UP)"""
        # 測試小數點第三位為 5 時是否入位
        # 1 * 鍵盤: 15.225 元，無促銷無優惠
        # 應四捨五入至 15.23
        input_data = """
        1*鍵盤:15.225
        
        2015.11.11
        """
        result = checkout_from_text(input_data)
        self.assertEqual(result, "15.23")
        
        # 測試小數點第三位為 4 時是否捨去
        # 1 * 鍵盤: 15.224 元
        # 應四捨五入至 15.22
        input_data = """
        1*鍵盤:15.224
        
        2015.11.11
        """
        result = checkout_from_text(input_data)
        self.assertEqual(result, "15.22")

    def test_whitespace_and_comments_resilience(self):
        """驗證系統對不規則空白、換行與多種行註解的容錯能力"""
        input_data = """
          2015.11.11  |   0.7   |   電子    // 前後多個空白
          
          
        1   *   ipad   :   2399.00    // 商品名帶前後空白
        
        2015.11.11
        
        
        2016.3.2   1000   200  // 優惠券帶空格
        """
        result = checkout_from_text(input_data)
        self.assertEqual(result, "1479.30") # 2399 * 0.7 = 1679.3 - 200 = 1479.30

    def test_multiple_promotions_best_rate(self):
        """驗證當同品類在同一天有多個促銷折扣時，系統能自動選取最優惠（折扣率最低）的策略"""
        input_data = """2015.11.11|0.7|電子
        2015.11.11|0.5|電子 // 更優惠的折扣
        2015.11.11|0.8|電子
        
        1*ipad:2000.00
        
        2015.11.11
        """
        # ipad: 2000.00. 應選 0.5 折扣率 -> 2000 * 0.5 = 1000.00
        result = checkout_from_text(input_data)
        self.assertEqual(result, "1000.00")

    def test_checkout_details_api(self):
        """驗證 API 細節回傳結構的正確性"""
        input_data = """2015.11.11|0.7|電子
        1*ipad:1000.00
        2015.11.11
        2016.3.2 1000 200
        """
        details = checkout_details(input_data)
        self.assertEqual(details["settlement_date"], "2015.11.11")
        self.assertEqual(details["raw_subtotal"], "1000.00")
        self.assertEqual(details["promo_savings_total"], "300.00")
        self.assertEqual(details["discounted_subtotal"], "700.00")
        self.assertFalse(details["coupon_applied"])
        self.assertEqual(details["final_total"], "700.00")

if __name__ == '__main__':
    unittest.main()

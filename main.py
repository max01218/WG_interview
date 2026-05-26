import sys
import os
from shopping_cart.engine import checkout_from_text

def main():
    """
    WisdomGarden 購物車結算系統命令行 CLI 入口點。
    支援透過引數讀取文字檔案，或直接接收管道/標準輸入 (stdin)。
    """
    input_content = ""
    
    # 1. 檢查是否傳入檔案路徑引數
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        if not os.path.exists(file_path):
            print(f"錯誤：檔案 '{file_path}' 不存在。", file=sys.stderr)
            sys.exit(1)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                input_content = f.read()
        except Exception as e:
            print(f"錯誤：讀取檔案 '{file_path}' 時發生異常: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # 2. 否則，從標準輸入 (stdin) 管道讀取
        # 若為終端機互動模式，印出輸入提示
        if sys.stdin.isatty():
            print("請輸入結算資訊並包含空行間隔（輸入完畢請按 Ctrl+Z 並 Enter 結束）：")
        input_content = sys.stdin.read()
        
    if not input_content.strip():
        print("錯誤：輸入內容為空。", file=sys.stderr)
        sys.exit(1)
        
    try:
        # 進行計算並輸出
        final_total = checkout_from_text(input_content)
        print(final_total)
    except Exception as e:
        print(f"結帳失敗：{e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

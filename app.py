from flask import Flask, render_template, request, jsonify
from shopping_cart.engine import checkout_details

app = Flask(__name__)

@app.route("/")
def index():
    """渲染首頁 UI 控制面板"""
    return render_template("index.html")

@app.route("/api/checkout", methods=["POST"])
def checkout():
    """
    結算 API 端點。
    接受 JSON 載荷，包含原始多行文字 inputs，傳回超詳細的結算明細與收據資料。
    """
    data = request.get_json() or {}
    input_text = data.get("input_text", "")
    
    if not input_text.strip():
        return jsonify({"error": "結帳輸入內容不可為空"}), 400
        
    try:
        details = checkout_details(input_text)
        return jsonify(details)
    except Exception as e:
        # 回傳解析或金額計算中產生的商業邏輯錯誤
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("啟動 WisdomGarden 購物車結算 Dashboard 服務器於 http://127.0.0.1:5000...")
    app.run(host="127.0.0.1", port=5000, debug=True)

from flask import Flask, request, jsonify, make_response
import os
from dotenv import load_dotenv
from profile_file_manager import ProfileFileManager
from profile_collector import ProfileCollector
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
import json 
import dotenv

# Flaskアプリケーションの初期化
app = Flask(__name__)
# 環境変数の読み込み
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

CORS(app)

def get_file_name(default='profiles.json'):
    return request.args.get('fileName', default)

# ルートパスに対するGET、POST、DELETEメソッドのリクエストを処理するための関数を定義しています。
@app.route('/', methods=['GET', 'POST', 'DELETE'])
def handle_profiles():
    if request.method == 'GET':
        return handle_get_request()
    elif request.method == 'POST':
        return handle_post_request()
    elif request.method == 'DELETE':
        return handle_delete_request()

def handle_get_request():
    action = request.args.get('action')
    if action == 'listProfiles':
        profile_file_manager = ProfileFileManager()
        profiles_data = profile_file_manager.list_profiles()
        return jsonify({"profiles": profiles_data})
    elif action == 'getProfiles':
        return get_profiles_action()
    elif action == 'loadProfile':
        return load_profile_action()

def handle_post_request():
    action = request.args.get('action')
    if action in ['saveProfile', 'addProfile']:
        return save_or_add_profile_action(action)
    elif action == 'saveProfileIcon':
        return save_profile_icon_action()

def handle_delete_request():
    file_name = request.args.get('fileName', None)
    profile_id = request.args.get('id', None)
    if file_name and profile_id:
        profile_collector = ProfileCollector(os.getenv('DATA_FILE_PATH'))
        result = profile_collector.delete_profile(file_name, profile_id)
        return result
    else:
        return jsonify({"message": "fileNameまたはidパラメータが不足しています"}), 400

def get_profiles_action():
    file_name = request.args.get('fileName', 'profiles.json')
    file_path = os.path.join(os.getenv('FILE_PATH'), file_name)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            profiles_data = file.read()
        return profiles_data
    except FileNotFoundError:
        return jsonify({"message": "プロファイルが見つかりません"}), 404

def load_profile_action():
    file_name = request.args.get('fileName', None)
    if file_name:
        profile_manager = ProfileFileManager()
        profile_data = profile_manager.load_profile(file_name)
        return jsonify(profile_data)
    else:
        return jsonify({"message": "fileNameパラメータが不足しています"}), 400

def save_profile_icon_action():
    file_name = request.args.get('fileName', None)
    icon_data = request.json.get('iconUrl', None)
    if file_name and icon_data:
        file_path = os.path.join(os.getenv('FILE_PATH'), file_name)
        try:
            with open(file_path, 'r+', encoding='utf-8') as file:
                data = json.load(file)
                data['IconImg'] = icon_data  # アイコンデータを追加
                file.seek(0)  # ファイルの先頭に移動
                json.dump(data, file, ensure_ascii=False, indent=4)
                file.truncate()  # ファイルを現在の位置で切り詰める
            return jsonify({"message": "アイコンが正常に保存されました"})
        except FileNotFoundError:
            return jsonify({"message": "プロファイルが見つかりません"}), 404
    else:
        return jsonify({"message": "fileNameまたはiconUrlパラメータが不足しています"}), 400
    
def save_or_add_profile_action(action):
    file_name = request.args.get('fileName', None)
    if file_name:
        data = request.json
        profile_file_manager = ProfileFileManager()
        success = False
        if action == 'saveProfile':
            success = profile_file_manager.save_profile(data)
        elif action == 'addProfile':
            success = profile_file_manager.add_profile(data, file_name)
        if success:
            return jsonify({"message": "プロファイルが正常に保存されました"})
        else:
            return jsonify({"message": "プロファイルの保存に失敗しました"}), 500
    else:
        return jsonify({"message": "fileNameパラメータが不足しています"}), 400

# アプリケーション内で発生した例外をキャッチし、適切なレスポンスを返すためのエラーハンドリングを行っています。
@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        response = e.get_response()
        response.data = jsonify({
            "code": e.code,
            "name": e.name,
            "description": e.description,
        })
    else:
        app.logger.error(f"Unhandled exception: {e}", exc_info=True)
        response = make_response(jsonify({"message": "内部サーバーエラーが発生しました"}), 500)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return response

if __name__ == '__main__':
     app.run(host='0.0.0.0', debug=True, port=5000)
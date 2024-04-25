import json
import os
from flask import Flask, jsonify
import dotenv
from flask_cors import CORS

# Flaskアプリケーションの初期化
app = Flask(__name__)
CORS(app)
# 環境変数をロードする
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__)))

class ProfileFileManager:
    def __init__(self):
        # 環境変数からファイルパスを取得し、インスタンス変数に設定
        self.file_path = os.getenv('DATA_FILE_PATH')

    def add_profile(self, profile_data, file_name):
        # プロファイルを追加するメソッド
        file_path = os.path.join(self.file_path, file_name)  # 完全なファイルパスを生成

        # ファイルが存在するか確認し、存在しなければ新しいファイルを作成
        if not os.path.exists(file_path):
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump({"profiles": []}, f, ensure_ascii=False, indent=4)

        # ファイルを開いて既存のデータを読み込む
        with open(file_path, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            if 'profiles' not in data:
                data['profiles'] = []
            # 新しいプロファイルを追加
            data['profiles'].append(profile_data)
            # ファイルの先頭に戻る
            f.seek(0)
            # 変更をファイルに書き込む
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.truncate()  # ファイルの末尾を削除（必要な場合）

        return True

    def list_profiles(self):
        try:
            directory = self.file_path
            profiles = []
            for file in os.listdir(directory):
                if file.endswith('.json'):
                    # エンコーディングエラーを回避するために errors='replace' を追加
                    with open(os.path.join(directory, file), 'r', encoding='utf-8', errors='replace') as f:
                        data = json.load(f)
                    profiles.append({
                        'fileName': file,
                        'name': data.get('botInfo', {}).get('name', '名前不明'),
                    })
            return profiles
        except Exception as e:
            app.logger.error(f"Error listing profiles: {str(e)}")
            raise
        # 指定されたファイル名のプロファイルをロードするメソッド
    def load_profile(self, file_name):
        full_path = os.path.join(self.file_path, file_name)
        if not os.path.exists(full_path):
            raise FileNotFoundError("指定されたプロファイルが存在しません。")
        with open(full_path, 'r', encoding='utf-8') as f:  # ここにencodingを追加
            data = json.load(f)
        return data

    def save_profile(self, profile_data):
        # プロファイルデータを保存するメソッド
        file_name = os.path.join(self.file_path, profile_data['file'] + '.json')
        if os.path.exists(file_name):
            with open(file_name, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = {"botInfo": {}, "profiles": []}
        existing_data['botInfo'] = {
            "name": profile_data['name'],
            "age": profile_data['age'],
            "gender": profile_data['gender'],
            "description": profile_data['description']
        }
        with open(file_name, 'w' , encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        return True

    def display_profile(self, file_name):
        # プロファイルを表示するメソッド
        try:
            profile_data = self.load_profile(file_name)
            return jsonify(profile_data)
        except FileNotFoundError:
            return jsonify(error="指定されたプロファイルが存在しません。"), 404

    def update_profile(self, file_name, new_profile_data):
        # プロファイルを更新するメソッド
        full_path = os.path.join(self.file_path, file_name)
        if not os.path.exists(full_path):
            raise FileNotFoundError("更新するプロファイルが存在しません。")
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(new_profile_data, f, ensure_ascii=False, indent=4)
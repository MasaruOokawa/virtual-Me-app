import json
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

class ProfileCollector:
    def __init__(self, file_path):
        self.file_path = file_path
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump({"profiles": [], "botInfo": {"name": "", "age": "", "gender": "", "description": ""}}, f, ensure_ascii=False, indent=4)

    def _read_file(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        except Exception as e:
            app.logger.error(f"Error reading file: {str(e)}")
            return None

    def get_profiles(self, file_name=''):
        file_path = os.path.join(self.file_path, file_name)
        data = self._read_file(file_path)
        if data is None:
            data = {"profiles": [], "botInfo": {"name": "", "age": "", "gender": "", "description": ""}}
        return data

    def get_bot_info(self):
        data = self._read_file(self.file_path)
        if data is None:
            return None
        if 'botInfo' in data:
            return data['botInfo']
        else:
            app.logger.error("Error fetching botInfo: 'botInfo' key is missing in JSON.")
            return None

    # Remaining methods unchanged
    def get_bot_info(self):
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if 'botInfo' in data:
                return data['botInfo']
            else:
                app.logger.error("Error fetching botInfo: 'botInfo' key is missing in JSON.")
                return None
        except Exception as e:
            app.logger.error(f"Error fetching botInfo: {str(e)}")
            return None

    def add_profile(self, profile_data, file_name):
        file_path = os.path.join(self.file_path, file_name)  # Using file name obtained from URL parameter
        try:
            with open(file_path, 'r+', encoding='utf-8') as f:
                data = json.load(f)
                if 'profiles' not in data:
                    data['profiles'] = []
                data['profiles'].append(profile_data)
                f.seek(0)
                json.dump(data, f, ensure_ascii=False, indent=4)
                f.truncate()
            return True
        except Exception as e:
            app.logger.error(f"Error saving profile: {str(e)}")
            return False

    def delete_profile(self, file_name, id):
        file_path = os.path.join(self.file_path, file_name)
        print(file_path)
        try:
            if not id:
                raise Exception("ID parameter is missing.")

            data = self.get_profiles(file_name)  # Passing file name is not necessary
            profiles = data['profiles']
            found = False
            for profile in profiles:
                if str(profile['id']) == str(id):
                    profiles.remove(profile)
                    found = True
                    break
            if not found:
                response = jsonify(message=f"IDが {id} のプロファイルが見つかりません。")
                response.status_code = 404
                return response
            else:
                data['profiles'] = profiles

                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)
                return jsonify(message="プロファイルを削除しました")
        except Exception as e:
            app.logger.error(f"Error deleting profile: {str(e)}")
            response = jsonify(message="Failed to delete profile")
            response.status_code = 500
            return response
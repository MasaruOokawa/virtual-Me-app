import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from './contexts/ProfileContext';
import ProfileForm from './components/ProfileForm';
import ProfileList from './components/ProfileList';
import ChatbotSystem from './components/ChatbotSystem';
import ProfileCreationForm from './components/ProfileCreationForm'; // プロファイル作成フォームコンポーネントのインポート
import ProfileSelectionDropdown from './components/ProfileSelectionDropdown'; // プロファイル選択ドロップダウンコンポーネントのインポート
import { CreateBotInfo } from './components/ProfileCreationForm';
import ProfileIcon from './components/ProfileIcon';
import './App.css';

// プロファイルの質問と回答を保持するインターフェース
interface ProfileQA {
  id: string;
  question: string;
  answer: string;
}

// プロファイルの名前とファイル名を保持するインターフェース
interface ProfileFileName {
  name: string;
  fileName: string;
}

// プロファイルのアイコン画像URLを保持するインターフェース
interface ProfileImg {
  iconUrl: string;
}

function App() {
  const [profiles, setProfiles] = useState<ProfileQA[]>([]); // プロファイルの状態管理
  const [profileIconImage] = useState<ProfileImg | null>(null); // プロファイルアイコン画像の状態管理
  const [selectedFileName, setSelectedFileName] = useState<string | null>("bbb.json"); // 選択されたファイル名の状態管理
  const [selectedProfileName, setSelectedProfileName] = useState<string | null>(null); // 選択されたプロファイル名の状態管理
  const apiUrl = process.env.REACT_APP_API_URL; // 環境変数からAPI URLを取得

  // 選択されたプロファイル名に基づいてアクティブなプロファイルを設定する関数
  const handleSetActiveProfileByName = (profile: ProfileFileName) => {
    setSelectedFileName(profile.fileName); // fileNameを状態として保持
    setSelectedProfileName(profile.name); // ここでプロファイル名を更新
    fetchProfiles(); // 選択されたプロファイルに基づいてプロファイルデータを再取得
  };

  // ボット情報の状態管理
  const [botInfo, setBotInfo] = useState<CreateBotInfo>({
    file: '',
    name: '',
    age: '',
    gender: '',
    description: '',
  });
  // ボット情報を更新する関数
  const updateBotInfo = useCallback((info: CreateBotInfo) => {
    setBotInfo(info);
  }, []);


  // プロファイルデータを取得する関数
  const fetchProfiles = useCallback(async () => {
    const fileName = selectedFileName;

    try {
      const response = await fetch(`${apiUrl}?action=loadProfile&fileName=${fileName}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.profiles && Array.isArray(data.profiles)) {
          if (JSON.stringify(profiles) !== JSON.stringify(data.profiles)) {
            setProfiles(data.profiles); // プロファイルデータが更新されていれば状態を更新
          }
        } else {
          console.error('プロファイルデータが見つかりません。');
          setProfiles([]); // データが見つからない場合は空の配列をセット
        }
      } else {
        alert('プロファイルの取得に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('プロファイルの取得中にエラーが発生しました:', error);
      alert('プロファイルの取得中にエラーが発生しました。もう一度お試しください。');
    }
  }, [selectedFileName, apiUrl, profiles]); // 依存配列にselectedFileName, apiUrl, profilesを指定

  // selectedFileNameが変更されたときにプロファイルデータを再取得するためのuseEffect
  useEffect(() => {
    if (selectedFileName) {
      fetchProfiles();
    }
  }, [selectedFileName, fetchProfiles]); // 依存配列にselectedFileNameとfetchProfilesを指定

  // アプリケーションのメインコンポーネントをレンダリング
  return (
    <Router>
      <ProfileProvider>
        <div className="App">
          <header className="App-header">
            <h1>バーチャル大川アプリ</h1>
          </header>
          <main>
            <ProfileIcon selectedFileName={selectedFileName} profileImg={profileIconImage || { iconUrl: '' }} selectedProfileName={selectedProfileName} />
            <ChatbotSystem selectedFileName={selectedFileName} selectedProfileName={selectedProfileName} />
            <ProfileSelectionDropdown setActiveProfile={handleSetActiveProfileByName} updateBotInfo={updateBotInfo} />
            <ProfileCreationForm selectedFileName={selectedFileName || ""} botInfo={botInfo} />
            <Routes>
              <Route path="/" element={<ProfileForm profiles={profiles} setProfiles={setProfiles} fetchProfiles={fetchProfiles} selectedFileName={selectedFileName || ""} />} />
              <Route path="/chat" element={<ChatbotSystem selectedFileName={selectedFileName} selectedProfileName={selectedProfileName} />} />
            </Routes>
            <ProfileList profiles={profiles} setProfiles={setProfiles} fetchProfiles={fetchProfiles} selectedFileName={selectedFileName || ""} />
          </main>
        </div>
      </ProfileProvider>
    </Router>
  );
}

export default App;
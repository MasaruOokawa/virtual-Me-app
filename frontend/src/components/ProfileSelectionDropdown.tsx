import React, { useState, useEffect, ChangeEvent } from 'react';
import { CreateBotInfo } from './ProfileCreationForm';

interface ProfileFileName {
    name: string; // プロファイルの表示名
    fileName: string; // プロファイルのファイル名、これは一意の識別子として機能します。
}

interface Props {
    setActiveProfile: (profile: ProfileFileName) => void;
    updateBotInfo: (info: CreateBotInfo) => void; // この行を追加
}

const DEFAULT_PROFILE_FILE_NAME = 'profiles.json';

const useSelectedFileName = () => {
    const [selectedFileName, setSelectedFileName] = useState<string>(() => {
        return localStorage.getItem('selectedProfileFileName') || DEFAULT_PROFILE_FILE_NAME;
    });

    return [selectedFileName, setSelectedFileName] as const;
};

const ProfileSelectionDropdown = ({ setActiveProfile, updateBotInfo }: Props) => {
    const [profiles, setProfiles] = useState<ProfileFileName[]>([]);
    const [isApplied, setIsApplied] = useState<boolean>(false); // 適応ボタンが押されたかの状態
    const [selectedFileName, setSelectedFileName] = useSelectedFileName();

    useEffect(() => {
        // プロファイルをフェッチする
        const fetchProfiles = async () => {
            if (!selectedFileName) {
                console.error('selectedFileName が null または未定義です。');
                return;
            }
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}?action=listProfiles&fileName=${selectedFileName}`, {
                    method: 'GET'
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profiles');
                }
                const data = await response.json();
                setProfiles(data.profiles);
                if (data.profiles && Array.isArray(data.profiles)) {
                    setProfiles(data.profiles);
                    // デフォルトまたは保存されたプロファイルを選択する
                    const savedFileName = localStorage.getItem('selectedProfileFileName') || DEFAULT_PROFILE_FILE_NAME;
                    setSelectedFileName(savedFileName);
                    const defaultOrSavedProfile = data.profiles.find((profile: ProfileFileName) => profile.fileName === savedFileName);
                    if (defaultOrSavedProfile) {
                        setActiveProfile(defaultOrSavedProfile);
                    }
                } else {
                    throw new Error('Profiles data is not an array');
                }
            } catch (error) {
                console.error('Error fetching profiles:', error);
            }
        };

        fetchProfiles();
    }, [selectedFileName]); // 依存配列に selectedFileName を追加
    
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newSelectedFileName = e.target.value;
        setSelectedFileName(newSelectedFileName); // ローカルの状態を更新
        // App コンポーネントに選択されたファイル名を伝える
        const selectedProfile = profiles.find(profile => profile.fileName === newSelectedFileName);
        if (selectedProfile) {
            setActiveProfile(selectedProfile);
        }
    };

    useEffect(() => {
        // 選択された fileName が変更されたときに実行
        const applyProfile = async () => {
            const selectedProfile = profiles.find(profile => profile.fileName === selectedFileName);
            if (selectedProfile) {
                setActiveProfile(selectedProfile);
                // setIsApplied(true);
                localStorage.setItem('selectedProfileFileName', selectedFileName);
                // BotInfo を取得して updateBotInfo に渡す
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}?action=loadProfile&fileName=${selectedFileName}`);
                    if (!response.ok) {
                        throw new Error('データの読み込みに失敗しました。');
                    }
                    const data = await response.json();
                    updateBotInfo({
                        file: selectedFileName.replace(/\.json$/, ''),
                        name: data.botInfo.name,
                        age: data.botInfo.age,
                        gender: data.botInfo.gender,
                        description: data.botInfo.description,
                    });
                } catch (error) {
                    console.error('エラーが発生しました:', error);
                }
            }
        };

        if (selectedFileName && selectedFileName !== localStorage.getItem('selectedProfileFileName')) {
            applyProfile();
        }
    }, [selectedFileName, profiles, setActiveProfile, updateBotInfo]); // 依存関係に selectedFileName と profiles を追加

    return (
        <div className="Profile-Selection-Dropdown">
            <label htmlFor="profile-select">Botデータの選択 -
                <span className={`button ${isApplied ? "applied" : ""}`}>{selectedFileName}</span>
            </label>
            <select id="profile-select" value={selectedFileName} onChange={handleChange}>
                {profiles.map(profile => (
                    <option key={profile.fileName} value={profile.fileName}>{profile.name} - {profile.fileName}</option>
                ))}
            </select>
            {/* <button className="button-applied" onClick={() => setIsApplied(true)}>適用</button> */}
        </div>
    );
};

export default ProfileSelectionDropdown;


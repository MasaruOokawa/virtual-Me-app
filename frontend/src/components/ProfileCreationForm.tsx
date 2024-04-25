import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

export interface CreateBotInfo {
    file: string;
    name: string;
    age: string;
    gender: string;
    description: string;
}
interface Props {
    selectedFileName: string;
    botInfo: CreateBotInfo; // この行を追加
}

const ProfileCreationForm = ({ selectedFileName, botInfo }: Props) => {
    const [profile, setProfile] = useState<CreateBotInfo>({
        file: '',
        name: '',
        age: '',
        gender: '',
        description: '',
    });

    // botInfoが変更されたときにフォームの状態を更新
    useEffect(() => {
        setProfile({
            file: botInfo.file || '',
            name: botInfo.name || '',
            age: botInfo.age || '',
            gender: botInfo.gender || '',
            description: botInfo.description || '',
        });
    }, [botInfo]);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
        setProfile(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.file || !profile.name || !profile.age || !profile.gender || !profile.description) {
            alert('全ての項目を入力してください。');
            return;
        }
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}?action=saveProfile&fileName=` + profile.file + '.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: profile.file,
                    name: profile.name,
                    age: profile.age,
                    gender: profile.gender,
                    description: profile.description,
                }),
            });
            if (!response.ok) {
                throw new Error('プロフィールデータの保存に失敗しました。');
            }
            alert('プロフィールデータが正常に保存されました。');
        } catch (error) {
            console.error('プロファイルデータの保存中にエラーが発生しました:', error);
        }
    };

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const toggleAccordion = () => {
        setIsAccordionOpen(!isAccordionOpen);
    };

    const clearForm = () => {
        setProfile({
            file: '',
            name: '',
            age: '',
            gender: '',
            description: '',
        });
    };

    return (
        <div className="profile-creation-form">
            <h2 onClick={toggleAccordion} className="accordion">
                {isAccordionOpen ? '▲' : '▼'} Botデータの作成
            </h2>
            <div className={`panel ${isAccordionOpen ? "open" : ""}`}>
                {isAccordionOpen && (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="file">ファイル名（英数字）</label>
                            <input
                                type="text"
                                id="file"
                                name="file"
                                value={profile.file || ''}
                                pattern="^[a-zA-Z0-9]+$"
                                title="データ名は半角英数のみで入力してください。"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <div>
                                <label htmlFor="name">名前</label>
                                <input type="text" id="name" name="name" value={profile.name || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="age">年齢</label>
                                <input type="text" id="age" name="age" value={profile.age || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="gender">性別</label>
                                <input type="text" id="gender" name="gender" value={profile.gender || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description">キャラの説明</label>
                            <textarea id="description" name="description" value={profile.description || ''} onChange={handleChange} />
                        </div>
                        <div className="button-group">
                            <button type="submit">保存</button>
                            <button type="button" onClick={clearForm}>クリア</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
export default ProfileCreationForm;
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { NewProfile } from '../services/profileService';
import { useProfiles } from '../contexts/ProfileContext';

interface Profile {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  fetchProfiles: any;
  selectedFileName: string; // この行を追加
}


const ProfileForm = ({ profiles, setProfiles, fetchProfiles, selectedFileName }: Props) => {
  // const ProfileForm =  ({ profiles, setProfiles , fetchProfiles }: { profiles: Profile[], setProfiles: React.Dispatch<React.SetStateAction<Profile[]>> , fetchProfiles: any}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<NewProfile>({ question: '', answer: '' });
  const { addProfile } = useProfiles(); // Contextから関数を取得


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile.question || !profile.answer) {
      setErrorMessage('QuestionとAnswerの両方を入力してください。');
      return;
    }
    try {
      // 一時的なID割り当てのためのロジックを追加
      const maxId = profiles.reduce((max, profile) => Math.max(max, parseInt(profile.id, 10)), 0);
      const newProfileWithId = { ...profile, id: String(maxId + 1) };
  
      setProfile({ question: '', answer: '' }); // フォームをリセット
      setErrorMessage(''); // エラーメッセージをクリア
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}?action=addProfile&fileName=${selectedFileName}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfileWithId),
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      alert('プロファイルは正常に保存されました！');
      fetchProfiles(); // プロファイルリストを更新
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('エラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>プロフィール情報の追加</h2>
      <div>
        <label htmlFor="question"  className="Question">Question</label>
        <input type="text" id="question" name="question" value={profile.question} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="answer" className="Answer">Answer</label>
        <input type="text" id="answer" name="answer" value={profile.answer} onChange={handleChange} />
      </div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <button type="submit">追加</button>
    </form>
  );
};

export default ProfileForm;
import { useState } from 'react';

export interface Profile {
  id?: string; // idをオプショナルにする
  question: string;
  answer: string;
}

export interface NewProfile {
  question: string;
  answer: string;
}

const useProfileService = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

const saveProfile = async (profile: Profile) => {
  if (!profile.question.trim() || !profile.answer.trim()) {
    setError('Question と Answer のどちらも入力してください。');
    return; // ここで処理を中断
  }

  try {
    const response = await fetch(`${apiUrl}`, {
      method: 'POST', // HTTPメソッドとしてPOSTを指定
      headers: {
        'Content-Type': 'application/json', // リクエストのコンテントタイプをJSONとして指定
      },
      body: JSON.stringify({ ...profile, file: 'profiles.json' }), // 送信するデータ。プロファイル情報に加えて、'file'キーでファイル名を指定
    });
    if (!response.ok) {
      throw new Error('プロファイルの保存に失敗しました。');
    }
    setError(null);
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
      console.error('プロファイル保存時のエラー:', error);
    }
  }
};

  const deleteProfile = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('プロファイルの削除に失敗siteimasu');
      }
      setProfiles(profiles.filter(profile => profile.id !== id));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        console.error('プロファイル削除時のエラー:', error);
      }
    }
  };

  return { profiles, error, saveProfile, deleteProfile };
};

export default useProfileService;
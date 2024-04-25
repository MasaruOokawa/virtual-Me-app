import React, { useState, useEffect } from 'react';

interface Profile {
  id: string;
  question: string;
  answer: string;
}
// propsにselectedFileNameを追加
const ProfileList = ({ profiles, setProfiles, fetchProfiles, selectedFileName }: {
  profiles: Profile[], setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>,
  fetchProfiles: any, selectedFileName: string}) => {
  // apiUrlの定義を修正
  const apiUrl = `${process.env.REACT_APP_API_URL}?action=loadProfile&fileName=${selectedFileName}`;

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}?action=deleteProfile&fileName=${selectedFileName}&id=${id}`, { method: 'DELETE' });
      // const response = await fetch(`${apiUrl}?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('プロファイルの削除に失敗しました。');
      }
      await fetchProfiles();
    } catch (error) {
      console.error('プロファイルの削除に失敗しました。', error);
    }
  };

  useEffect(() => {
    fetchProfiles(); // selectedFileName が変更されたときにプロフィール一覧を再取得
  }, [selectedFileName, fetchProfiles]); // 依存配列に selectedFileName を追加

  return (
    <div>
      <h2>プロフィール一覧</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th className="Question">Question</th>
            <th className="Answer">Answer</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td>{profile.id}</td>
              <td>{profile.question}</td>
              <td>{profile.answer}</td>
              <td><button onClick={() => handleDelete(profile.id)}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileList;

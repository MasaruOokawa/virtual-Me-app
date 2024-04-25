// React と createContext, useContext フックをインポートしています。
import React, { createContext, useContext } from 'react';
// useProfileService フックと Profile 型を profileService からインポートしています。
import useProfileService, { Profile } from '../services/profileService';

// ProfileContextType というインターフェースを定義しています。これは、プロファイルの配列、エラーメッセージ、
// プロファイルを取得、保存、削除する関数を含むオブジェクトの型を定義しています。
interface ProfileContextType {
  profiles: Profile[];
  error: string | null;
  addProfile: (profile: Profile) => Promise<void>; // addProfileプロパティを追加
  deleteProfile: (id: string) => Promise<void>;
}

// ProfileContext を作成しています。このコンテキストは、ProfileContextType 型の値、または未定義を保持できます。
export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// useProfiles というカスタムフックを定義しています。このフックは、ProfileContext を使用して、
// コンテキストの値を取得します。もしコンテキストが未定義の場合は、エラーを投げます。
export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

// ProfileProvider というコンポーネントを定義しています。このコンポーネントは、子コンポーネントを受け取り、
// useProfileService フックを使用してプロファイルのデータと操作関数を取得します。そして、これらの値を ProfileContext.Provider
// コンポーネントを通じて子コンポーネントに提供します。
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profiles, error, saveProfile: addProfile, deleteProfile } = useProfileService();

  return (
    <ProfileContext.Provider value={{ profiles, error, addProfile, deleteProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
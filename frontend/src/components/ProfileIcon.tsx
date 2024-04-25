import React, { useState, useEffect } from 'react';
import useDallEApi from '../contexts/dallE3Api';

interface Props {
  profileImg: { iconUrl: string };
  selectedFileName: string | null;
  selectedProfileName: string | null;
}

// プロファイルアイコンを表示するコンポーネント
const ProfileIcon = ({ profileImg, selectedFileName, selectedProfileName }: Props) => {
  const [iconUrl, setIconUrl] = useState('');
  const dallEApi = useDallEApi({ selectedFileName, selectedProfileName });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // 選択されたファイル名に基づいてアイコン画像を取得する
  useEffect(() => {
    const fetchIconImg = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}?action=getProfiles&fileName=${selectedFileName}`);
      const data = await response.json();
      if (data.IconImg) {
        setIconUrl(`data:image/png;base64,${data.IconImg}`);
      }
    };

    if (selectedFileName) {
      fetchIconImg();
    }
  }, [selectedFileName]);

  // アイコンを更新するボタンがクリックされたときに実行される処理を定義します
  const handleUpdateIcon = async () => {
    // 選択されたファイル名が存在しないか、dallEApiのgenerateImage関数が未定義の場合の処理を行います
    if (!selectedFileName || !dallEApi?.generateImage) {
      console.error('selectedFileNameがnullまたはgenerateImage関数が未定義です');
      return;
    }

    setButtonDisabled(true);
    try {
      const newIconData = await dallEApi.generateImage();
      if (newIconData.data[0].b64_json) {
        const base64data = newIconData.data[0].b64_json;
        setIconUrl(`data:image/png;base64,${base64data}`);

        // 更新されたアイコンをサーバーに保存する
        await fetch(`${process.env.REACT_APP_API_URL}?action=saveProfileIcon&fileName=${selectedFileName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ iconUrl: base64data }),
        });
      } else {
        console.error('Image data is undefined');
      }
    } catch (error) {
      console.error("Failed to update icon:", error);
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <div className="ProfileIcon">
      {iconUrl && <img className="profile-icon" src={iconUrl} alt="Profile Icon" />}
      <button onClick={handleUpdateIcon} disabled={buttonDisabled} className={buttonDisabled ? 'disabled' : 'iconUpBtn'}>
        {buttonDisabled ? `アイコン更新中...` : 'アイコン更新'}
      </button>
    </div>
  );
};

export default ProfileIcon;
import React, { useState } from 'react';

interface Props {
  selectedFileName: string | null;
  selectedProfileName: string | null;
}

const ChatbotSystem = ({ selectedFileName, selectedProfileName }: Props) => {

  const [question, setQuestion] = useState('');
  // const [answer, setAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatProfile = (profiles: Array<Record<string, any>>): string => {
    return profiles.map(profile => {
      let formattedProfile = "";
      Object.keys(profile).forEach((key) => {
        formattedProfile += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${profile[key]}\n`;
      });
      return formattedProfile;
    }).join('\n');
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) {
      setErrorMessage('質問を入力してください。');
      return;
    }

    setErrorMessage(''); // エラーメッセージをクリア
    setConversationHistory(prevHistory => [
      ...prevHistory,
      { role: "user", content: question }
    ]);

    setQuestion('');
    setIsLoading(true); // リクエスト開始時にローディング状態にする

    try {
      const profileResponse = await fetch(`${process.env.REACT_APP_API_URL}?action=loadProfile&fileName=${selectedFileName}`);      
      if (!profileResponse.ok) {
        throw new Error('プロファイルデータの取得に失敗しました。');
      }
      const profileData = await profileResponse.json();
      // console.log('全プロファイルデータ:', profileData);

      if (!profileData) {
        throw new Error('プロファイルデータが存在しません。');
      }
      if (!profileData.profiles) {
        throw new Error('プロファイルデータのprofilesキーが不正または存在しません。');
      }
      if (!profileData.botInfo) {
        throw new Error('プロファイルデータのbotInfoキーが不正または存在しません。');
      }

      const botInfoFormatted = `#This chatbot responds as a character named "${profileData.botInfo.name}". Age,${profileData.botInfo.age} years, ${profileData.botInfo.gender}\n#Explanation: ${profileData.botInfo.description}\n#Below is the profile information for "${profileData.botInfo.name}"`;
      const formattedProfile = formatProfile(profileData.profiles);
      const conversationPrompt = conversationHistory.map(entry => `#Below is a history of our conversations to date.\n${entry.role}: ${entry.content}`).join('\n') + `\nuser: ${question}`;
      const systemMessage = `\n${botInfoFormatted}\n${formattedProfile}\n${conversationPrompt}`;
      const apiKey = process.env.REACT_APP_API_KEY;
      console.log(systemMessage);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: question }
          ],
        }),
      });
      // console.log(response);
      
      if (!response.ok) {
        throw new Error('APIからの応答が正しくありません。');
      }
      const responseData = await response.json();
      const botResponse = responseData.choices[0].message.content;

      setConversationHistory(prevHistory => [
        ...prevHistory,
        { role: `bot`, content: botResponse }
        // { role: `${profileData.botInfo.name}bot`, content: botResponse }

      ]);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false); // リクエスト完了後にローディング状態を解除する
    }
  };

  const [questionSamples] = useState([
    'ー 質問を選択 ー',
    'お住まいはどこですか？',
    '性格を一言でいうと',
    '得意なことは？',
    '好きな食べ物は？',
    '血液型は？',
    '身長は？',
    '誕生日は？',
    '星座は？',
    '自分の長所は？',
    '出身は？',
    '利き腕は？',
    '小さいころ何をしていましたか',
    '小学生のとき好きだった教科は？',
    '座右の銘は？',
    '好きな言葉はなんですか？',
    'ストレス解消法は？',
    '春・夏・秋・冬どれが好きですか？',
    'いま一番欲しいものは？',
    'ITに関する三択クイズを出題してください。',
    '好きなラーメンの味 (＋麺の硬さや味の濃さなど) は？'
  ]);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    setErrorMessage(''); // 入力がある場合はエラーメッセージをクリア
  };


  return (
    <div className="chatbox">
      <h2>チャット - <strong  className="ProfileName">{selectedProfileName || 'デフォルト名'}</strong></h2>
      <form onSubmit={handleSubmit}>
        <div className="chat-history">
          {conversationHistory.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <select onChange={(e) => setQuestion(e.target.value)}>
          {questionSamples.map((sample, index) => (
            <option key={index} value={sample}>{sample}</option>
          ))}
        </select>
        <textarea
          value={question}
          onChange={handleChange}
          placeholder="ここに質問を入力してください..."
        />
        {errorMessage && (
          <div style={{ color: 'red' }}>
            <p>{errorMessage}</p>
          </div>
        )}
        <button type="submit" disabled={isLoading}>送信</button>

      </form>
    </div>
  );
};

export default ChatbotSystem;
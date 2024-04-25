import { useState, useEffect } from 'react'; 
import { OpenAI } from 'openai';

interface Props {
  selectedFileName: string | null;
  selectedProfileName: string | null;
}

// DALL-E APIを使用するためのカスタムフック
const useDallEApi = ({ selectedFileName }: Props) => {

  interface BotInfoData {
    botInfo: {
      name: string;
      age: string;
      gender: string;
      description: string;
    };
  }

  const [botInfoData, setBotInfoData] = useState<BotInfoData | null>(null);

  // 選択されたファイル名に基づいてボット情報を取得する
  useEffect(() => {
    // ボット情報を取得する非同期関数を定義
    const fetchBotInfo = async () => {
      // もし選択されたファイル名が存在しない場合はエラーメッセージを出力して関数を終了
      if (!selectedFileName) {
        console.error("selectedFileName が null または未定義です。");
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}?action=getProfiles&fileName=${selectedFileName}`);
        if (!response.ok) {
          throw new Error('プロファイルの取得に失敗しました');
        }
        const data = await response.json();
        setBotInfoData(data);
      } catch (error) {
        console.error("エラー:", error);
      }
    };

    fetchBotInfo();
  }, [selectedFileName]); // selectedFileNameが変更されたときに再度実行

  if (!botInfoData) {
    return null; // ローディング中またはデータがない場合はnullを返す
  }

  // ボット情報を整形して表示用のテキストを生成
  const truncatedBotInfoFormatted = botInfoData.botInfo.description.length > 150 ? botInfoData.botInfo.description.slice(0, 150) : botInfoData.botInfo.description;
  const botInfoFormatted = botInfoData ? `名前: ${botInfoData.botInfo.name}, 年齢: ${botInfoData.botInfo.age}, 性別: ${botInfoData.botInfo.gender}, 説明: ${truncatedBotInfoFormatted}` : '';
  const dallEPrompt = `以下の情報をもとに上半身の写真を生成して下さい。#情報\n${botInfoFormatted}`;
  
  // 画像生成リクエストを送信する関数
  const generateImage = async () => {
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_DALL_E_API_KEY,
      dangerouslyAllowBrowser: true
    });

    try {
      const dall_e_response = await openai.images.generate({
        model: "dall-e-3",
        prompt: dallEPrompt,
        n: 1,
        size: "1024x1024",
        // style: 'natural',
        response_format: 'b64_json'
      });

      console.log("Sent Prompt:", dallEPrompt);
      console.log("Received Response:", dall_e_response);

      return dall_e_response;
    } catch (error) {
      console.error("DALL-E API error:", error);
      throw error;
    }
  };

  return { generateImage };
};

export default useDallEApi;
import Profile from './profileService';

interface IChatResponse {
  answer: string;
}

// let conversationHistory: Array<{role: string, content: string}> = [];

export const sendQuestion = async (question: string, profile: string): Promise<IChatResponse> => {
  // conversationHistory.push({role: "user", content: question});

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        profile,
        // messages: conversationHistory, // 会話履歴をAPIに送信
      }),
    });

    if (!response.ok) {
      throw new Error('チャットボットからの回答の取得に失敗しました。');
    }

    const data: IChatResponse = await response.json();

     // APIからの回答を会話履歴に追加
    //  conversationHistory.push({role: "assistant", content: data.answer});

    return data;
  } catch (error) {
    console.error('Error in sendQuestion:', error);
    throw error;
  }
};

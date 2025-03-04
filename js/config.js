const T={API_ENDPOINT:"https://api.openai.com/v1/chat/completions",MODEL_CONFIG:{model:"gpt-4o-mini",temperature:.3},STORAGE_KEYS:{API_KEY:"openai_api_key"}},_={GRAMMAR_CHECK:`あなたは日本語の文法と表現の専門家です。以下のガイドラインに従って文章を改善してください：
1. 文法的な誤りを指摘し修正する
2. より自然で適切な表現に改善する
3. 原文の意図と意味を必ず保持する
4. 大きな変更が必要な場合は、その理由を説明する
5. 不要な改変は避け、必要な修正のみを行う

必ず以下の形式で回答してください：
\`\`\`修正
[修正後の文章のみをここに記入]
\`\`\`

その後に、修正の説明を記入してください：
\`\`\`説明
[修正の説明をここに記入]
\`\`\``},t={INPUT_TEXT:"inputText",CHECK_BUTTON:"checkButton",CLEAR_BUTTON:"clearButton",LOADING_SPINNER:"loadingSpinner",RESULT_CONTAINER:"resultContainer",RESULT:"result",COPY_BUTTON:"copyButton",HISTORY_LIST:"historyList",HISTORY_CONTAINER:"historyContainer",CLEAR_HISTORY_BUTTON:"clearHistoryButton",EXPORT_HISTORY_BUTTON:"exportHistoryButton",IMPORT_HISTORY_BUTTON:"importHistoryButton",IMPORT_HISTORY_FILE:"importHistoryFile"},I={EMPTY_INPUT:"テキストを入力してください。",ERROR_PREFIX:"エラーが発生しました: ",HISTORY_EMPTY:"履歴はありません。",HISTORY_CLEARED:"履歴を削除しました。",API_KEY_MISSING:"APIキーが設定されていません。設定画面から設定してください。",FULL_RESPONSE_TITLE:"完全な応答",ORIGINAL_TEXT_TITLE:"原文",EXPLANATION_TITLE:"説明"},E={KEYS:{HISTORY:"grammar_check_history"},MAX_HISTORY_ITEMS:50};export{T as A,E as S,t as U,I as a,_ as b};

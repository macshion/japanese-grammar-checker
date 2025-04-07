const A={ENDPOINT:"https://api.openai.com/v1/chat/completions",MODEL_CONFIG:{model:"gpt-3.5-turbo",temperature:.7,max_tokens:1e3},API_KEY:"apiKey"},_={KEYS:{API_KEY:"apiKey",HISTORY:"history",ACTIVE_TAB:"activeTab"},MAX_HISTORY_ITEMS:50},t=document.title.includes("DEV"),O=T=>(t?"dev_":"")+T,I={LANGUAGES:{ja:"日本語",en:"英語",zh:"中国語",ko:"韓国語"},DEFAULT_SOURCE:"ja",DEFAULT_TARGET:"en"},E={TYPES:{GRAMMAR:"grammar",TRANSLATION:"translation",CHAT:"chat"},TYPE_LABELS:{grammar:"文法チェック",translation:"翻訳",chat:"チャット"}},a={GRAMMAR_INPUT:"inputText",GRAMMAR_CHECK_BUTTON:"checkButton",GRAMMAR_CLEAR_BUTTON:"clearButton",GRAMMAR_LOADING:"loadingSpinner",GRAMMAR_RESULT_CONTAINER:"resultContainer",GRAMMAR_RESULT:"result",GRAMMAR_COPY_BUTTON:"copyButton",TRANSLATION_INPUT:"translationInput",TRANSLATION_SOURCE:"sourceLanguage",TRANSLATION_TARGET:"targetLanguage",TRANSLATION_BUTTON:"translateButton",TRANSLATION_CLEAR_BUTTON:"clearTranslationButton",TRANSLATION_LOADING:"translationLoadingSpinner",TRANSLATION_RESULT_CONTAINER:"translationResultContainer",TRANSLATION_RESULT:"translationResult",TRANSLATION_COPY_BUTTON:"copyTranslationButton",CHAT_INPUT:"aiChatInput",CHAT_SEND_BUTTON:"sendAiChatButton",CHAT_CLEAR_BUTTON:"clearAiChatButton",CHAT_LOADING:"aiChatLoadingSpinner",CHAT_RESULT_CONTAINER:"aiChatResultContainer",CHAT_RESULT:"aiChatResult",CHAT_COPY_BUTTON:"copyAiChatButton",HISTORY_LIST:"history-list",HISTORY_CONTAINER:"history-container",HISTORY_FILTER_CONTAINER:"history-filter-container",HISTORY_CLEAR_BUTTON:"history-clear-button",HISTORY_EXPORT_BUTTON:"history-export-button",HISTORY_IMPORT_BUTTON:"history-import-button",HISTORY_IMPORT_FILE:"history-import-file"},n={EMPTY_INPUT:"テキストを入力してください。",INVALID_LANGUAGE:"無効な言語が選択されています。",ERROR_PREFIX:"エラーが発生しました: ",API_ERROR:"APIリクエストに失敗しました: ",NETWORK_ERROR:"ネットワークエラーが発生しました。",API_KEY_MISSING:"APIキーが設定されていません。設定画面から設定してください。",HISTORY_EMPTY:"履歴がありません",HISTORY_CLEARED:"履歴を削除しました",HISTORY_EXPORT_ERROR:"履歴のエクスポートに失敗しました: ",HISTORY_IMPORT_ERROR:"履歴のインポートに失敗しました: ",FULL_RESPONSE_TITLE:"完全な応答",ORIGINAL_TEXT_TITLE:"原文",EXPLANATION_TITLE:"説明",COPY_SUCCESS:"コピーしました",CONFIRM_CLEAR_HISTORY:"履歴を全て削除しますか？",CONFIRM_IMPORT_HISTORY:"履歴をインポートしますか？既存の履歴は上書きされます。",DEV_MODE_LABEL:"[開発版]",PROD_MODE_LABEL:""},N={GRAMMAR_CHECK:`あなたは日本語の文法と表現の専門家です。以下のガイドラインに従って文章を改善してください：
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
\`\`\``,TRANSLATION:`あなたは翻訳者です。できるだけ自然な翻訳を心がけてください。
必要に応じて、文化的な違いや表現の違いについても説明を加えてください。`,AI_CHAT:`あなたは親切なAIアシスタントです。
1. ユーザーの質問に対して、できるだけ詳しく、わかりやすく回答してください。
2. 専門用語を使う場合は、必要に応じて説明を加えてください。
3. 回答が長くなる場合は、適切に段落分けをしてください。
4. 必要に応じて、例を挙げて説明してください。`};export{A,E as H,t as I,I as L,n as M,_ as S,a as U,N as a,O as g};

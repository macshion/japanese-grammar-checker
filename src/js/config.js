export const API_CONFIG = {
    API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    MODEL_CONFIG: {
        model: "gpt-4o-mini",
        temperature: 0.3
    },
    STORAGE_KEYS: {
        API_KEY: 'openai_api_key'
    }
};

export const SYSTEM_PROMPT = {
  GRAMMAR_CHECK: "あなたは日本語の校閲と表現の専門家であり、文章を用途に応じて自然で読みやすく改善するプロフェッショナルです。以下のガイドラインに従って、入力された日本語の文章を丁寧にチェックし、必要な修正を行ってください：\n" +
      "1. 文法的な誤りをすべて修正してください\n" +
      "2. より自然で滑らかな日本語に改善してください（冗長または不自然な言い回しを調整）\n" +
      "3. 原文の意味・意図を厳守してください（意味が変わらないように）\n" +
      "4. 用途や語調に応じて適切な敬語表現やカジュアル表現に整えてください（可能な場合）\n" +
      "5. 不要な改変は避け、必要最小限の修正を心がけてください\n\n" +
      "必ず以下のフォーマットで回答してください。形式が異なると自動処理に失敗します：\n" +
      "```修正\n" +
      "[修正後の文章のみをここに記入]\n" +
      "```\n\n" +
      "その後に、修正の理由と説明を記入してください：\n" +
      "```説明\n" +
      "[修正の説明をここに記入]\n" +
      "```"
};


export const UI_ELEMENTS = {
    INPUT_TEXT: 'inputText',
    CHECK_BUTTON: 'checkButton',
    CLEAR_BUTTON: 'clearButton',
    LOADING_SPINNER: 'loadingSpinner',
    RESULT_CONTAINER: 'resultContainer',
    RESULT: 'result',
    COPY_BUTTON: 'copyButton',
    HISTORY_LIST: 'history-list',
    HISTORY_CONTAINER: 'historyContainer',
    CLEAR_HISTORY_BUTTON: 'history-clear-button',
    EXPORT_HISTORY_BUTTON: 'history-export-button',
    IMPORT_HISTORY_BUTTON: 'history-import-button',
    IMPORT_HISTORY_FILE: 'history-import-file'
};

export const UI_MESSAGES = {
    EMPTY_INPUT: 'テキストを入力してください。',
    ERROR_PREFIX: 'エラーが発生しました: ',
    HISTORY_EMPTY: '履歴はありません。',
    HISTORY_CLEARED: '履歴を削除しました。',
    API_KEY_MISSING: 'APIキーが設定されていません。設定画面から設定してください。',
    FULL_RESPONSE_TITLE: '完全な応答',
    ORIGINAL_TEXT_TITLE: '原文',
    EXPLANATION_TITLE: '説明'
};

export const STORAGE_CONFIG = {
    KEYS: {
        HISTORY: 'grammar_check_history'
    },
    MAX_HISTORY_ITEMS: 50
}; 
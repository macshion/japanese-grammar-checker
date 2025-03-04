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
    GRAMMAR_CHECK: "あなたは日本語の文法と表現の専門家です。以下のガイドラインに従って文章を改善してください：\n" +
        "1. 文法的な誤りを指摘し修正する\n" +
        "2. より自然で適切な表現に改善する\n" +
        "3. 原文の意図と意味を必ず保持する\n" +
        "4. 大きな変更が必要な場合は、その理由を説明する\n" +
        "5. 不要な改変は避け、必要な修正のみを行う\n\n" +
        "必ず以下の形式で回答してください：\n" +
        "```修正\n" +
        "[修正後の文章のみをここに記入]\n" +
        "```\n\n" +
        "その後に、修正の説明を記入してください：\n" +
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
    HISTORY_LIST: 'historyList',
    HISTORY_CONTAINER: 'historyContainer',
    CLEAR_HISTORY_BUTTON: 'clearHistoryButton',
    EXPORT_HISTORY_BUTTON: 'exportHistoryButton',
    IMPORT_HISTORY_BUTTON: 'importHistoryButton',
    IMPORT_HISTORY_FILE: 'importHistoryFile'
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
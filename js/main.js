import { GrammarChecker } from './modules/grammar.js';
import { Translator } from './modules/translation.js';
import { AIChat } from './modules/aiChat.js';
import { History } from './modules/history.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    const grammarChecker = new GrammarChecker();
    const translator = new Translator();
    const aiChat = new AIChat();
    const history = new History();
}); 
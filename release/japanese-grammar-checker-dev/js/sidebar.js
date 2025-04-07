import { TabManager } from './modules/tabManager.js';
import { GrammarChecker } from './modules/grammar.js';
import { Translator } from './modules/translation.js';
import { AiChat } from './modules/aiChat.js';
import { StorageService } from './utils/storage.js';
import { SettingsManager } from './utils/settings.js';

class Sidebar {
    constructor() {
        this.storageService = new StorageService();
        this.settingsManager = new SettingsManager();
        this.initializeModules();
        this.initializeMessageListeners();
        this.initializeSettingsMenu();
    }

    initializeModules() {
        // Initialize tab manager
        this.tabManager = new TabManager();
        
        // Initialize feature modules
        this.grammarChecker = new GrammarChecker();
        this.translator = new Translator();
        this.aiChat = new AiChat();

        // Restore last active tab
        this.tabManager.restoreActiveTab();
    }

    initializeMessageListeners() {
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'updateSidebarText') {
                // Update text in the currently active tab
                switch (this.tabManager.activeTab) {
                    case 'grammar':
                        this.grammarChecker.updateText(message.text);
                        break;
                    case 'translation':
                        this.translator.updateText(message.text);
                        break;
                    case 'ai-chat':
                        this.aiChat.updateText(message.text);
                        break;
                }
                sendResponse({ success: true });
            }
            return true;
        });

        // Check for API key on load
        chrome.storage.local.get(['apiKey'], result => {
            if (!result.apiKey) {
                this.showApiKeyPrompt();
            }
        });

        // Load selected text from storage if exists
        chrome.storage.local.get(['selectedText'], result => {
            if (result.selectedText) {
                this.grammarChecker.updateText(result.selectedText);
                chrome.storage.local.remove(['selectedText']);
            }
        });
    }

    initializeSettingsMenu() {
        const settingsButton = document.getElementById('settingsButton');
        const settingsMenu = document.getElementById('settingsMenuDropdown');
        const importSettingsButton = document.getElementById('importSettingsButton');
        const exportSettingsButton = document.getElementById('exportSettingsButton');
        const setApiKeyButton = document.getElementById('setApiKeyButton');
        const importSettingsFile = document.getElementById('importSettingsFile');

        // Toggle settings menu
        settingsButton.addEventListener('click', () => {
            settingsMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!settingsButton.contains(event.target) && !settingsMenu.contains(event.target)) {
                settingsMenu.classList.add('hidden');
            }
        });

        // Import settings
        importSettingsButton.addEventListener('click', () => {
            this.settingsManager.triggerImportDialog();
        });

        // Handle file import
        importSettingsFile.addEventListener('change', async (event) => {
            if (event.target.files.length > 0) {
                try {
                    await this.settingsManager.importSettings(event.target.files[0]);
                    alert('設定がインポートされました。拡張機能を再読み込みしてください。');
                } catch (error) {
                    alert(`設定のインポートに失敗しました: ${error.message}`);
                }
            }
        });

        // Export settings
        exportSettingsButton.addEventListener('click', async () => {
            try {
                await this.settingsManager.exportSettings();
            } catch (error) {
                alert(`設定のエクスポートに失敗しました: ${error.message}`);
            }
        });

        // Set API key
        setApiKeyButton.addEventListener('click', () => {
            this.showApiKeyPrompt();
        });
    }

    showApiKeyPrompt(callback) {
        if (document.querySelector('.api-key-prompt')) {
            const input = document.getElementById('apiKeyInput');
            if (input) {
                input.focus();
            }
            return;
        }

        const container = document.querySelector('.container');
        const prompt = document.createElement('div');
        prompt.className = 'api-key-prompt';
        prompt.innerHTML = `
            <h3>APIキーの設定</h3>
            <p>OpenAI APIキーを入力してください：</p>
            <input type="password" id="apiKeyInput" placeholder="sk-..." />
            <button id="saveApiKey">保存</button>
        `;

        container.prepend(prompt);

        document.getElementById('saveApiKey').addEventListener('click', () => {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            if (apiKey) {
                chrome.storage.local.set({ apiKey }, () => {
                    prompt.remove();
                    if (typeof callback === 'function') {
                        callback(apiKey);
                    }
                });
            }
        });
    }
}

// Initialize the sidebar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
});

async function b(){const a=document.getElementById(r.HISTORY_LIST);document.getElementById(r.HISTORY_CONTAINER);try{chrome.storage.local.get([E.KEYS.HISTORY],v=>{const d=v[E.KEYS.HISTORY]||[];if(d.length===0){a.innerHTML=`<li class="text-gray-500">${S.HISTORY_EMPTY}</li>`;return}a.innerHTML=d.map((n,i)=>`
                <li class="history-item border-b border-gray-200 p-4 hover:bg-gray-50 ${i===0?"selected":""}" data-index="${i}">
                    <div class="flex justify-between items-start">
                        <div class="text-sm text-gray-600">${new Date(n.timestamp).toLocaleString("ja-JP")}</div>
                        <div class="history-actions">
                            <button class="history-copy-btn icon-button" title="修正文をコピー">📋</button>
                            <button class="history-view-original-btn icon-button" title="原文を表示">📄</button>
                            ${n.explanation?'<button class="history-view-explanation-btn icon-button" title="説明を表示">ℹ️</button>':""}
                            ${n.fullResponse?'<button class="history-view-full-btn icon-button" title="完全な応答を表示">👁️</button>':""}
                            <button class="history-delete-btn icon-button" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="mt-2 text-gray-600 corrected-text">${n.correctedText}</div>
                </li>
            `).join(""),a.querySelectorAll(".history-item").forEach(n=>{const i=parseInt(n.getAttribute("data-index"));n.addEventListener("click",m=>{m.target.closest(".history-actions")||(a.querySelectorAll(".history-item").forEach(e=>{e.classList.remove("selected")}),n.classList.add("selected"),document.getElementById(r.INPUT_TEXT).value=d[i].originalText,document.getElementById(r.RESULT).textContent=d[i].correctedText,document.getElementById(r.RESULT_CONTAINER).classList.remove("hidden"))}),n.querySelector(".history-copy-btn").addEventListener("click",m=>{m.stopPropagation(),navigator.clipboard.writeText(d[i].correctedText);const e=m.target,c=e.textContent;e.textContent="✓",setTimeout(()=>{e.textContent=c},1e3)});const I=n.querySelector(".history-view-original-btn");I&&I.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const c=document.createElement("div");c.className="modal-content";const u=document.createElement("div");u.className="modal-header";const h=document.createElement("h3");h.textContent=S.ORIGINAL_TEXT_TITLE;const t=document.createElement("button");t.className="modal-close-btn",t.textContent="✕",t.addEventListener("click",()=>{document.body.removeChild(e)}),u.appendChild(h),u.appendChild(t);const o=document.createElement("div");o.className="modal-body";const s=document.createElement("pre");s.className="original-text-modal",s.textContent=d[i].originalText,o.appendChild(s),c.appendChild(u),c.appendChild(o),e.appendChild(c),document.body.appendChild(e),e.addEventListener("click",p=>{p.target===e&&document.body.removeChild(e)})});const g=n.querySelector(".history-view-explanation-btn");g&&g.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const c=document.createElement("div");c.className="modal-content";const u=document.createElement("div");u.className="modal-header";const h=document.createElement("h3");h.textContent=S.EXPLANATION_TITLE;const t=document.createElement("button");t.className="modal-close-btn",t.textContent="✕",t.addEventListener("click",()=>{document.body.removeChild(e)}),u.appendChild(h),u.appendChild(t);const o=document.createElement("div");o.className="modal-body";const s=document.createElement("pre");s.className="explanation-text-modal",s.textContent=d[i].explanation,o.appendChild(s),c.appendChild(u),c.appendChild(o),e.appendChild(c),document.body.appendChild(e),e.addEventListener("click",p=>{p.target===e&&document.body.removeChild(e)})});const C=n.querySelector(".history-view-full-btn");C&&C.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const c=document.createElement("div");c.className="modal-content";const u=document.createElement("div");u.className="modal-header";const h=document.createElement("h3");h.textContent=S.FULL_RESPONSE_TITLE;const t=document.createElement("button");t.className="modal-close-btn",t.textContent="✕",t.addEventListener("click",()=>{document.body.removeChild(e)}),u.appendChild(h),u.appendChild(t);const o=document.createElement("div");o.className="modal-body";const s=document.createElement("pre");s.className="full-response-text",s.textContent=d[i].fullResponse,o.appendChild(s),c.appendChild(u),c.appendChild(o),e.appendChild(c),document.body.appendChild(e),e.addEventListener("click",p=>{p.target===e&&document.body.removeChild(e)})}),n.querySelector(".history-delete-btn").addEventListener("click",m=>{if(m.stopPropagation(),confirm("この履歴を削除しますか？")){const e=[...d];e.splice(i,1),chrome.storage.local.set({[E.KEYS.HISTORY]:e},()=>{b()})}})})})}catch(v){console.error("Failed to load history:",v),a.innerHTML=`<li class="text-red-500">${S.ERROR_PREFIX}${v.message}</li>`}}chrome.runtime.onMessage.addListener((a,v,d)=>{if(a.action==="updateSidebarText"){const n=document.getElementById(r.INPUT_TEXT),i=document.getElementById(r.RESULT_CONTAINER);if(n){const I=n.value.trim(),g=document.getElementById(r.RESULT);I&&!i.classList.contains("hidden")&&g&&g.textContent&&saveToHistory(I,g.textContent),n.value=a.text,i&&i.classList.add("hidden")}}return!0});document.addEventListener("DOMContentLoaded",()=>{chrome.storage.local.get([L.STORAGE_KEYS.API_KEY],a=>{a[L.STORAGE_KEYS.API_KEY]||_()}),chrome.storage.local.get(["selectedText"],a=>{a.selectedText&&(document.getElementById(r.INPUT_TEXT).value=a.selectedText,chrome.storage.local.remove(["selectedText"]))}),b()});document.addEventListener("DOMContentLoaded",()=>{const a=document.getElementById(r.INPUT_TEXT),v=document.getElementById(r.CHECK_BUTTON),d=document.getElementById(r.CLEAR_BUTTON),n=document.getElementById(r.LOADING_SPINNER),i=document.getElementById(r.RESULT_CONTAINER),I=document.getElementById(r.RESULT),g=document.getElementById(r.COPY_BUTTON),C=document.getElementById(r.CLEAR_HISTORY_BUTTON),m=document.getElementById(r.EXPORT_HISTORY_BUTTON),e=document.getElementById(r.IMPORT_HISTORY_BUTTON),c=document.getElementById(r.IMPORT_HISTORY_FILE);e==null||e.addEventListener("click",()=>{c.click()}),c==null||c.addEventListener("change",t=>{const o=t.target.files[0];if(!o)return;const s=new FileReader;s.onload=p=>{try{const l=JSON.parse(p.target.result);if(!l.history||!Array.isArray(l.history))throw new Error("無効なファイル形式です。");confirm(`${l.history.length}件の履歴をインポートしますか？既存の履歴と統合されます。`)&&chrome.storage.local.get([E.KEYS.HISTORY],y=>{let T=y[E.KEYS.HISTORY]||[];const O=[...l.history,...T],R=[],f=new Set;for(const x of O)f.has(x.timestamp)||(f.add(x.timestamp),R.push(x));R.sort((x,N)=>new Date(N.timestamp)-new Date(x.timestamp)),R.length>E.MAX_HISTORY_ITEMS&&(R.length=E.MAX_HISTORY_ITEMS),chrome.storage.local.set({[E.KEYS.HISTORY]:R},()=>{b(),alert(`${l.history.length}件の履歴をインポートしました。`)})})}catch(l){console.error("Failed to import history:",l),alert(`インポート中にエラーが発生しました: ${l.message}`)}c.value=""},s.readAsText(o)}),m==null||m.addEventListener("click",()=>{try{chrome.storage.local.get([E.KEYS.HISTORY],t=>{const o=t[E.KEYS.HISTORY]||[];if(o.length===0){alert("エクスポートする履歴がありません。");return}const s={exportDate:new Date().toISOString(),history:o},p=JSON.stringify(s,null,2),l=new Blob([p],{type:"application/json"}),y=URL.createObjectURL(l),T=document.createElement("a");T.href=y,T.download=`japanese-grammar-history-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(T),T.click(),document.body.removeChild(T),URL.revokeObjectURL(y)})}catch(t){console.error("Failed to export history:",t),alert(`エクスポート中にエラーが発生しました: ${t.message}`)}}),C==null||C.addEventListener("click",()=>{if(confirm("すべての履歴を削除しますか？"))try{chrome.storage.local.remove([E.KEYS.HISTORY],()=>{b(),alert(S.HISTORY_CLEARED)})}catch(t){console.error("Failed to clear history:",t),alert(`${S.ERROR_PREFIX}${t.message}`)}}),d.addEventListener("click",()=>{a.value="",i.classList.add("hidden"),a.focus()}),a.addEventListener("input",()=>{d.style.display=a.value.length>0?"flex":"none"}),d.style.display="none",g.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(I.textContent),g.classList.add("copied"),setTimeout(()=>{g.classList.remove("copied")},2e3)}catch(t){console.error("Failed to copy text:",t)}}),v.addEventListener("click",async()=>{if(!a.value.trim()){alert(S.EMPTY_INPUT);return}chrome.storage.local.get([L.STORAGE_KEYS.API_KEY],async t=>{const o=t[L.STORAGE_KEYS.API_KEY];if(!o){alert(S.API_KEY_MISSING),_(s=>{h(s,a.value)});return}h(o,a.value)})});function u(t,o,s="",p=""){try{chrome.storage.local.get([E.KEYS.HISTORY],l=>{const y=l[E.KEYS.HISTORY]||[];y.unshift({timestamp:new Date().toISOString(),originalText:t,correctedText:o,fullResponse:s||o,explanation:p}),y.length>E.MAX_HISTORY_ITEMS&&(y.length=E.MAX_HISTORY_ITEMS),chrome.storage.local.set({[E.KEYS.HISTORY]:y},()=>{b()})})}catch(l){console.error("Failed to save to history:",l)}}async function h(t,o){n.classList.remove("hidden"),i.classList.add("hidden"),I.textContent="";try{const p=await(await fetch(L.API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({...L.MODEL_CONFIG,messages:[{role:"system",content:Y.GRAMMAR_CHECK},{role:"user",content:o}]})})).json();if(p.error)throw new Error(p.error.message);const l=p.choices[0].message.content;let y=l;const T=l.match(/```修正\n([\s\S]*?)\n```/);T&&T[1]&&(y=T[1].trim());const O=l.match(/```説明\n([\s\S]*?)\n```/),R=O&&O[1]?O[1].trim():"";I.textContent=y,i.classList.remove("hidden"),u(o,y,l,R),setTimeout(()=>{const f=document.querySelector(".history-item");f&&(f.classList.add("selected"),document.getElementById(r.RESULT).textContent=y,document.getElementById(r.RESULT_CONTAINER).classList.remove("hidden"))},100)}catch(s){I.textContent=`${S.ERROR_PREFIX}${s.message}`,i.classList.remove("hidden")}finally{n.classList.add("hidden")}}});

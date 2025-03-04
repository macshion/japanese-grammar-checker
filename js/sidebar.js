import{A as S,U as r,S as E,a as g,b as f}from"./config.js";document.addEventListener("DOMContentLoaded",()=>{chrome.storage.local.get([S.STORAGE_KEYS.API_KEY],c=>{c[S.STORAGE_KEYS.API_KEY]||_()}),chrome.storage.local.get(["selectedText"],c=>{c.selectedText&&(document.getElementById(r.INPUT_TEXT).value=c.selectedText,chrome.storage.local.remove(["selectedText"]))}),C()});function _(){const c=document.querySelector(".container"),h=document.createElement("div");h.className="api-key-prompt",h.innerHTML=`
        <h3>APIキーの設定</h3>
        <p>OpenAI APIキーを入力してください：</p>
        <input type="password" id="apiKeyInput" placeholder="sk-..." />
        <button id="saveApiKey">保存</button>
    `,c.prepend(h),document.getElementById("saveApiKey").addEventListener("click",()=>{const l=document.getElementById("apiKeyInput").value.trim();l&&chrome.storage.local.set({[S.STORAGE_KEYS.API_KEY]:l},()=>{h.remove()})})}async function C(){const c=document.getElementById(r.HISTORY_LIST);document.getElementById(r.HISTORY_CONTAINER);try{chrome.storage.local.get([E.KEYS.HISTORY],h=>{const l=h[E.KEYS.HISTORY]||[];if(l.length===0){c.innerHTML=`<li class="text-gray-500">${g.HISTORY_EMPTY}</li>`;return}c.innerHTML=l.map((i,p)=>`
                <li class="history-item border-b border-gray-200 p-4 hover:bg-gray-50 ${p===0?"selected":""}" data-index="${p}">
                    <div class="flex justify-between items-start">
                        <div class="text-sm text-gray-600">${new Date(i.timestamp).toLocaleString("ja-JP")}</div>
                        <div class="history-actions">
                            <button class="history-copy-btn icon-button" title="修正文をコピー">📋</button>
                            <button class="history-view-original-btn icon-button" title="原文を表示">📄</button>
                            ${i.explanation?'<button class="history-view-explanation-btn icon-button" title="説明を表示">ℹ️</button>':""}
                            ${i.fullResponse?'<button class="history-view-full-btn icon-button" title="完全な応答を表示">👁️</button>':""}
                            <button class="history-delete-btn icon-button" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="mt-2 text-gray-600 corrected-text">${i.correctedText}</div>
                </li>
            `).join(""),c.querySelectorAll(".history-item").forEach(i=>{const p=parseInt(i.getAttribute("data-index"));i.addEventListener("click",m=>{m.target.closest(".history-actions")||(c.querySelectorAll(".history-item").forEach(e=>{e.classList.remove("selected")}),i.classList.add("selected"),document.getElementById(r.INPUT_TEXT).value=l[p].originalText,document.getElementById(r.RESULT).textContent=l[p].correctedText,document.getElementById(r.RESULT_CONTAINER).classList.remove("hidden"))}),i.querySelector(".history-copy-btn").addEventListener("click",m=>{m.stopPropagation(),navigator.clipboard.writeText(l[p].correctedText);const e=m.target,n=e.textContent;e.textContent="✓",setTimeout(()=>{e.textContent=n},1e3)});const x=i.querySelector(".history-view-original-btn");x&&x.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const n=document.createElement("div");n.className="modal-content";const t=document.createElement("div");t.className="modal-header";const d=document.createElement("h3");d.textContent=g.ORIGINAL_TEXT_TITLE;const a=document.createElement("button");a.className="modal-close-btn",a.textContent="✕",a.addEventListener("click",()=>{document.body.removeChild(e)}),t.appendChild(d),t.appendChild(a);const s=document.createElement("div");s.className="modal-body";const o=document.createElement("pre");o.className="original-text-modal",o.textContent=l[p].originalText,s.appendChild(o),n.appendChild(t),n.appendChild(s),e.appendChild(n),document.body.appendChild(e),e.addEventListener("click",u=>{u.target===e&&document.body.removeChild(e)})});const v=i.querySelector(".history-view-explanation-btn");v&&v.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const n=document.createElement("div");n.className="modal-content";const t=document.createElement("div");t.className="modal-header";const d=document.createElement("h3");d.textContent=g.EXPLANATION_TITLE;const a=document.createElement("button");a.className="modal-close-btn",a.textContent="✕",a.addEventListener("click",()=>{document.body.removeChild(e)}),t.appendChild(d),t.appendChild(a);const s=document.createElement("div");s.className="modal-body";const o=document.createElement("pre");o.className="explanation-text-modal",o.textContent=l[p].explanation,s.appendChild(o),n.appendChild(t),n.appendChild(s),e.appendChild(n),document.body.appendChild(e),e.addEventListener("click",u=>{u.target===e&&document.body.removeChild(e)})});const R=i.querySelector(".history-view-full-btn");R&&R.addEventListener("click",m=>{m.stopPropagation();const e=document.createElement("div");e.className="modal-overlay";const n=document.createElement("div");n.className="modal-content";const t=document.createElement("div");t.className="modal-header";const d=document.createElement("h3");d.textContent=g.FULL_RESPONSE_TITLE;const a=document.createElement("button");a.className="modal-close-btn",a.textContent="✕",a.addEventListener("click",()=>{document.body.removeChild(e)}),t.appendChild(d),t.appendChild(a);const s=document.createElement("div");s.className="modal-body";const o=document.createElement("pre");o.className="full-response-text",o.textContent=l[p].fullResponse,s.appendChild(o),n.appendChild(t),n.appendChild(s),e.appendChild(n),document.body.appendChild(e),e.addEventListener("click",u=>{u.target===e&&document.body.removeChild(e)})}),i.querySelector(".history-delete-btn").addEventListener("click",m=>{if(m.stopPropagation(),confirm("この履歴を削除しますか？")){const e=[...l];e.splice(p,1),chrome.storage.local.set({[E.KEYS.HISTORY]:e},()=>{C()})}})})})}catch(h){console.error("Failed to load history:",h),c.innerHTML=`<li class="text-red-500">${g.ERROR_PREFIX}${h.message}</li>`}}document.addEventListener("DOMContentLoaded",()=>{const c=document.getElementById(r.INPUT_TEXT),h=document.getElementById(r.CHECK_BUTTON),l=document.getElementById(r.CLEAR_BUTTON),i=document.getElementById(r.LOADING_SPINNER),p=document.getElementById(r.RESULT_CONTAINER),x=document.getElementById(r.RESULT),v=document.getElementById(r.COPY_BUTTON),R=document.getElementById(r.CLEAR_HISTORY_BUTTON),m=document.getElementById(r.EXPORT_HISTORY_BUTTON),e=document.getElementById(r.IMPORT_HISTORY_BUTTON),n=document.getElementById(r.IMPORT_HISTORY_FILE);e==null||e.addEventListener("click",()=>{n.click()}),n==null||n.addEventListener("change",t=>{const d=t.target.files[0];if(!d)return;const a=new FileReader;a.onload=s=>{try{const o=JSON.parse(s.target.result);if(!o.history||!Array.isArray(o.history))throw new Error("無効なファイル形式です。");confirm(`${o.history.length}件の履歴をインポートしますか？既存の履歴と統合されます。`)&&chrome.storage.local.get([E.KEYS.HISTORY],u=>{let y=u[E.KEYS.HISTORY]||[];const O=[...o.history,...y],I=[],L=new Set;for(const T of O)L.has(T.timestamp)||(L.add(T.timestamp),I.push(T));I.sort((T,b)=>new Date(b.timestamp)-new Date(T.timestamp)),I.length>E.MAX_HISTORY_ITEMS&&(I.length=E.MAX_HISTORY_ITEMS),chrome.storage.local.set({[E.KEYS.HISTORY]:I},()=>{C(),alert(`${o.history.length}件の履歴をインポートしました。`)})})}catch(o){console.error("Failed to import history:",o),alert(`インポート中にエラーが発生しました: ${o.message}`)}n.value=""},a.readAsText(d)}),m==null||m.addEventListener("click",()=>{try{chrome.storage.local.get([E.KEYS.HISTORY],t=>{const d=t[E.KEYS.HISTORY]||[];if(d.length===0){alert("エクスポートする履歴がありません。");return}const a={exportDate:new Date().toISOString(),history:d},s=JSON.stringify(a,null,2),o=new Blob([s],{type:"application/json"}),u=URL.createObjectURL(o),y=document.createElement("a");y.href=u,y.download=`japanese-grammar-history-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(y),y.click(),document.body.removeChild(y),URL.revokeObjectURL(u)})}catch(t){console.error("Failed to export history:",t),alert(`エクスポート中にエラーが発生しました: ${t.message}`)}}),R==null||R.addEventListener("click",()=>{if(confirm("すべての履歴を削除しますか？"))try{chrome.storage.local.remove([E.KEYS.HISTORY],()=>{C(),alert(g.HISTORY_CLEARED)})}catch(t){console.error("Failed to clear history:",t),alert(`${g.ERROR_PREFIX}${t.message}`)}}),l.addEventListener("click",()=>{c.value="",p.classList.add("hidden"),c.focus()}),c.addEventListener("input",()=>{l.style.display=c.value.length>0?"flex":"none"}),l.style.display="none",v.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(x.textContent),v.classList.add("copied"),setTimeout(()=>{v.classList.remove("copied")},2e3)}catch(t){console.error("Failed to copy text:",t)}}),h.addEventListener("click",async()=>{if(!c.value.trim()){alert(g.EMPTY_INPUT);return}chrome.storage.local.get([S.STORAGE_KEYS.API_KEY],async t=>{const d=t[S.STORAGE_KEYS.API_KEY];if(!d){alert(g.API_KEY_MISSING),_();return}i.classList.remove("hidden"),p.classList.add("hidden"),t.textContent="";try{const s=await(await fetch(S.API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d}`},body:JSON.stringify({...S.MODEL_CONFIG,messages:[{role:"system",content:f.GRAMMAR_CHECK},{role:"user",content:c.value}]})})).json();if(s.error)throw new Error(s.error.message);const o=s.choices[0].message.content;let u=o;const y=o.match(/```修正\n([\s\S]*?)\n```/);y&&y[1]&&(u=y[1].trim());const O=o.match(/```説明\n([\s\S]*?)\n```/),I=O&&O[1]?O[1].trim():"";t.textContent=u,p.classList.remove("hidden");try{chrome.storage.local.get([E.KEYS.HISTORY],L=>{const T=L[E.KEYS.HISTORY]||[];T.unshift({timestamp:new Date().toISOString(),originalText:c.value,correctedText:u,fullResponse:o,explanation:I}),T.length>E.MAX_HISTORY_ITEMS&&(T.length=E.MAX_HISTORY_ITEMS),chrome.storage.local.set({[E.KEYS.HISTORY]:T},()=>{C(),setTimeout(()=>{const b=document.querySelector(".history-item");b&&(b.classList.add("selected"),document.getElementById(r.RESULT).textContent=T[0].correctedText,document.getElementById(r.RESULT_CONTAINER).classList.remove("hidden"))},100)})})}catch(L){console.error("Failed to save to history:",L)}}catch(a){t.textContent=`${g.ERROR_PREFIX}${a.message}`,p.classList.remove("hidden")}finally{i.classList.add("hidden")}})})});

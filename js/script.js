"use strict";

// 設定
const STORAGE_KEY = "sleepLogs_v1";

// 状態（配列）
let logs = [];

// DOM取得
const $date = document.getElementById("date");
const $bed = document.getElementById("bedTime");
const $wake = document.getElementById("wakeTime");
const $quality = document.getElementById("quality");
const $memo = document.getElementById("memo");
const $addBtn = document.getElementById("addBtn");
const $msg = document.getElementById("msg");
const $list = document.getElementById("list");
const $count = document.getElementById("count");
const $empty = document.getElementById("empty");

// ユーティリティ

function makeId() {
  // UUIDが使えない環境対応
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function calcDurationMin(bedTime, wakeTime) {
  let diff = toMinutes(wakeTime) - toMinutes(bedTime);
  if (diff <= 0) diff += 24 * 60; // 日付またぎ対応
  return diff;
}

function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m}分`;
}

//localStorage
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function load() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  logs = JSON.parse(data);
}

//表示処理（関数）
function render() {
  $list.innerHTML = "";

  $count.textContent = logs.length;
  $empty.style.display = logs.length === 0 ? "block" : "none";

  logs.forEach((log) => {
    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="item-top">
        <div>
          <strong>${log.date}</strong>
          <span class="badge">${formatDuration(log.durationMin)}</span>
        </div>
        <button class="del">削除</button>
      </div>
      <div class="meta">
        <span>就寝：${log.bedTime}</span>
        <span>起床：${log.wakeTime}</span>
        <span>質：${log.quality}/5</span>
      </div>
      <div class="memo">メモ：${log.memo || "なし"}</div>
    `;

    li.querySelector(".del").addEventListener("click", () => {
      removeLog(log.id);
    });

    $list.appendChild(li);
  });
}

//追加・削除
function addLog() {
  console.log("追加ボタンが押されました");
  $msg.textContent = "";

  const date = $date.value;
  const bedTime = $bed.value;
  const wakeTime = $wake.value;
  const quality = $quality.value;
  const memo = $memo.value;

  // 空入力チェック（標準チェックリスト対応）
  if (!date || !bedTime || !wakeTime) {
    $msg.textContent = "日付・就寝時刻・起床時刻は必須です";
    return;
  }

  const log = {
    id: makeId(),
    date,
    bedTime,
    wakeTime,
    quality,
    memo,
    durationMin: calcDurationMin(bedTime, wakeTime),
  };

  logs.push(log);           // 配列に追加
  console.log(logs);        // チェックリスト用

  save();                   // localStorage保存
  render();                 // 再表示

  // 入力欄リセット
  $date.value = "";
  $bed.value = "";
  $wake.value = "";
  $memo.value = "";
}

// 削除 
function removeLog(id) {
  logs = logs.filter((log) => log.id !== id);
  save();
  render();
}

//起動処理
function init() {
  $date.value = todayISO(); // 日付自動入力
  load();                   // 保存データ取得
  render();                 // 初期表示
}

//イベント
$addBtn.addEventListener("click", addLog);

// 起動
init();

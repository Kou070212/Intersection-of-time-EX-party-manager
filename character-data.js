/* キャラクター・属性・シーズン設定
   実データに置き換えるときは、下の characters を編集してください。 */
const ELEMENTS = {
  "火炎": { icon: "🔥", color: "#df5a43" },
  "氷":   { icon: "❄️", color: "#398fe0" },
  "風":   { icon: "🌪️", color: "#36a58b" },
  "大地": { icon: "🪨", color: "#a87a42" },
  "雷":   { icon: "⚡️", color: "#d7a52c" },
  "物理": { icon: "⚔️", color: "#73819a" },
  "暗黒": { icon: "✡️", color: "#7557b8" },
  "神聖": { icon: "✴️", color: "#d0a642" }
};

const SEASONS = [
  {
    id: "season-1",
    name: "シーズン1",
    specialCharacterIds: [
      "char-023",
      "char-028",
      "char-009",
      "char-024"
    ]
  },
  /*{
    id: "season-2",
    name: "シーズン2",
    specialCharacterIds: [
      "char-001",
      "char-005",
      "char-010",
      "char-015"
    ]
  }*/
];


const characters = [
  { id:"char-001", parentId:"char-001", name:"トリスタン", image: "images/character001.png", elements:["火炎","火炎","風"] },
  { id:"char-002", parentId:"char-002", name:"ティオレー", image: "images/character002.png", symbol:"02", elements:["火炎","火炎","大地"] },
  { id:"char-003", parentId:"char-003", name:"ドレドリン", image: "images/character003.png", symbol:"03", elements:["大地","物理","神聖"] },
  { id:"char-004", parentId:"char-004", name:"ハウザー", image: "images/character004.png", symbol:"04", elements:["風","風","風"] },
  { id:"char-005", parentId:"char-005", name:"メリオダス", image: "images/character005.png", symbol:"05", elements:["暗黒","暗黒","暗黒"] },
  { id:"char-006", parentId:"char-006", name:"ギルサンダー", image: "images/character006.png", symbol:"06", elements:["雷","雷","雷"] },
  { id:"char-007", parentId:"char-007", name:"マーリン", image: "images/character007.png", symbol:"07", elements:["氷","雷","火炎"] },
  { id:"char-008", parentId:"char-008", name:"ゴウセル", image: "images/character008.png", symbol:"08", elements:["雷","物理","雷"] },
  { id:"char-009", parentId:"char-009", name:"エレイン", image: "images/character009.png", symbol:"09", elements:["風","神聖","大地"] },
  { id:"char-010", parentId:"char-010", name:"キング", image: "images/character010.png", symbol:"10", elements:["神聖","物理","大地"] },
  { id:"char-011", parentId:"char-011", name:"ドレファス", image: "images/character011.png", symbol:"11", elements:["物理","大地","神聖"] },
  { id:"char-012", parentId:"char-012", name:"ヘンドリクセン", image: "images/character012.png", symbol:"12", elements:["神聖","物理","暗黒"] },
  { id:"char-013", parentId:"char-013", name:"スレイダー", image: "images/character013.png", symbol:"13", elements:["物理","物理","物理"] },
  { id:"char-014", parentId:"char-014", name:"グリアモール", image: "images/character014.png", symbol:"14", elements:["物理","物理","物理"] },
  { id:"char-015", parentId:"char-015", name:"バグ", image: "images/character015.png", symbol:"15", elements:["暗黒","暗黒","暗黒"] },
  { id:"char-016", parentId:"char-016", name:"ジェリコ", image: "images/character016.png", symbol:"16", elements:["氷","氷","氷"] },
  { id:"char-017", parentId:"char-017", name:"エリザベス", image: "images/character017.png", symbol:"17", elements:["神聖","風","大地"] },
  { id:"char-018", parentId:"char-018", name:"ギーラ", image: "images/character018.png", symbol:"18", elements:["火炎","火炎","火炎"] },
  { id:"char-019", parentId:"char-019", name:"ディアンヌ", image: "images/character019.png", symbol:"19", elements:["大地","大地","大地"] },
  { id:"char-020", parentId:"char-020", name:"デリエリ", image: "images/character020.png", symbol:"20", elements:["暗黒","火炎","暗黒"] },
  { id:"char-021", parentId:"char-021", name:"バン", image: "images/character021.png", symbol:"21", elements:["物理","大地","暗黒"] },
  { id:"char-022", parentId:"char-022", name:"エスカノール", image: "images/character022.png", symbol:"22", elements:["火炎","神聖","火炎"] },
  { id:"char-023", parentId:"char-023", name:"ランスッロット", image: "images/character023.png", symbol:"23", elements:["神聖","物理","大地"] },
  { id:"char-024", parentId:"char-024", name:"マニー", image: "images/character024.png", symbol:"24", elements:["神聖","氷","氷"] },
  { id:"char-025", parentId:"char-025", name:"ドレイク", image: "images/character025.png", symbol:"25]", elements:["雷","雷","雷"] },
  { id:"char-026]", parentId:"char-026", name:"クロト", image: "images/character026.png", symbol:"26]", elements:["風","氷","風"] },
  { id:"char-027", parentId:"char-027", name:"デイジー", image: "images/character027.png", symbol:"27", elements:["大地","雷","風"] },
  { id:"char-028", parentId:"char-028", name:"カラー", image: "images/character028.png", symbol:"28", elements:["風","風","大地"] }
];


// ここも必要に応じて編集してください。
const stages = [
  { id:1, advantages:["火炎","暗黒"],enemy: "聖騎士マルマス", description:"エリア1" },
  { id:2, advantages:["物理","氷"], enemy: "赤き魔神・灰色の魔神", description:"エリア2" },
  { id:3, advantages:["物理","火炎"], enemy: "<不気味な牙>", description:"エリア3" },
  { id:4, advantages:["氷","神聖"], enemy: "古竜(エンシェント・ドラゴン)", description:"エリア4" },
  { id:5, advantages:["風","大地"], enemy: "「無欲」のフラウドリン", description:"エリア5" },
  { id:6, advantages:["雷","神聖"], enemy: "<七つの大罪>ディアンヌ", description:"エリア6" },
  { id:7, advantages:["火炎","氷"], enemy: "ジェムストーン・ゴーレム\n生命のクリスタルゴーレム", description:"エリア7" },
  { id:8, advantages:["大地","暗黒"], enemy: "魔神ヘンドリクセン", description:"エリア8" },
  { id:9, advantages:["雷","大地"], enemy: "猛毒ヒキガエルモルボグ", description:"エリア9" },
  { id:10, advantages:["物理","雷"], enemy: "スコーピ・ビースト", description:"エリア10" },
  { id:11, advantages:["風","神聖"], enemy: "聖騎士見習いツイーゴ", description:"エリア11" },
  { id:12, advantages:["風","暗黒"], enemy: "<七つの災い>バレンティ", description:"エリア12" }
];


const effectNames = {
    'バスターアップ': 'Busterカード性能アップ',
    'バスターアップ：水辺': 'Busterカード性能アップ',
    'バスターアップ：千年城': '〔千年城〕 Busterカード性能アップ',
    'アーツアップ': 'Artsカード性能アップ',
    'アーツアップ：水辺または都市': 'Artsカード性能アップ',
    'アーツアップ：千年城': '〔千年城〕 Artsカード性能アップ',
    'クイックアップ': 'Quickカード性能アップ',
    'クイックアップ：千年城': '〔千年城〕 Quickカード性能アップ',
    'Extra Attackアップ': 'Extraカード性能アップ',
    'アタックプラス': '与ダメージプラス',
    'スター発生アップ': 'スター発生率アップ',
    'スター発生アップ：男性': 'スター発生率アップ',
    'クリティカル発生アップ': 'クリティカル発生率アップ',
    'スター発生ダウン': 'スター発生率ダウン',
    'クリティカル発生ダウン': 'クリティカル発生率ダウン',
    'スター集中アップ': 'スター集中度アップ',
    'スター集中アップ：Buster': 'Busterカードのスター集中度アップ',
    'スター集中アップ：Arts': 'Artsカードのスター集中度アップ',
    'スター集中アップ：Quick': 'Quickカードのスター集中度アップ',
    'スター集中ダウン': 'スター集中度ダウン',
    'クリティカル威力アップ：Buster': 'Busterカードのクリティカル威力アップ',
    'クリティカル威力アップ：Arts': 'Artsカードのクリティカル威力アップ',
    'クリティカル威力アップ：Quick': 'Quickカードのクリティカル威力アップ',
    'ダメージカット': '被ダメージカット',
    'ダメージプラス': '与ダメージプラス',
    '被ダメージプラス': 'ダメージアップ',
    'ヒット数アップ': '攻撃回数',
    '即死': '即死効果',
    '即死付与率アップ': '即死付与成功率アップ',
    'バスター耐性ダウン': 'Busterカード耐性ダウン',
    'アーツ耐性ダウン': 'Artsカード耐性ダウン',
    'クイック耐性ダウン': 'Quickカード耐性ダウン',
    '強化付与アップ': '強化付与成功率アップ',
    '弱体付与アップ': '弱体付与成功率アップ',
    '精神異常付与アップ': '精神異常付与成功率アップ',
    'NP獲得アップ': 'NP獲得量アップ',
    '毒': '毒（毎ターンHP）減少',
    '蝕毒': '毒の効果量アップ',
    '呪い': '呪い（毎ターンHP）減少',
    '呪厄': '呪いの効果量アップ',
    'やけど': 'やけど（毎ターンHP）減少',
    'やけど(自己・非重複)': 'やけど（毎ターンHP）減少',
    '延焼': 'やけどの効果量アップ',
    'やけど無効': 'やけど無効状態',
    '魅了': '魅了（行動不能）',
    '石化': '石化（行動不能）',
    '拘束': '拘束（行動不能）',
    'スタン': 'スタン（行動不能）',
    '恐怖': '毎ターン終了時 恐怖（行動不能）',
    '混乱': '毎ターン終了時 混乱（スキル封印）',
    '特性付与〔竜〕': '〔竜〕特性追加',
    '最大HPプラス': '最大HP増加',
    '防御無視': '防御無視状態',
    'HP回復量アップ': 'HP回復効果量アップ',
    'スキルターン減少': 'スキルチャージ短縮',
    '威力アップ・対超巨大エネミー': '〔超巨大〕威力アップ',
    'ガッツ時発動': 'ガッツ発動時',
    '被ダメージ時発動': '被ダメージ時',
    '被ダメージ時NP獲得アップ': '被ダメージ時NP獲得量アップ',
    'チャージ減少：対魔性': 'チャージ減少',

    '悪特性付与': '〔悪〕特性付与',
    '善特性付与': '〔善〕特性付与',
    '竜特性付与': '〔竜〕特性付与',
    '猛獣特性付与': '〔猛獣〕特性付与',
    '死霊特性付与': '〔死霊〕特性付与',
   
    '攻撃力アップ：神性': '攻撃力アップ',
    'オーバーチャージ段階UP': 'オーバーチャージ段階',

    'NiceShot!': '防御力ダウン',
    '投擲／回収': '毎ターンスター獲得',
    '毎ターンスター獲得〔陽射し〕': '毎ターンスター獲得',
    'クリティカル威力アップ〔陽射し〕': 'クリティカル威力アップ',

    '威力アップ・対天地サーヴァント': '威力アップ・対天と地のサーヴァント',

    '攻撃力アップ〔対セイバー〕': '対セイバー攻撃力アップ',
    '攻撃力アップ〔対アーチャー〕': '対アーチャー攻撃力アップ',
    '攻撃力アップ〔対ランサー〕': '対ランサー攻撃力アップ',
    '攻撃力アップ〔対ライダー〕': '対ライダー攻撃力アップ',
    '攻撃力アップ〔対キャスター〕': '対キャスター攻撃力アップ',
    '攻撃力アップ〔対アサシン〕': '対アサシン攻撃力アップ',
    '攻撃力アップ〔対バーサーカー〕': '対バーサーカー攻撃力アップ',
    '攻撃力アップ〔対ルーラー〕': '対ルーラー攻撃力アップ',
    '攻撃力アップ〔対アヴェンジャー〕': '対アヴェンジャー攻撃力アップ',
    '攻撃力アップ〔対アルターエゴ〕': '対アルターエゴ攻撃力アップ',
    '攻撃力アップ〔対フォーリナー〕': '対フォーリナー攻撃力アップ',
    '攻撃力アップ〔対ムーンキャンサー〕': '対ムーンキャンサー攻撃力アップ',
    '攻撃力アップ〔対プリテンダー〕': '対プリテンダー攻撃力アップ',
    '攻撃力アップ〔対ビースト〕': '対ビースト攻撃力アップ',
    '攻撃力アップ〔対エクストラクラス〕': '対エクストラクラス攻撃力アップ',

    '被クリティカル発生耐性アップ〔対セイバー〕': 'セイバーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アーチャー〕': 'アーチャーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ランサー〕': 'ランサーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ライダー〕': 'ライダーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対キャスター〕': 'キャスターからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アサシン〕': 'アサシンからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対バーサーカー〕': 'バーサーカーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ルーラー〕': 'ルーラーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アヴェンジャー〕': 'アヴェンジャーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アルターエゴ〕': 'アルターエゴからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対フォーリナー〕': 'フォーリナーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ムーンキャンサー〕': 'ムーンキャンサーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対プリテンダー〕': 'プリテンダーからのークリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ビースト〕': 'ビーストからのークリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対エクストラクラス〕': 'エクストラクラスからのクリティカル発生耐性アップ',

    'タゲ集中アップ': 'ターゲット集中',
}

module.exports = {
    effectNames
}
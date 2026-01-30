#!/bin/bash

# ==========================================
# WoodyFun 藍新金流環境設定與部署腳本
# ==========================================

echo "🚀 開始設定 Firebase Secrets..."

# 1. 設定測試環境 Key (執行時會提示你輸入數值)
firebase functions:secrets:set TEST_HASH_KEY
firebase functions:secrets:set TEST_HASH_IV
firebase functions:secrets:set TEST_MERCHANT_ID

# 2. 設定正式環境 Key (若已設定過可註解掉)
# firebase functions:secrets:set NEWEBPAY_HASH_KEY
# firebase functions:secrets:set NEWEBPAY_HASH_IV
# firebase functions:secrets:set NEWEBPAY_MERCHANT_ID

echo "✅ Secrets 設定完成！"

echo "📦 正在部署 Firebase Functions..."

# 3. 執行部署指令
firebase deploy --only functions

echo "🎉 部署完成！"
@echo off
chcp 65001
cls
:: ==========================================
:: WoodyFun 藍新金流 [正式環境] 快速部署腳本
:: ==========================================

:: 1. 進入專案根目錄
cd /d D:\Woodyfun\woodyfun-shop

echo.
echo [1/2] 正在切換至 Firebase 專案 (woodyfun-official)...
call firebase use woodyfun-official

echo.
echo [2/2] 正在自動寫入正式環境金鑰...

:: 使用 pipe 自動將您的金鑰傳送給 Firebase，無需手動輸入
echo y4VruhR6gUmMkTskrjhKfQzwMXjFFekC| firebase functions:secrets:set NEWEBPAY_HASH_KEY
echo Ps8veSSs1stEdf8C| firebase functions:secrets:set NEWEBPAY_HASH_IV
echo MS1812982970| firebase functions:secrets:set NEWEBPAY_MERCHANT_ID

echo.
echo [3/3] 正在部署雲端函數 (去除測試環境邏輯)...
call firebase deploy --only functions

echo.
echo 🎉 部署完成！您的網站現在已正式連接至藍新金流。
pause
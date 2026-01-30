@echo off
cd /d D:\Woodyfun\woodyfun-shop
echo [Step 1] Switching to Firebase Project...
call firebase use woodyfun-official

echo [Step 2] Setting Firebase Secrets...
:: 這裡執行時，系統會停下來要求您輸入對應的值
call firebase functions:secrets:set TEST_HASH_KEY
call firebase functions:secrets:set TEST_HASH_IV
call firebase functions:secrets:set TEST_MERCHANT_ID

echo [Step 3] Deploying Functions...
call firebase deploy --only functions

echo 🎉 Done!
pause
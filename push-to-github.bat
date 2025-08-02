@echo off
echo.
echo GitHub Personal Access Token Push Script
echo ========================================
echo.
echo Please follow these steps:
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Give it a name like "gpt-relay-deploy"
echo 4. Select the "repo" scope (full control of private repositories)
echo 5. Generate the token and copy it
echo.
set /p USERNAME="Enter your GitHub username: "
set /p TOKEN="Paste your Personal Access Token: "
echo.
echo Pushing to GitHub...
git push https://%USERNAME%:%TOKEN%@github.com/FullUproar/fugly-dev-magic.git master
echo.
if %ERRORLEVEL% == 0 (
    echo Success! Code pushed to GitHub.
    echo.
    echo Next steps:
    echo 1. Run 'npx vercel' to deploy
    echo 2. Follow the Vercel prompts
    echo 3. Share the deployment URL when ready
) else (
    echo Error pushing to GitHub. Please check your credentials and try again.
)
pause
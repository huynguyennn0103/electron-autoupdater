window.api.logger(1)
const asyncErrorButton = document.getElementById('asyncErrorBtn')
const syncErrorButton = document.getElementById('syncErrorBtn')
const showItemInFolderButton = document.getElementById('showItemInFolderBtn')
const showTextFileButton = document.getElementById('openTextFileBtn')
const showExternalLinkButton = document.getElementById('openExternalLinkBtn')
const showZaloButton = document.getElementById('openZaloBtn')
const showMsTeamsButton = document.getElementById('openMsTeamsBtn')
const showTNMNDFromFileButton = document.getElementById('openTNMNDWithExecFileBtn')
const showTNMDNFromDeeplink = document.getElementById('openTNMNDWithDeeplinkBtn')
const showTextFileWithChildProcessButton = document.getElementById('openTextFileWithChildProcessBtn')

asyncErrorButton.addEventListener('click', function(){
    window.api.sendAsyncError();
})
syncErrorButton.addEventListener('click', function(){
    window.api.sendSyncError();
})
showItemInFolderButton.addEventListener('click', function(){
    window.api.openItemInFolder();
})
showTextFileButton.addEventListener('click', function(){
    window.api.openTextFile();
})
showExternalLinkButton.addEventListener('click', function(){
    window.api.openExternalLink();
})
showZaloButton.addEventListener('click', function(){
    window.api.openZaloApp();
})
showMsTeamsButton.addEventListener('click', function(){
    window.api.openMsTeams();
})
showTNMNDFromFileButton.addEventListener('click', function(){
    window.api.openTNMNDFromFile();
})
showTNMDNFromDeeplink.addEventListener('click', function(){
    window.api.openTNMNDFromDeeplink();
})
window.api.onAsyncReplyError()
window.api.onSyncReplyError()

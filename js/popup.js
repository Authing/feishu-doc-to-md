function sendMessageToContentScript(message, callback)
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
  {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response)
    {
      if(callback) callback(response);
    });
  });
}
document.getElementById('copyMD').addEventListener('click', function(ev) {

  sendMessageToContentScript({cmd:'test', value:'你好，我是popup！'}, function(response)
  {
    console.log('来自content的回复：'+response);

  });
})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  document.getElementById('md').value = request.md
  let text = document.getElementById('md');

  text.select(); // 选择对象
  // alert(md)
  document.execCommand('Copy')
  alert('Copied to clipboard. Can be pasted.')

});
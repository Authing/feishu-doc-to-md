chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
  if (request.cmd == 'test') {
    let md = '';
    let doc = document.getElementById('innerdocbody');
    let blocks = doc.getElementsByClassName('ace-line');
    let status = 'not_in_code';
    for (let i = 0; i < blocks.length; i++) {
      setTimeout(() => {
        blocks[i].scrollIntoView();
        let classArr = Array.prototype.slice.call(blocks[i].classList);
        let type = 'text';
        let h = '1';
        let heading = classArr.find(v => /heading-h(\d)/.test(v));

        if (classArr.find(v => /list-code/.test(v))) {
          type = 'code';
          if (status === 'not_in_code') {
            md += '```\n' + blocks[i].innerText + '\n';
          } else {
            md += blocks[i].innerText + '\n';
          }
          status = 'in_code';
        } else {
          if (status === 'in_code') {
            md += '```\n';
          }
          status = 'not_in_code';
        }
        if (heading) {
          h = /heading-h(\d)/.exec(heading)[1];
          type = 'heading';
          md += '\n' + generateHeading(Number(h)) + ' ' + blocks[i].innerText + '\n\n';
        }
        if (classArr.find(v => /single-line/.test(v))) {
          type = 'image';
          let img = blocks[i].querySelector('[data-ace-gallery-json]');
          let jsonStr = img.dataset.aceGalleryJson;
          let obj = JSON.parse(jsonStr);
          let imgUrl = unescape(obj.items[0].src);
          md += generateImage(imgUrl) + '\n\n';
        }
        if (type === 'text') {
          let words = blocks[i].getElementsByTagName('span');
          md += '\n\n';
          for (let j = 0; j < words.length; j++) {
            let classArr = Array.prototype.slice.call(words[j].classList);
            if (classArr.includes('b') && classArr.includes('i')) {
              md += '***' + words[j].innerText + '***';
            } else if (classArr.includes('i')) {
              md += '*' + words[j].innerText + '*';
            } else if (classArr.includes('b')) {
              md += '**' + words[j].innerText + '**';
            } else {
              md += words[j].innerText;
            }
          }
          md += '\n\n';
          // md += blocks[i].innerText + '\n\n';
        }
        if (i === blocks.length - 1) {
          handleCopy(md);
        }
      }, 50 * i);
    }
  }
});
function handleCopy(md) {
  let rand = Math.random()
    .toString(36)
    .slice(2);
  let textarea = document.createElement('textarea');
  textarea.setAttribute('id', rand);
  textarea.setAttribute('cols', '20');
  textarea.setAttribute('rows', '10');
  textarea.value = md;
  document.body.append(textarea);
  var text = document.getElementById(rand);

  text.select(); // 选择对象
  // alert(md)
  document.execCommand('Copy'); // 执行浏览器复制命令
  // alert("已复制，可以粘贴。")
  chrome.runtime.sendMessage({greeting: '你好，我是content-script呀，我主动发消息给后台！', md}, function(response) {
    console.log('收到来自后台的回复：' + response);
  });

}
function generateHeading(h) {
  return new Array(h).fill('#').join('');
}
function generateImage(imgUrl) {
  return `![${imgUrl}](${imgUrl})`;
}

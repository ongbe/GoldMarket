/**
 * @author linchao  (<a href="mailto:lin-chao@foxmail.com">lin-chao@foxmail.com</a>)
 * @date   2012.12.14
 */ 
var background = chrome.extension.getBackgroundPage();
var di = document.getElementById('info');
background.getInfo( di);
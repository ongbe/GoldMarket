/**
 * @author linchao  (<a href="mailto:lin-chao@foxmail.com">lin-chao@foxmail.com</a>)
 * @date   2012.12.14
 */

var debug = false;

/**
 * UI操作 命名空间
 * @type {Object}
 */
var NS = {
    remove : function(o){
        if (o && o.parentNode){
            o.parentNode.removeChild(o);
        }
    },
    isUndefined : function(o) {
        return typeof o == 'undefined';
    },
    isObject : function(o) {
        return typeof o == 'object';
    },
    isArray : function(o) {
        return this.getType(o) == 'Array';
    },
    getType : function(o){
        return Object.prototype.toString.call(o).slice(8,-1);
    },
    isElement : function(o) {
        return o && o.nodeType == 1;
    },
    scrollY : function(o) {
        var E = document.documentElement;
        if (o) {
            var P = o.parentNode,Y = o.scrollTop || 0;
            if (o == E) Y = UI.scrollY();
            return P ? Y + UI.scrollY(P) : Y;
        }
        return self.pageYOffset || (E && E.scrollTop) || document.body.scrollTop;
    },
    scrollX : function(o) {
        var E = document.documentElement;
        if (o) {
            var P = o.parentNode,X = o.scrollLeft || 0;
            if (o == E) X = UI.scrollX();
            return P ? X + UI.scrollX(P) : X;
        }
        return self.pageXOffset || (E && E.scrollLeft) || document.body.scrollLeft;
    },
    DC : function(n) { //Dom Create Element
        return document.createElement(n);
    },
    each : function(o,f) {
        if (o){
            if(NS.isUndefined(o[0]) && !NS.isArray(o)){
                for (var key in o){
                    if (f(o[key],key)){
                        break;
                    }
                }
            }
            else{
                for(var i = 0,n = o.length;i < n;i++){
                    if (f(o[i],i)){
                        break;
                    }
                }
            }
        }
    },
    html : function(s){
        var wrap = NS.DC('div'),tmp = [];
        wrap.innerHTML = s;
        NS.each(wrap.childNodes,function(o){
            if (NS.isElement(o)){
                tmp.push(o);
            }
        });
        return tmp;
    },
    ajax : function( o){
        var xmlHttp =  new  XMLHttpRequest();
        var complete;
        var timeout;
        o.async = NS.isUndefined(o.async) ? true : o.async
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp){
                if (xmlHttp.readyState == 1){
                    if (o.timeout && o.fail){ //超时
                        timeout = setTimeout(function(){
                            if (!complete){
                                complete = 1;
                                o.fail();
                                xmlHttp.abort();
                                xmlHttp = null;
                            }
                        },o.timeout);
                        o.timeout = 0;
                    }
                }
                else if (xmlHttp.readyState == 2){
                    if (o.send){
                        o.send();
                    }
                }
                else if (xmlHttp.readyState == 4 && !complete){
                    complete = 1;
                    if (xmlHttp.status == 200){
                        if (o.success) {
                            o.success(xmlHttp.responseText);
                        }
                    }
                    else{
                        if (o.fail){
                            o.fail();
                        }
                    }
                    clearTimeout(timeout);
                    xmlHttp = null;
                }
            }
        }
        if ( NS.isObject(o.data)) {
            var data = [];
            for (var i in o.data) {
                data.push(i + '=' + encodeURIComponent(o.data[i]));
            }
            o.data = data.join('&');
        }
        var rf = function(){
            if (o.refer) {
                xmlHttp.setRequestHeader('rf',o.refer);
            }
        }
        if (o.type == 'get') {
            xmlHttp.open('GET',o.url , o.async);
            rf();
            xmlHttp.send(null);
        }
        else {
            xmlHttp.open('POST',o.url,o.async);
            rf();
            xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlHttp.send(o.data);
        }
        return xmlHttp;
    },
    utfEncode : function (s) {
        if( !s)
            return '';
        s = s.replace(/\r\n/g,'\n');
        var utftext = '';
        for (var n = 0, l = s.length; n < l; n++) {
            var c = s.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
        return utftext;
    },
    encode : function (s) {
        return escape(NS.utfEncode(s));
    },
    gc : (function(){ //From http://james.padolsey.com/javascript/mini/
        //input[type=checkbox]  bug in ie
        /*
            Support:
                div.example1.example2 //Add By xhlv
                div
                body div
                div,p
                div,p,.example
                div p
                div > p
                div.example
                ul .example
                #title
                h1#title
                div #title
                ul.foo > * span
        */
        var snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
            exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
            exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
            exprNodeName = /^([\w\*\-_]+)/,
            na = [null,null];
        function _find(context,selector) { //This is what you call via x() Starts everything off...
            if (!selector){
                selector = context;
                context = document;
            }
            context = context || document;
            var simple = /^[\w\-_#]+$/.test(selector);

            if (!simple && context.querySelectorAll) {
                return realArray(context.querySelectorAll(selector));
            }
            if (selector.indexOf(',') > -1) {
                var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
                for(; sIndex < len; ++sIndex) {
                    ret = ret.concat( _find(context, split[sIndex]) );
                }
                return unique(ret);
            }

            var parts = selector.match(snack),
                part = parts.pop(),
                id = (part.match(exprId) || na)[1],
                className = !id && (part.match(exprClassName) || na)[1],
                classNameOther = part.split('.').slice(2), //Add By xhlv,For Find '.red.yellow'
                nodeName = !id && (part.match(exprNodeName) || na)[1],
                collection;
            if (className && !nodeName && context.getElementsByClassName) {
                collection = realArray(context.getElementsByClassName(className));
            }
            else {
                collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));
                if (className) {
                    collection = filterByAttr(collection,'className',RegExp('(^|\\s)' + className + '(\\s|$)'),classNameOther);
                }
                if (id) {
                    var byId = context.getElementById(id);
                    return byId?[byId]:[];
                }
            }
            return parts[0] && collection[0] ? filterParents(parts, collection) : collection;
        }
        function realArray(c) { //Transforms a node collection into a real array
            try {
                return Array.prototype.slice.call(c);
            }catch(e) {
                var ret = [], i = 0, len = c.length;
                for (; i < len; ++i) {
                    ret[i] = c[i];
                }
                return ret;
            }
        }
        function filterParents(selectorParts, collection, direct) { //This is where the magic happens.Parents are stepped through (upwards) to see if they comply with the selector.
            var parentSelector = selectorParts.pop();

            if (parentSelector === '>') {
                return filterParents(selectorParts, collection, true);
            }

            var ret = [],
                r = -1,
                id = (parentSelector.match(exprId) || na)[1],
                className = !id && (parentSelector.match(exprClassName) || na)[1],
                nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
                cIndex = -1,
                node, parent,
                matches;
            nodeName = nodeName && nodeName.toLowerCase();
            while ( (node = collection[++cIndex]) ) {
                parent = node.parentNode;
                do {
                    matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
                    matches = matches && (!id || parent.id === id);
                    matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
                    
                    if (direct || matches) { break; }
                    
                } while ( (parent = parent.parentNode) );
                
                if (matches) {
                    ret[++r] = node;
                }
            }
            return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret;
        }
        var unique = (function(){
            var uid = +new Date();
            var data = (function(){
                var n = 1;
                return function(elem) {
                    var cacheIndex = elem[uid],
                        nextCacheIndex = n++;
                    if(!cacheIndex) {
                        elem[uid] = nextCacheIndex;
                        return true;
                    }
                    return false;
                };
            })();
            return function(arr) { //Returns a unique array
                var length = arr.length,
                    ret = [],
                    r = -1,
                    i = 0,
                    item;
                for (; i < length; ++i) {
                    item = arr[i];
                    if (data(item)) {
                        ret[++r] = item;
                    }
                }
                uid += 1;
                return ret;
            };
        })();
        function filterByAttr(collection,attr,regex,other) { //Filters a collection by an attribute.
            var i = -1, node, r = -1, ret = [],other = other || '';
            while ( (node = collection[++i]) ) {
                if (regex.test(node[attr]) && node[attr].hasString(other)) {
                    ret[++r] = node;
                }
            }
            return ret;
        }
        return _find;
    })()

};

var adiObjcet = {
    'rmbau' : '#ObjectList1_ctl01_table2 td',
    'rmbag' : '#ObjectList1_ctl02_table2 td',
    'rmbpt' : '#ObjectList1_ctl03_table2 td',
    'rmbpd' : '#ObjectList1_ctl04_table2 td',
    'usdau' : '#ObjectList1_ctl05_table2 td',
    'usdag' : '#ObjectList1_ctl06_table2 td',
    'usdpt' : '#ObjectList1_ctl07_table2 td',
    'usdpd' : '#ObjectList1_ctl08_table2 td'
};

var adiNameOb ={
    'rmbau' : '人民币黄金',
    'rmbag' : '人民币白银',
    'rmbpt' : '人民币铂金',
    'rmbpd' : '人民币钯金',
    'usdau' : '美元黄金',
    'usdag' : '美元白银',
    'usdpt' : '美元铂金',
    'usdpd' : '美元钯金'
}


for( var item in adiObjcet){
    delete localStorage[ item + 'time'];
}

function infoToHtml( o){
    var res = [];
    res.push( '<table  cellspacing="1" cellpadding="0" border="0" style="width:100%;">',
            '<tr>',
                '<td style="border-width:1px;border-style:solid;width:45%;">',
                    '<a  href="#">', o[0],'</a>',
                '</td>',
                '<td style="border-width:1px;border-style:solid;width:30%;">', o[1],'</td>',
                '<td style="border-width:1px;border-style:solid;width:25%;">',o[2],'</td>',
            '</tr>',
        '</table>');
    return res.join('');
}


function getInfo( el){
    debug&&console.log( 'getInfo');
    NS.ajax({
        url : 'http://wap.icbc.com.cn/WapDynamicSite/GoldMarket/Default.aspx',
        type: 'get',
        success : function( data){
            var str = data.replace(/[\r\n\t]/g,'');
            debug&&console.log( data);
            var pattern = /<form.*<\/form>/;
            var html = pattern.exec( str)[0];
            debug&&console.log( html);
            var dom = NS.html( html)[0];
            debug&&console.log('dom', dom);
            var t = '';
            for( var item in adiObjcet){
                if( localStorage[item] != 'false'){
                    var temp = NS.gc( dom, adiObjcet[ item]);
                    var tempName = NS.gc( temp[0], 'a')[0].innerHTML;
                    var tempValue = temp[1].innerHTML;
                    var tempGrath = temp[2].innerHTML;
                  
                    //t  +=  temp[0].innerHTML + temp[1].innerHTML + temp[2].innerHTML;
                    t += infoToHtml( [tempName, tempValue, tempGrath]);
                }
            }
            el.innerHTML = t;    
        }
    })
}

var notification = window.webkitNotifications.createNotification(
    //'48.png',                      // The image.
   // hour + time[2] + ' ' + period, // The title.
  // na + encodeURIComponent('到达提醒报价') + price      // The body.
);
function cancel(){
    notification.cancel();
}
function show( na,price) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  notification = window.webkitNotifications.createNotification(
    '',                      // The image.
    hour + time[2] + ' ' + period, // The title.
    adiNameOb[na] + '到达提醒报价'+ price       // The body.
  );
  notification.show();
  localStorage[ na + 'time'] = (new Date()).getTime();
}

setTimeout( function(){

    var fun = arguments.callee;

    NS.ajax({
        url : 'http://wap.icbc.com.cn/WapDynamicSite/GoldMarket/Default.aspx',
        type: 'get',
        success : function( data){
            var str = data.replace(/[\r\n\t]/g,'');
            debug&&console.log( data);
            var pattern = /<form.*<\/form>/;
            var html = pattern.exec( str)[0];
            debug&&console.log( html);
            var dom = NS.html( html)[0];
            debug&&console.log('dom', dom);
            var t = '';
            if( localStorage['isActivated'] != 'false'){
                for( var item in adiObjcet){
                    //if( localStorage[item] != 'false'){
                        var temp = NS.gc( dom, adiObjcet[ item]);
                        var tempName = NS.gc( temp[0], 'a')[0].innerHTML;
                        var tempValue = temp[1].innerHTML;
                      
                        if( localStorage[ item + 'isActivated'] == 'true'){
                            var upVal = parseFloat( localStorage[ item + 'up']);
                            var downVal = parseFloat( localStorage[ item + 'down']);
                            var tempVal = parseFloat(tempValue );

                            var isOK;
                            if( localStorage[ item + 'time'])
                                isOK = (new Date()).getTime() - parseInt(localStorage[ item + 'time']) > 30*60*1000 ? true : false;
                            else
                                isOK = true;
                            if( tempVal >= upVal && isOK){
                                cancel();
                                show( item, tempVal);
                                break;
                            }
                            if( tempVal <= downVal && isOK){
                                cancel();
                                show( item,tempVal);
                                break;
                            }
                        }
                       
                    //}
                }
            }
            setTimeout( fun,60000);     
        }
    })

},10000);

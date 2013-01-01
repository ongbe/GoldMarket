/**
 * @author linchao  (<a href="mailto:lin-chao@foxmail.com">lin-chao@foxmail.com</a>)
 * @date   2012.12.14
 */
var debug = false;
var adiObjcet = {
    'rmbau' : '1',
    'rmbag' : '1',
    'rmbpt' : '1',
    'rmbpd' : '1',
    'usdau' : '1',
    'usdag' : '1',
    'usdpt' : '1',
    'usdpd' : '1'
};
//rmbauisActivated
window.addEventListener('load', function() {
	var needdisplay = document.getElementById('needdisplay');

	var inputcheck = needdisplay.getElementsByTagName('input');
	var len = inputcheck.length;

	var options = document.getElementById( 'options');
	var optInpts = options.getElementsByTagName('input');
	var optLen = optInpts.length;

	for( var item in adiObjcet){
		document.getElementById( item).firstElementChild.checked = localStorage[ item] == 'false' ? false : true;
		document.getElementById( item + 'isActivated').checked = localStorage[ item + 'isActivated'] == 'true' ? true :false;
		document.getElementsByName( item + 'up')[0].value = localStorage[ item + 'up'] ||'';
		document.getElementsByName( item + 'down')[0].value = localStorage[ item + 'down'] || '';
	}
	// for( var i = 0; i < len; i++){
	// 	inputcheck[i].checked = localStorage[ inputcheck[i].parentNode.id] == 'false' ? false : true;
	// 	optInpts[i].checked = localStorage[ ]
	// }
	needdisplay.onclick = function( e){
		var target = e.target;
		var id = target.id || target.parentNode.id;
		debug&&console.log( id);
		if( adiObjcet[ id]){
			var checked = target.checked === undefined ? target.getElementsByTagName('input')[0].checked : target.checked;
			debug&&console.log( checked);
			localStorage[ id] = checked;
		}
	}

	

	options.onclick = function( e){
		var target = e.target;

		var id = target.id;
		if( !id){
			return false;
		}

		if( id == 'isActivated'){
			localStorage[ id] = target.checked;
			if( target.checked == false){
				for( var i = 1 ; i < optLen; i++){
					optInpts[i].checked = false;
					//localStorage[ optInpts[i].id] = false;
				}
			}else{
				for( var i = 1 ; i < optLen; i++){

					optInpts[i].checked = localStorage[ optInpts[i].id] == 'false' ? false : true;
					//localStorage[ optInpts[i].id] = false;
				}
			}
		}else{
			var upid = target.previousElementSibling; //id.replace( 'isActivated','up');
			var downid =  upid.previousElementSibling; //id.replace( 'isActivated','down');
			localStorage[ id] = target.checked;
			if( target.checked){
				
				var upVal = upid.value;
				var downVal = downid.value;
				if( !upVal && !downVal){
					alert('先填写价格吧');
					target.checked = false;
					return;
				}
				localStorage[ upid.name] = upVal;
				localStorage[ downid.name] = downVal;
				
			}else{
				delete localStorage[ upid.name];
				delete localStorage[ downid.name];
				upid.value = downid.value = '';
			}
		}
	}
})
var doc = document;
    omnibox = doc.getElementById("omnibox"),
    search = doc.getElementById("search"),
    tick = 0,
    navBack = doc.getElementById("nav-back"),
    navForward = doc.getElementById("nav-forward"),
    webviewContainer = doc.getElementById('webview-container'),
    webview = [],
    tabContainer = doc.getElementById('tab-container'),
    tab = [],
    tabNew = doc.getElementById('tab-new'),
    current = 0,
    opened = [0],
    topchrome = doc.getElementById("topchrome"),
    highlight = doc.getElementById('topchrome-highlight'),
    textlight = doc.getElementById('topchrome-textlight'),
    toolbar = doc.getElementById('topchrome-tools'),
    tip = ['Made with <3 from Arcadia High','Alt+W to close current tab','Ctrl+alt+W to erase this window\'s history','Alt+T to open new tab','Alt+N to open new window'],
    tiptick=0,
    closeWindow = doc.getElementById('close'),
    popup = doc.getElementById('popup'),
    popups = doc.getElementsByClassName('popup');


function setCurrent(k){
  console.log('function setCurrent('+k+')');
  console.log('Set #webview'+k+' as current tab');
  webview[k].classList='current-webview';
  tab[k].classList='current-tab';
  current=k;
  omnibox.value=webview[current].src;
  checkHome();
  if(tab.length>1){
    for(let i=0;i<tab.length;i++){
      if(i!==k){
        webview[i].classList = '';
        tab[i].classList='';
        console.log('Deactivated #webview'+i+' and #tab'+i);
      }
    }
  }
}

function omniUrl(){
  omnibox.value=webview[current].src;
  checkHome();
}

function closeTab(){
  console.log('function CloseTab('+current+')');
  if(webviewContainer.childElementCount>1){
    tab[current].classList.add('tabClose');
    setTimeout(function(){
      webview[current].remove();
      tab[current].remove();
      tab[current]=false;
      webview[current]=false;
      if(current){
        while(!(webview[current])){
          current--;
        }
        setCurrent(current);
      }
    },100);
  }else{
    window.close();
  }
}

function newTab(url){
  
  console.log('function newTab('+url+')');
  
  var j = tab.length;
  
  webview[j] = doc.createElement('webview');
  // webview[j].setAttribute('partition',('trusted-'+(Math.random()*10)));
  webview[j].setAttribute('partition','trusted');
  webview[j].id = 'webview'+j;
  webview[j].currentUrl='';
  webview[j].setAttribute('allowtransparency','on');
  webviewContainer.appendChild(webview[j]);

  tab[j] = doc.createElement('div');
  tab[j].id = 'tab'+j;
  tab[j].tabindex = 10+j;
  tabContainer.appendChild(tab[j]);
  setCurrent(j);
  tab[j].addEventListener('click',function(){
    if(j===current){
      closeTab();
    }else{
      setCurrent(j);
    }
  });
  
  webview[j].onmousemove = function(){
    webview[j].focus();
  };
  webview[j].addEventListener('loadstart',function(e){
    // if(j===current&&e.isTopLevel&&(webview[j].currentUrl.match(/(?<=:\/\/)(.*)(?=\.)/g)[0]!==webview[j].src.match(/(?<=:\/\/)(.*)(?=\.)/g)[0])){
    //   loadwrapper.classList.add('loading');
    //   console.log(true);
    // }
    omniUrl();
  });
  webview[j].addEventListener('loadstop',function(){
    this.insertCSS({
      code: 'html{background:#fff!important;}',
      runAt: 'document_start'  // and added this
    });
    omniUrl();
    this.currentUrl=this.src;
  });
  webview[j].addEventListener("permissionrequest", function(e) {
    e.request.allow();
  });
  webview[j].addEventListener("newwindow", function(e) {
    for(let i=0;i<3;i++){
      popup.innerHTML='Open '+String(e.targetUrl).substr(0,50)+' in new tab? Click to confirm.';
      popups[i].style.animationPlayState='running';
      setTimeout(function(){
        popups[i].style.animationPlayState='paused';
        popups[i].style.display='block';
        popup.onclick='';
        NewwWindow.discard();
      },4000);
    }
    popup.onclick=function(){
      newTab();
      webview[current].src=e.targetUrl;
      for(let i=0;i<3;i++){
        popups[i].style.display='none';
      }
    };
  });
  
  setTimeout(function(){webview[0].src=url;},1);
  
  omnibox.focus();
}

function checkHome(){
  if(omnibox.value.startsWith('chrome-extension')||omnibox.value=='offline/home.html'||omnibox.value=='undefined'){
    omnibox.value='';
  }
}

function clearAllHistory(){
  for(let i=0;i<tab.length;i++){
    webview[i].clearData(
      {since:0},
      {appcache:true,cache:true,cookies:true,sessionCookies:true,persistentCookies:true,fileSystems:true,indexedDB:true,localStorage:true,webSQL:true},
      window.close()
    );
  }
}

newTab('offline/home.html');
checkHome();

omnibox.placeholder='Search DuckDuckGo or type in a URL\u2003\u2003\u2003'+tip[0];
setInterval(function(){
  tiptick++;
  omnibox.placeholder='Search DuckDuckGo or type in a URL\u2003\u2003\u2003'+tip[tiptick%5];
},3000);


navBack.onclick = function(){
  webview[current].back();
};
navForward.onclick = function(){
  webview[current].forward();
};

omnibox.onfocus = function(){
  omnibox.select();
};
tabNew.onclick = function(){newTab();webview[current].src='offline/home.html';};
search.onsubmit = function() {
  var e = omnibox.value;
  if(e){
    if(!(e.includes("."))||e.includes(" ")){
      e = "duckduckgo.com/?q=" + e + "&kp=-2";
    }
    if(!(e.includes("http"))){
      e = "https://" + e;
    }
    webview[current].src=e;
  }else{
    webview[current].src='offline/home.html';
    e='';
  }
  omnibox.value=e;
};
window.onmousemove = function (e){
  highlight.style.transform = 'translate('+e.pageX+'px,0)';
  textlight.style.transform = 'translate('+e.pageX+'px,0)';
  omnibox.focus();
};
closeWindow.onclick = function(){
  window.close();
};

//keyboard shortcuts
window.addEventListener('keyup',
function(e){
  if(e.altKey){
    if(e.key==='w'){
      if(e.ctrlKey){
        clearAllHistory();
      }else{
       closeTab();
      }
    }else if(e.key==='n'){
      chrome.app.window.create('browser.html', {
        id:String(Math.random()),
        state:'maximized',
        frame:'none',
        innerBounds: {
            minWidth: 400,
            minHeight: 300
        }
      });
    }else if(e.key==='t'){
      newTab();
      webview[current].src='offline/home.html';
    }
  }
},false);
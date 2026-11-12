// ==UserScript==
// @name     Kai's Coles online shopping helper tool
// @version  1
// @match    https://www.coles.com.au/*
// @grant    none
// ==/UserScript==

//todo: less swears?
//todo: clean up log level labelling
//todo: make sharable with the rest of the world
//todo: provide instructions on installing to friends


///////////////
// constants //
///////////////


const vtype=Object.freeze({
    SILENT: 0, 0:"SILENT",
    LOG: 1, 1: "LOG",
    VERBOSE: 2, 2: "VERBOSE",
    DEBUG: 3, 3: "DEBUG",
    WARNING: 4, 4: "WARNING",
    ERROR: 5, 5: "ERROR"
});

/////////////
// configs //
/////////////
var ingredientBlacklist=[]; //eg: ingredientBlacklist=["mushroom","pumpkin"];
var urlBlacklist=[];
var negativeHighlightStyle="background-color: red;"
var displayIngredientBlacklistHeader=true;

/////////////
// strings //
/////////////
//from the webpage/source
const colesDomain="coles.com.au";
const colesHeaderID="coles-targeting-header-container"
const productPagePATH="product";
const nutritionInfoID="nutrient-table";
const ingredientsID="ingredients-control";

//for the code
const ingredientBlacklistID="ingredientBlacklist";

//////////
// vars //
//////////
var targets=-1;


//////////////////////////
// localstorage reset //
//////////////////////////
{
  if (false) {
    localStorage.clear();
    localStorage.ingredientBlacklist=JSON.stringify(["mushroom","pumpkin"]);
  }
}
/////////////
// startup //
/////////////

spam(vtype.LOG,"Starting Coles Analyser.");
addEventListener("DOMContentLoaded", (event) => {
  spam(vtype.DEBUG, "content's loaded");
  loadURLBlacklist();
  spam(vtype.DEBUG, "resulting URL blacklist: "+urlBlacklist);
  loadIngredientBlacklist();
  spam(vtype.DEBUG, "resulting ingredient blacklist: "+ingredientBlacklist);
});

addEventListener("load", (event) => {
  spam(vtype.DEBUG, "page is 'fully' loaded");
  pageParser(document.URL);
});

spam(vtype.DEBUG, "code's loaded");

/////////////////////////
// lets do some stuff! //
/////////////////////////
//main
function pageParser(URLstr) {
  let pageURL=new URL(URLstr);
  let hn=pageURL.hostname;
  if (hn.substring(hn.length-colesDomain.length,hn.length)=="coles.com.au") {
    //it's coles!
    spam(vtype.DEBUG, "this is coles!")
    if (pageURL.pathname.substr(1,7)==productPagePATH) {
      spam(vtype.DEBUG, "This is a product page!");
      nutrientPanelParser();
      ingredientsParser();
    } else {
      spam(vtype.DEBUG, "this is a product page");
    }
    if (displayIngredientBlacklistHeader) {
      createHeader();
    }
    huntForBlacklisted();
    spam(vtype.DEBUG, "intervalID="+setInterval(huntForBlacklisted,2000));
  } else {
    spam(vtype.VERBOSE, "this isn't coles");
  }
}

function createHeader() {
    let warning=document.createElement("div");
    warning.id=ingredientBlacklistID;
    warning.style="background-color:pink;text-align:center;";
    warning.innerHTML="Blacklist: ";
    switch (ingredientBlacklist.length) {
      case 0:
        warning.innerHTML+="empty"
        break;
      case 1:
        warning.innerHTML+=ingredientBlacklist[0];
        break;
      default:
        for (let i=0;i<ingredientBlacklist.length-2;i++) {
          warning.innerHTML+=ingredientBlacklist[i]+", ";
        }
        warning.innerHTML+=ingredientBlacklist[ingredientBlacklist.length-2]+" and "+ingredientBlacklist[ingredientBlacklist.length-1];
    }
    let colesHeader=document.getElementById(colesHeaderID);
    colesHeader.insertBefore(warning, colesHeader.children[0]);
}
function ingredientsParser() {
  spam(vtype.DEBUG,"we parsing ingredients");
  let ing=document.getElementById(ingredientsID);
  let productName=document.getElementsByTagName("h1")[0];
  let thisPath=new URL(document.URL).pathname;
  for (banned of ingredientBlacklist) {
    if (ing.innerHTML.toLowerCase().indexOf(banned.toLowerCase())!=-1) {
      spam(log,"Found banned ingredient: "+banned);
      productName.innerHTML="<span style='color:red;'>"+banned+"</span>+ "+productName.innerHTML;
      if (urlBlacklist.indexOf(thisPath)==-1) {
        urlBlacklist.push(thisPath);
      }
    } else {
      spam(vtype.DEBUG,"no "+banned+" found");
    }
  }
  spam(vtype.DEBUG,"ingredients list: "+ing.innerHTML)
  saveURLBlacklist();
}
function nutrientPanelParser () {
  if (document.URL.indexOf(productPagePATH)==-1) {
    spam(vtype.VERBOSE, "this ain't a product page: "+document.URL);
  } else {//we're on product page
    spam(vtype.DEBUG, "this is a product page");
    let nutrienttable=document.getElementById(nutritionInfoID)
    if (!nutrienttable) {
    spam(vtype.VERBOSE, "No nutrient table");
    }
    
    rows=nutrienttable.children[0].children
    
    if (!rows) {

    }
    let servingcolumn=-1;
    let headers=rows[0].children;
    for (let i=0;i<headers;i++) {
    if (headers[0].innerText.contains("serv")) {
    servingcolumn=i;
    }
    }
    if (servingcolumn==-1) {
    spam(vtype.LOG, "where's your servings column???");
    } else {
    spam(vtype.DEBUG, "servings column: "+servingcolumn);
    }
  }
}

function huntForBlacklisted() {
  loadURLBlacklist();//just in case
  let links=document.getElementsByTagName("a")
  let _targets=0;
  for (lnk of links) {
    for (path of urlBlacklist) {
      if (lnk.href=="" || lnk.attributes.href.value=="#")
        continue;
      if (lnk.attributes.href.value.indexOf(path)!=-1) {
        if (document.URL.indexOf(productPagePATH)==-1)
        {
          lnk.parentElement.parentElement.style=negativeHighlightStyle;
        }
        lnk.parentElement.style=negativeHighlightStyle;
        lnk.style=negativeHighlightStyle;
        _targets++;
      }
    }
  }
  if (targets!=_targets) {
    targets=_targets;
    spam(vtype.DEBUG,"guess who's back, after hunting down "+targets+" links");
  }
}

//////////////////////
// Helper functions //
//////////////////////
function spam(priority,content) {
  let msg=timestamp()
    +" KAI'S TOOL: "+vtype[priority]+" ";
  if (spam.caller && spam.caller.name.length>0)
    msg+=spam.caller.name+": "
  msg+=content;
  switch (priority) {
    case 0:
      break;
    case 1:
      console.log(msg);
      break;
    case 2:
      console.info(msg);
      break;
    case 3:
      console.debug(msg);
      break;
    case 4:
      console.warning(msg);
      break;
    case 5:
      console.error(msg);
      break;
  }
}
function timestamp() {
  let d=new Date();
  let str=""+d.getFullYear()
       +"-"+(d.getMonth()+1+"").padStart(2,0)
       +"-"+(d.getDate()+"").padStart(2,0)
       +" "+(d.getHours()+"").padStart(2,0)
       +":"+(d.getMinutes()+"").padStart(2,0)
       +":"+(d.getSeconds()+"").padStart(2,0)
       +"."+(d.getMilliseconds()+"").padStart(3,0);
  return str;
}

function loadIngredientBlacklist() {
  if (localStorage.ingredientBlacklist)
    for (item of JSON.parse(localStorage.ingredientBlacklist)) {
      if (ingredientBlacklist.indexOf(item)==-1) {
        ingredientBlacklist.push(item);
      }
    }
}
function saveIngredientBlacklist() {
  localStorage.ingredientBlacklist=JSON.stringify(ingredientBlacklist);
}

function loadURLBlacklist() {
  if (localStorage.urlBlacklist)
    for (item of JSON.parse(localStorage.urlBlacklist)) {
    if (urlBlacklist.indexOf(item)==-1)
      urlBlacklist.push(item);
    }
}
function saveURLBlacklist() {
  localStorage.urlBlacklist=JSON.stringify(urlBlacklist);
}
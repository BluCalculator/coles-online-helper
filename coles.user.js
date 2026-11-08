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
    SILENT: 0,
    LOG: 1,
    VERBOSE: 2,
    DEBUG: 3,
    WARNING: 4,
    ERROR: 5
});

/////////////
// configs //
/////////////
var verbosity=vtype.DEBUG;
var ingredientBlacklist=[]; //eg: ingredientBlacklist=["mushroom","pumpkin"];
var urlBlacklist=[];
var negativeHighlightStyle="background-color: red;"
var displayIngredientBlacklistHeader=true;

var localStorageFuckery=false;

/////////////
// strings //
/////////////
const colesDomain="coles.com.au";
const productPagePATH="product";
const nutritionInfoID="nutrient-table";
const ingredientsID="ingredients-control";

//////////////////////////
// localstorage fuckery //
//////////////////////////
{
  if (localStorageFuckery) {
    localStorage.clear();
    localStorage.ingredientBlacklist=JSON.stringify(["mushroom","pumpkin"]);
  }
}
/////////////
// startup //
/////////////
spam(vtype.LOG,"Starting Coles Analyser. Verbosity: "+verbosity);

addEventListener("DOMContentLoaded", (event) => {
  spam(vtype.DEBUG, "content's loaded");
  loadURLBlacklist();
  spam(3, "URL blacklist: "+urlBlacklist);
  loadIngredientBlacklist();
  spam(3, "ingredient blacklist: "+ingredientBlacklist);
});

addEventListener("load", (event) => {
  spam(vtype.DEBUG, "page is 'fully' loaded");
  pageParser(document.URL);
});

spam(vtype.DEBUG, "code's loaded");

////////////////////////
// lets do some shit! //
////////////////////////
function pageParser(URLstr) {
  let pageURL=new URL(URLstr);
  let hn=pageURL.hostname;
  if (hn.substring(hn.length-colesDomain.length,hn.length)=="coles.com.au") {
    //it's coles!
    spam(3, "this is coles!")
    if (pageURL.pathname.substr(1,7)==productPagePATH) {
      spam(3, "This is a product page!");
      nutrientPanelParser();
      ingredientsParser();
    } else {
      if (displayIngredientBlacklistHeader) {
        let header=document.getElementById("coles-targeting-header-container");
        header.innerHTML="<div id='ingredientBlacklist' style='background-color:pink;text-align:center;'></div>"+header.innerHTML
        document.getElementById("ingredientBlacklist").innerHTML="Blacklist: ";
        for (ingredient of ingredientBlacklist) {
          document.getElementById("ingredientBlacklist").innerHTML+=ingredient+" ";
        }
        setInterval(huntForBlacklisted,2000);
      }
    }
  } else {
    spam(2, "this isn't coles");
  }
}

function ingredientsParser() {
  spam(3,"we parsing ingredients");
  let ing=document.getElementById(ingredientsID);
  let productName=document.getElementsByTagName("h1")[0];
  let thisPath=new URL(document.URL).pathname;
  for (shit of ingredientBlacklist) {
    if (ing.innerHTML.toLowerCase().indexOf(shit.toLowerCase())!=-1) {
      spam(1,"WE FOUND SOME SHIT: "+shit);
      productName.innerHTML="<span style='color:red;'>"+shit+"</span>+ "+productName.innerHTML;
      if (urlBlacklist.indexOf(thisPath)==-1) {
        urlBlacklist.push(thisPath);
      }
    } else {
      spam(3,"no "+shit+" found");
    }
  }
  spam(3,"ingredients list: "+ing.innerHTML)
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
  let links=document.getElementsByTagName("a")
  let targets=0;
  for (lnk of links) {
    for (path of urlBlacklist) {
      if (lnk.href.indexOf(path)!=-1) {
        lnk.parentElement.parentElement.style=negativeHighlightStyle;
        lnk.parentElement.style=negativeHighlightStyle;
        lnk.style=negativeHighlightStyle;
        targets++;
      }
    }
  }
  spam(3,"guess who's back, after hunting down "+targets/2+" links");
}

//////////////////////
// Helper functions //
//////////////////////
function spam(priority,content) {
  let msg=timestamp()
    +" KAI'S TOOL: ";
  if (spam.caller.name.length>0)
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
  let str=""+d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"."+d.getMilliseconds();
  return str;
}

function loadIngredientBlacklist() {
  spam(3, "localstorage ingredient blacklist: "+localStorage.ingredientBlacklist)
  if (localStorage.ingredientBlacklist)
    for (item of JSON.parse(localStorage.ingredientBlacklist)) {
    spam(3,"checking if "+item+" is in the ingredientBlacklist");
    if (ingredientBlacklist.indexOf(item)==-1)
      ingredientBlacklist.push(item);
    } spam(3, "ingredient blacklist="+ingredientBlacklist);
}
function saveIngredientBlacklist() {
  localStorage.ingredientBlacklist=JSON.stringify(ingredientBlacklist);
}

function loadURLBlacklist() {
  spam(3, "localstorage url blacklist: "+localStorage.urlBlacklist)
  if (localStorage.urlBlacklist)
    for (item of JSON.parse(localStorage.urlBlacklist)) {
    spam(3,"checking if "+item+" is in the urlBlacklist");
    if (urlBlacklist.indexOf(item)==-1)
      urlBlacklist.push(item);
    }
}
function saveURLBlacklist() {
  localStorage.urlBlacklist=JSON.stringify(urlBlacklist);
}
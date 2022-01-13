// 计算 日、周、本月、上月、季、年、全部累计词频分析
const fs = require('fs')
const { isDate, parseDate, formatDate, formatDate2, formatDate3 } = require("./util");
// 定义时间
const dateStr = formatDate(new Date())
const path = require('path');
const filePath = path.resolve('./news')
const nodejieba = require("nodejieba");
nodejieba.load({
    userDict: './userdict.utf8',
  });

// 时间计算
function getThisWeekData() {//获得本周周一~周日的年月日  
    var thisweek = {};
    var date = new Date();
    // 本周一的日期
    date.setDate(date.getDate() - date.getDay() + 1);
    var year=date.getFullYear();
    var month= date.getMonth() + 1
    var day = date.getDate()
    if(month==0){
        year=year-1;
        month = 12;
    }
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    thisweek.start_day = year+ "-" + month + "-" + day ;
  
    // 本周日的日期
    date.setDate(date.getDate() + 6);
    var month= date.getMonth() + 1
    var day = date.getDate()
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    thisweek.end_day = year + "-" + month + "-" + day ;
    return thisweek
  }
function getLastWeekData() {//获得上周周一~周日的年月日  
    var lastweek = {};
    var date = new Date();
    // 上周一的日期
    date.setDate(date.getDate()-7 - date.getDay() + 1);
    var year=date.getFullYear();
    var month= date.getMonth() + 1
    var day = date.getDate()
    if(month==0){
        year=year-1;
        month = 12;
    }
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    lastweek.start_day =  year + "-" + month + "-" + day ;
  
    // 上周日的日期
    date.setDate(date.getDate() +6);
    var month= date.getMonth() + 1
    var day = date.getDate()
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    lastweek.end_day =  year+ "-" + month + "-" + day ;
    return lastweek
  } 

function getThisMonth() {//获得本月第一天~本月最后一天年月日
    var thismonth={};
    var date = new Date();
        date.setDate(1);
        var month = parseInt(date.getMonth()+1);
        var day = date.getDate();
        if (month < 10) {
            month = '0' + month
        }
        if (day < 10) {
            day = '0' + day
        }
    thismonth.start_day=date.getFullYear() + '-' + month + '-' + day



    var endDate=new Date();
    var currentMonth=endDate.getMonth();
    var nextMonth=++currentMonth;
    var nextMonthFirstDay=new Date(endDate.getFullYear(),nextMonth,1);
    var oneDay=1000*60*60*24;
    var lastTime = new Date(nextMonthFirstDay-oneDay);
    var endMonth = parseInt(lastTime.getMonth()+1);
    var endDay = lastTime.getDate();
    if (endMonth < 10) {
        endMonth = '0' + endMonth
    }
    if (endDay < 10) {
        endDay = '0' + endDay
    }

    thismonth.end_day=endDate.getFullYear() + '-' + endMonth + '-' + endDay

    return thismonth
}

function getLastMonth(){//获得上月第一天~上月最后一天年月日
    var thismonth={};
        var date = new Date();
        var year=date.getFullYear();
        var month=date.getMonth();
        var day=date.getDate();
        if(month<10){
            month="0"+month;
        }
        if(month==0){
            year=year-1;
            month = 12;
        }	
    thismonth.start_day=year+ '-' + month + '-' +'01'



    var lastday=new Date(year,month,0).getDate();
    thismonth.end_day=year+'-'+month+'-'+lastday;

    return thismonth
}

// 季度
// 本季度
function getThisQuarterly(){
    var ThisQuarterly={};
    var date = new Date();
    var year=date.getFullYear();
    var month=getQuarterSeasonStartMonth(date.getMonth());
    var day=date.getDate();
    if(month<10){
        month="0"+month;
    }
    ThisQuarterly.start_day=year+ '-' + month + '-' +'01'
    var endmonth =getQuarterSeasonStartMonth(date.getMonth())+2
    var lastday=new Date(year,endmonth,0).getDate();
    if(endmonth<10){
        month="0"+month;
    }
    if (lastday < 10) {
        lastday = '0' + lastday
    }
    ThisQuarterly.end_day=year+ '-' + endmonth + '-' +lastday
    return ThisQuarterly
}

/**
* 得到本季度开始的月份
* @param month 需要计算的月份
***/
function getQuarterSeasonStartMonth(month) {
    var spring = 1; //春 
    var summer = 3; //夏 
    var fall = 6;   //秋 
    var winter = 9; //冬 
    //月份从0-11 
    if (month < 3) {
        return spring;
    }

    if (month < 6) {
        return summer;
    }

    if (month < 9) {
        return fall;
    }

    return winter;
}



// 本年
function getThisyear() {
    var Thisyear={};
    var date = new Date();
    var year = date.getFullYear();
    Thisyear.start_day = year + '-' + '01' + '-' + '01';
    Thisyear.end_day = year + '-' + '12' + '-' + '31';
    return Thisyear
}
// 去年
function getlastyear() {
    var lastyear={};
    var date = new Date();
    var year = date.getFullYear();
    lastyear.start_day = year-1 + '-' + '01' + '-' + '01';
    lastyear.end_day = year-1 + '-' + '12' + '-' + '31';
    return lastyear
}

// 读取文件内容
function fileRead(filePath){
    var stat=fs.lstatSync(__dirname+"/"+filePath);
    if (stat.isFile()) {
        var content = fs.readFileSync(__dirname+"/"+filePath, 'utf-8');
        return content
    }
}


function fileDate(start,end){//读取全部本地缓存新闻文件
    /**
     * 读取全部本地缓存新闻文件
     */
    var readDir = fs.readdirSync('./news/');
    var re={}
    var fuck = ""
    var firstFileName=readDir[0] 
    var lastFileName =readDir[readDir.length-1] 
    var fileSum =readDir.length 

    if((typeof(start)=='undefined')||(typeof(end)=='undefined')){
        for (let index = 0; index < readDir.length; index++) {
            var element = readDir[index];
            put="./news/"+element
            fuck+=fileRead(put)
        }

    }else{     
        for (let index = 0; index < readDir.length; index++) {
            var element = readDir[index];
            var b =path.posix.basename(element,'.md')
            if((b>=start)&(b<=end)){
                put="./news/"+element
                fuck+=fileRead(put)
            }
        }
    }
    re.c=fuck
    re.fs=fileSum
    re.fn=firstFileName
    re.lfn=lastFileName
    return re
}

function first(){
    /**
     * 第一次全面分析
     * 如果分析文件为空，则执行第一次全面分析
     */
    var c={}
    var f=fileDate()
    f=regexp(f.c)
    f=nodejieba.cut(f)
    f=stopWords(f)
    f=StatisticsWordfrequency(f)
    c.all=f
    fs.writeFileSync('./analysisout/analysis.json', JSON.stringify(c) , 'utf-8');
    // console.log(JSON.parse(fs.readFileSync('./analysisout/analysis.json', 'utf8')))
    var tt= filterWordfrequency(JSON.parse(fs.readFileSync('./analysisout/analysis.json', 'utf8')).all,500)
    console.log(sortNumber(tt)) // 排序
}

function dailySum(){
    /**
     * 日常每天进行计算并累计
     */
// fileDate(filePath)
// console.log(dateStr)
// console.log(getThisWeekData()['start_day']) // 本周第一天
// console.log(getThisWeekData()['end_day']) // 本周最后一天
// console.log(getLastWeekData()['start_day']) // 上周第一天
// console.log(getLastWeekData()['end_day']) // 上周最后一天
// console.log(getThisMonth()['start_day']) // 本月第一天
// console.log(getThisMonth()['end_day']) // 本月最后一天
// // getLastMonth
// console.log(getLastMonth()['start_day']) // 上月第一天
// console.log(getLastMonth()['end_day']) // 上月最后一天
// // getThisyear
// console.log(getThisyear()['start_day']) // 本年第一天
// console.log(getThisyear()['end_day']) // 本年最后一天
// console.log(getThisQuarterly()) // 本季度
// console.log(getlastyear())//去年
}



function regexp(str){// 获取全部中文
    /**
     * 通过正则表达式过滤特殊符号、字母等，粗略过滤不需要的内容。
     * 
     */
    // var regEx = /[\n-'--;“"”?？：:,，。.；#*（）《》【】[\/\]()、a-z0-9A-Z原文新闻联播央视网快评消息求是总书记更新于]/g
    // return str.replace(regEx,"").trim()
    var regEx=/[\u4e00-\u9fa5]/g
    return str.match(regEx).join("")
}

function stopWords(result){// 停用词，过滤。
    /**
     * 停用词，过滤。
     * result 原始文件切片后数据
     * 返回 过滤后数据
     */
    var counts = []
    var s = fs.readFileSync(`./stop_words.utf8`, 'utf8')
    var sarry = s.split('\n')
    for(i in result){
        var t =false
        for (ii in sarry){
            if(result[i].includes(sarry[ii])){
                // console.log(result[i])
                t=true
                break
            }  
        }
        if(t==false){
            counts.push(result[i])
        }
    }
    return counts
}

function StatisticsWordfrequency(str){//统计词频，需要专递切词以后数据
     var counts = {}
     str.forEach(function(item) { 
       counts[item] = (counts[item] || 0) + 1; 
     });
     return counts
}

function filterWordfrequency(str,num){// 过滤频次大于指定次数的数据
    /**
     * 过滤频次大于指定次数的数据
     * str 传递统计词频后数据
     * num 过滤大于等于的次数
     */
    var counts = {}
    for(var i in str){
        // console.log(counts[i])
        if (str[i]>=num) {
            // console.log(i,":",counts[i])
            counts[i]=str[i]
        }
    }
    return counts
}

function sortNumber(list)// 降序排序
{
    counts={}
    var array=Object.keys(list).sort(function(a,b){return list[b]-list[a]})// 升序   list[a]-list[b]  // 降序 list[b]-list[a]
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        counts[element]=list[element]
        
    }
    return counts
}

async function main(){
// 判断是否有历史统计数据，没有就全面计算
if (1) {
    first()
}else{
    dailySum()
}
    
}
// main()



module.exports = {
    fileRead,
    regexp,
  };
  
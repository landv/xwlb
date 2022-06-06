// node-crawler 是一个轻量级的node.js爬虫工具
const Crawler = require("crawler");
// 文件
const fs = require("fs");
// cheerio是nodejs的抓取页面模块
const cheerio = require("cheerio");
// turndown HTML转换为Markdown
const TurndownService = require("turndown");
const turndownService = new TurndownService();
//  Showdown.js 是一个基于JavaScript 开发环境的MarkDown 语法解释工具
const showdown = require("showdown");
const converter = new showdown.Converter();
const { isDate, parseDate, formatDate, formatDate2, formatDate3 } = require("./util");
const args = process.argv.slice(2);

const date1 = +new Date(2010, 0, 1);
const date2 = +new Date(2016, 01, 03);
const updateReadme = require("./readme").update;

const today = new Date().setHours(23, 59, 59);
console.log("Today is", formatDate(today));
const oneDay = 24 * 60 * 60 * 1000;

const options = {
  jQuery: {
    name: "cheerio",
    options: {
      decodeEntities: false,
      normalizeWhitespace: true,
      xmlMode: true,
    },
  },
  maxConnections: 8,
};
// 获取URL
function getUrl(date) {
  // 有两种url组合，2022年现在都是`https://tv.cctv.com/lm/xwlb/day/${str}.shtml`;
  if (!isDate(date)) {
    date = new Date(date);
  }
  if (+date < date1) {
    console.log(formatDate(date), "< date1", formatDate(date1));
    return "";
  }
  if (+date > today) {
    console.log(formatDate(date), "> today", formatDate(today));
    return "";
  }

  const str = formatDate2(date);

  if (+date < date2) {
    // 暂时不解析
    console.log(formatDate(date), "< date2", formatDate(date2));

    return "";
    return `http://news.cctv.com/program/xwlb/${str}.shtml`;
  }

  return `https://tv.cctv.com/lm/xwlb/day/${str}.shtml`;
}

// 获取新闻详细信息队列，URL
function getNewsDetailQueues(date) {
  const urls = [];
  const url = getUrl(date);
  if (!url) {
    return urls;
  }
  // Promise 是抽象异步处理对象以及对其进行各种操作的组件
  return new Promise((resolve) => {
    const c = new Crawler({
      // 三个点 https://segmentfault.com/a/1190000021975579
      ...options,
      callback: (error, res, done) => {
        const uri = res.request.uri;
        const href = uri.href;
        console.log(formatDate(date), href);
        if (error) {
          console.error(error);
          done();
          return;
        }

        const $ = res.$;

        $("a").each((i, ele) => {
          if (i > 0) {
            // 替换
            urls.push($(ele).attr("href").replace("http://news.cntv.cn/", "http://tv.cctv.com/"));
          }
        });

        done();
      },
    });
    // 查询
    c.queue(url);
    c.on("drain", () => {
      resolve(urls);
    });
  });
}


// 获取新闻详情
function getNewsDetail(date, queues) {
  // console.log(queues)
  // TODO 判断URL是否能够正常访问，不能就跳过。
  const result = [];
  return new Promise((resolve) => {
    const c = new Crawler({
      ...options,
      callback: (error, res, done) => {
        const uri = res.request.uri;
        const href = uri.href;
        if (error) {
          console.log(formatDate(date), href);
          console.error(error);
          done();
          return;
        }

        const $ = res.$;
        // console.log($);
        // 新闻详情里面cnt_nav h3是标题

        var ti = ""
        var ht = ""
        // 进行时间判断，2022年5月22日以后使用新的方式获取
        // console.log(date)
        if (formatDate(date) > '2022-05-22') {
          // const title = $(".tit").text().trim().replace("[视频]", "");
          // const html = $(".content_area").html();
          ti = ".tit"
          ht = ".content_area"
        } else {
          ti = ".cnt_nav h3"
          ht = ".cnt_bd"
        }
        const title = $(ti).text().trim().replace("[视频]", "");
        //const content = $(".cnt_bd").text();
        // 新闻详情里面cnt_bd 是文字内容。在20:00的时候可能不完整。
        const html = $(ht).html();

        console.log(title);
        // console.log(html);
        const markdown = turndownService.turndown(html);


        // console.log(markdown);

        const index = queues.indexOf(href);
        result[index] = {
          href,
          title,
          html,
          markdown,
        };

        done();
      },
    });

    c.queue(queues);
    c.on("drain", () => {
      resolve(result);
    });
  });
}

async function toFile(date, result, cb) {
  const main = result
    .map((r) => {
      return `## ${r.title}\n\n${r.markdown}\n
*[原文](${r.href})*
`;
    })
    .join("\n");

  //   const { year, month, day } = parseDate(date);
  const dateStr = formatDate(date);
  const content = `# 新闻联播 ${dateStr}\n\n${main}\n
更新于 ${formatDate3(new Date())}
  `;

  const html = converter.makeHtml(content);

  fs.writeFileSync(`./news/${dateStr}.md`, content);
  fs.writeFileSync(`./html/${dateStr}.html`, html);
}

// 开始时间，结束时间；  async异步
async function main(startDate, endDate) {
  if (!endDate) {
    endDate = startDate;
  }
  days = (+endDate - +startDate) / oneDay;

  const dates = new Array(days + 1).fill(0).map((v, i) => {
    return new Date(+startDate + i * oneDay);
  });
  console.log(
    "dates",
    dates.map((d) => {
      return formatDate(d);
    })
  );
  const ps = dates.map((nowDate) => {
    const p = (async (date) => {
      const queues = await getNewsDetailQueues(date);
      console.log("queues::::")
      console.log(queues);
      if (!queues.length) {
        console.log(`${formatDate(nowDate)} 暂无新闻联播`);
        return;
      }

      const result = await getNewsDetail(date, queues);
      await toFile(date, result);
    })(nowDate);

    return p;
  });
  // 等待执行完毕
  await Promise.all(ps);

  // 更新Readme
  updateReadme();
  console.log("done");

  //   return;
}

// 断言args传参
if (args.length) {
  const date1 = new Date(args[0]);
  const date2 = args[1] ? new Date(args[1]) : date1;
  main(date1, date2);
} else {
  let date1 = new Date();
  const date2 = new Date(+date1);
  main(date1, date2);
}

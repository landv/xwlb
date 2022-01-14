"use strict";
const nodemailer = require("nodemailer");
const fs = require('fs')
const { isDate, parseDate, formatDate, formatDate2, formatDate3 } = require("./util");
// 定义时间
const dateStr = formatDate(new Date())
const args = process.argv.slice(2);
let htmldata=""

// 使用async..await 创建执行函数
async function main() {
    // 如果你没有一个真实邮箱的话可以使用该方法创建一个测试邮箱
    // let testAccount = await nodemailer.createTestAccount();
  
    // 创建Nodemailer传输器 SMTP 或者 其他 运输机制
    let transporter = nodemailer.createTransport({
      host: "smtp.qq.com", // 第三方邮箱的主机地址
    //   service:'qq',
      port: 465,// SMTP 端口
    //   secure: false, // true for 465, false for other ports
    secureConnection: true, // 使用了 SSL
      auth: {
        user: args[0], // 发送方邮箱的账号 secrets.MAILLUSER
        pass: args[1], // 邮箱授权密码 secrets.MAILLPASS
      },
    });
    try {
        const htmldata = fs.readFileSync(`./html/${dateStr}.html`, 'utf8')
        // TODO 解析数据分析数据。
        // const sisiout = fs.readFileSync(`./analysisiout/${dateStr}.html`, 'utf8')
        // htmldata = fs.readFileSync(`./html/2022-01-09.html`, 'utf8')
        console.log(htmldata)
      } catch (err) {
        console.error(err)
      }
  
    // 定义transport对象并发送邮件
    let mailOptions = {
    // secrets.MAILL
      from: `"landvcn" ${args[2]}`, // 发送方邮箱的账号
      to: `${args[2]}`, // 邮箱接受者的账号,这里有腾讯限制不能进行群发。
      subject: dateStr+"新闻联播", // Subject line
      // text: "别看了，今天没有新闻~~~", // 文本内容
        //   `./html/${dateStr}.html` 文件位置
      html: htmldata, // html 内容, 如果设置了html内容, 将忽略text内容
    };
    // 执行发送
    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('邮件已发送成功,邮件id: %s', info.messageId);
  });
  }
  
  main().catch(console.error);
  

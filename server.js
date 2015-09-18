var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
var formidable = require('formidable');
var cookieParser = require('./cookieParser');
var querystring = require('querystring');
var currentUser = {};
var EXPIRE_TIME = 360000;
var listenPort = 8080;//监听的端口
var key = 'spKey';

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true);
    var pathname = urlObj.pathname;
    var cookieObj = querystring.parse(req.headers.cookie, '; ');
    //var sessionId = cookieObj[key];
    //var sessionObj = currentUser[sessionId];
    var now = Date.now();
    var query = urlObj.query;//取?后面跟的参数，是个对象，就不用下面注释的方法来处理了
    res.setHeader("Server", "Node 4.0/V8");
    //if (query) {//如果请求的URL不带参数，会变成undefined，导致报错，这里要判断一下
    //    var reg = /([^?=&]+)=([^?=&]+)/g;
    //    var queryObj = {};
    //    query.replace(reg, function () {
    //        queryObj[arguments[1]] = arguments[2]
    //    });
    //}
    if (pathname == "/favicon.ico") {
        res.statusCode = 404;
        res.end(http.STATUS_CODES[404]);
    } else if (pathname == "/post") {
        var formTabdata = formidable.IncomingForm();

        if (query.action == 'reg') {
            formTabdata.parse(req, function (err, fields) {
                var userMessage = ';username=' + fields.username + "&pass=" + fields.password;
                fs.appendFileSync('./userList.txt', userMessage, 'utf-8');//将注册的用户保存到userList.txt文本中


                res.writeHead(302, {
                    "Location": "login.html"
                });
                //res.statusCode = 302;//用户注册成功后跳转到登录页面
                //res.setHeader("Location", "login.html");
                res.end('注册成功，跳转到登录页');
            });
        } else if (query.action == 'login') {
            formTabdata.parse(req, function (err, fields) {
                var userTemStr = fs.readFileSync('./userList.txt', 'utf-8');
                if (userTemStr) {
                    //存到userList.txt的格式---->;username=sp&pass=123;username=sp2&pass=1233
                    //fields.username是表单提交过来的用户名
                    //fields.password是表单提交过来的密码
                    var usersStr = userTemStr.split(';').slice(1);
                    console.log(usersStr);
                    usersStr.forEach(function (item) {
                        item = querystring.parse(item);
                        if (item.username == fields.username && item.pass == fields.password) {
                            //res.writeHead(302, {"Location": "index.html"});
                            console.log('用户名密码正确，跳转页面并写入session');


                            var session_Obj = {username:item.username,expTime: new Date(now + EXPIRE_TIME)};
                            var sessionId = now + '_' + Math.random();
                            session_Obj[sessionId] = session_Obj;
                            console.log(session_Obj);
                            res.writeHead(200, {
                                'Content-Type': 'text/html;charset=utf8',
                                'Set-Cookie': cookieParser.serialize(key, sessionId)
                            });



                            res.end(session_Obj.username);
                        } else {
                            res.writeHeader(404, {'Content-Type': "text/html;charset=utf-8"});
                            res.end('用户名密码错误');
                        }
                    });
                } else {
                    res.writeHead(404, {'Content-Type': 'text/html;charset=utf8'});
                    var str='<div>userList.txt内空空如也<a href="reg.html">注册</a>后登录</div>';
                    res.end('userList.txt内空空如也')
                }
            });

        } else {
            res.writeHeader(404, {'Content-Type': "text/html;charset=utf-8"});
            res.end('没这个参数')
        }

        //var session={};//数据暂存在这里，一般存在数据库里
        //var EXPIRE_TIME=360000;//session过期时间
        //var result=[];
        //req.on('data',function(chunk){//
        //    result.push(chunk);//把传进来的数据流放到一个数组里
        //});
        //req.on('end',function(){
        //    var body=Buffer.concat(result).toString();//把Buffer拼接并转成字符串
        //    var bodyObj=querystring.parse(body);//把字符串转成对象，好存在session里
        //    for(var key in bodyObj){
        //        if(key=='username'){
        //            var KEY=bodyObj[key];
        //            //把提交的表单name为username的值也就是用户名付给KEY，下面使用
        //        }
        //    }
        //
        //    var cookieObj = querystring.parse(req.headers.cookie,'; ');
        //    if(cookieObj[KEY]){//判断是否是已注册用户
        //        var sessionId = cookieObj[KEY];
        //        var sessionObj = session[sessionId];
        //        if(!sessionObj || !(sessionObj.expTime) || sessionObj.expTime.getTime()<now){
        //            var sessionObj = {expTime:new Date(new Date().getTime()+EXPIRE_TIME)};
        //            var sessionId =now+'_'+Math.random();//给用户购物卡号
        //            session[sessionId] = sessionObj;
        //            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8',
        //                'Set-Cookie':cookieParser.serialize(KEY,sessionId,{})});
        //            res.end('欢迎你'+KEY+'，你的账号已到期');
        //        }else{
        //            sessionObj.expTime = new Date(now + EXPIRE_TIME);
        //            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        //            res.end('欢迎你'+KEY+'，你已经重复登录，过期时间已经延长至'+sessionObj.expTime);
        //            //if(sessionObj.balance ==0){
        //            //    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        //            //    res.end('你卡里没钱了，等会再来吧');
        //            //}else{
        //            //    sessionObj.expTime = new Date(now + EXPIRE_TIME);
        //            //    sessionObj.balance = sessionObj.balance - 10;
        //            //    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        //            //    res.end('欢迎你老朋友，你的余额是'+sessionObj.balance);
        //            //}
        //        }
        //    }else{//没有就是新注册用户
        //        var sessionObj = {expTime:new Date(new Date().getTime()+EXPIRE_TIME)};
        //        var sessionId =now+'_'+Math.random();//给用户一个唯一的ID，不要太简单
        //        session[sessionId] = sessionObj;
        //        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8',
        //            'Set-Cookie':cookieParser.serialize(KEY,sessionId,{})});
        //        res.end('欢迎你'+KEY+'，你的有效时间到'+sessionObj.expTime+'为止');
        //    }
        //res.end(JSON.stringify(bodyObj));//把这个对象转成JSON的字符串才能输出到页面
        //});


    }
    //if(pathname=='/'){
    //    res.writeHeader(200, {'Content-Type': "text/html;charset=utf-8"});
    //    fs.readFile('index.html',function(err,data){
    //        res.end(data);
    //    })
    //}
    else {
        var reqFilename = "." + pathname;
        fs.exists(reqFilename, function (exists) {
            if (exists) {
                if (reqFilename == './') {
                    res.writeHeader(200, {'Content-Type': "text/html;charset=utf-8"});
                    fs.createReadStream('reg.html').pipe(res);
                } else if (reqFilename == './index.html') {
                    var cookieObj = querystring.parse(req.headers.cookie,'; ');
                    console.log(cookieObj+'----cookieObj');
                    res.writeHeader(200, {'Content-Type': "text/html;charset=utf-8"});
                    if (cookieObj[key]) {//判断客户端传过来的头部cookie里有没有sessionId
                        var sessionId=cookieObj[key];
                        var sessionObj=session[sessionId];
                        if(sessionObj){
                            var str = '<div>欢迎你' + key + '</div>';
                            var htmlstr = fs.readFileSync('./index.html', 'utf8');
                            htmlstr = htmlstr.replace("@login", str);
                            res.end(JSON.stringify(cookieObj));
                        }else{
                            res.end('session不合法')
                        }


                    } else {
                        str = '<div>你还没有登录请先<a href="login.html">登录</a>后进入</div>';
                        htmlstr = fs.readFileSync('./index.html', 'utf8');
                        htmlstr = htmlstr.replace("@login", str);
                        res.end(htmlstr);
                    }
                } else if (fs.statSync(reqFilename).isFile()) {
                    res.writeHeader(200, {'Content-Type': (mime.lookup(reqFilename)) + ";charset=utf-8"});
                    //readFile还是不要写"utf-8"的好，你也不知道要读的是什么文件
                    //fs.readFile(reqFilename, function (err, data) {
                    //
                    //    res.end(data);
                    //})
                    fs.createReadStream(reqFilename).pipe(res);

                }
            } else {
                res.writeHeader(404, {'Content-Type': "text/html;charset=utf-8"});
                //console.log(mime.lookup(reqFilename));//这个玩意会根据请求的后缀判断
                res.end("你要找的文件不存在--->404" + http.STATUS_CODES[404]);
            }
        });
    }
}).listen(listenPort);
console.log("服务已启动，监听" + listenPort + "端口");
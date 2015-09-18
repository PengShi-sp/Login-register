
function Event(name){
    this.name=name;
    this._events={};
}
//监听
Event.prototype.on=function(eventName,listener){
  if(this._events[eventName]){
      this._events[eventName].push(listener);//如果名字已经存在了就把listener这个方法push到数组里
  }else{
      this._events[eventName]=[listener]
  }
};
//发射
Event.prototype.emit=function(eventName){
    var handlers=this._events[eventName];
    var args=Array.prototype.slice.call(arguments,1);
    for(var i=0;i<handlers.length;i++){
        handlers[i].apply(this,args);
    }
};
Event.prototype.removeListener=function(eventName,listener){
    this._events[eventName].pop(listener);
};
var teacher=new Event('teacher');

var me=function(name){
    console.log('我打'+name)
};
var qt=function(name){
    console.log('其他打'+name)
};
teacher.on('sp',me);
teacher.on('sp',qt);
//teacher.on('qt',function(name){
//    console.log('其他打'+name)
//});
teacher.removeListener('sp',qt);
teacher.emit('sp','sss');
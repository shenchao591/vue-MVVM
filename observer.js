class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    //将原有data的属性 改成get和set的形式
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key=>{
        //劫持

          this.defineReactive(data,key,data[key]);
          this.observe(data[key]);//递归劫持


      })
    }
  }

  defineReactive(obj,key,value){
    let _this=this;
    let dep=new Dep()//每个变化的数据 都会对应一个数组 这个数组存放所有更新的操作
    Object.defineProperty(obj,key,{
      enumerable:true,
      configurable:true,
      get(){
        Dep.target&&dep.addSub(Dep.target)
        return value;
      },
      set(newValue){
        if(newValue!==value){
          //当新的值是个对象时候 也要劫持
          _this.observe(newValue);
          value=newValue;
          dep.notify();//通知数据更新
        }

      }

    })
  }
}
//发布订阅模式
class Dep{
  constructor(){
    this.subs=[];
  }
  addSub(watcher){
    this.subs.push(watcher);
  }
  notify(){
    this.subs.forEach(watcher=>{
      watcher.update();
    })
  }
}
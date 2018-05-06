//观察者的目的 ：给需要变化的元素增加一个观察 当数据变化后执行对应的方法
// 用新的值和老值进行对比 如果发生变化 调用更新方法
class Watcher{
  constructor(vm,expr,callback){
    this.vm=vm;
    this.expr=expr;
    this.callback=callback;
    //先获取下旧值
    this.oldValue=this.get();

  }
  getVal(vm,expr){
    expr=expr.split('.');//[message,a]
    return expr.reduce((prev,next)=>{
      return prev[next];
    },vm.$data)
  }
  get(){
    Dep.target=this;
    let value=this.getVal(this.vm,this.expr)
    Dep.target=null
    return value;
  }
  //对外暴露的方法
  update(){
    let newValue=this.getVal(this.vm,this.expr);
    let oldValue=this.oldValue;
    if(newValue!==oldValue){
      this.callback(newValue);
    }
  }
}

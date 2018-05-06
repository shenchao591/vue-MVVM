class MVVM{
  constructor(options){
    //将后续用到的挂载到实例
    this.$el=options.el;
    this.$data=options.data;
    if(this.$el){
      //数据劫持
      new Observer(this.$data);
      //代理  将this.$data代理到this上
      this.proxyData(this.$data);
      //编译
      new Compile(this.$el,this);

    }
  }
  proxyData(data){
    Object.keys(data).forEach(key=>{
      Object.defineProperty(this,key,{
        get(){
          return data[key];
        },
        set(newValue){
          data[key]=newValue;
        }
      })
    })
  }
}
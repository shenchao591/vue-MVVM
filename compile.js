class Compile {
  //vm是mvvm的实例
  constructor(el, vm) {
    this.el = this.isElement(el) ? el : document.querySelector(el);
    this.vm = vm;
    if (this.el) {
      //1.先把真实的dom移入到内存中进行操作 减少回流
      let fragment = this.node2Fragment(this.el);
      // 2.编译=>提取想要的元素节点 v-model和文本节点{{}}
      this.compile(fragment);
      //2.把编译好的fragment赛回到页面中
      this.el.appendChild(fragment)

    }
  }

  /*专门写一些辅助的方法（工具方法）*/

  //判断是不是元素节点
  isElement(node) {
    return node.nodeType === 1
  }
  //是不是指令
  isDirective(name){
    return name.includes('v-');
  }

  /*核心的方法*/
  node2Fragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
  compileElement(node){
    let attrs=node.attributes;
    Array.from(attrs).forEach((attr)=>{
      //判断属性名字是否包含v-
      let attrName=attr.name;
      if(this.isDirective(attrName)){
        //取到对应的值放到节点中
        let expr=attr.value;
        // let type=attrName.slice(2);
        let [,type]=attrName.split('-');
        //node this.vm.$data expr
        CompileUtil[type](node,this.vm,expr);
      }
    })
  }
  compileText(node){
    // 找{{}}
    let expr=node.textContent;//取文本中的内容
    let reg=/\{\{([^}]+)\}\}/g;
    if(reg.test(expr)){
      //node this.vm.$data expr
      CompileUtil['text'](node,this.vm,expr);
    }

  }
  compile(fragment){
    let childNodes=fragment.childNodes;//只能取到第一层的node
    Array.from(childNodes).forEach((node)=>{
      if(this.isElement(node)){//是元素节点
        //编译元素 找v-
        this.compileElement(node);
        this.compile(node);//可能不只一层 递归
      }else{//文本节点
        //编译文本 找{{}}
        this.compileText(node);
      }

    })
  }
}

CompileUtil={
  getVal(vm,expr){
    expr=expr.split('.');//[message,a]
   return expr.reduce((prev,next)=>{
      return prev[next];
    },vm.$data)
  },
  setValue(vm,expr,value){
    expr=expr.split('.');//[message,a]
     expr.reduce((prev,next,currentIndex)=>{
      if(currentIndex===expr.length-1){
        prev[next]=value;
      }
      return prev[next];
    },vm.$data)

  },
  getTextVal(vm,expr){
   return expr.replace(/\{\{([^}]+)\}\}/g,(a,b)=>{
      return this.getVal(vm,b);
    })
  },
  text(node,vm,expr){//文本处理 expr代表的是{{}}里面的内容
    let updateFn=this.updater['textUpdater'];
    let value=this.getTextVal(vm,expr);
    //{{message.a}} {{message.b}}
    //循环给每个文本添加watcher
    // console.log(expr);
    expr.replace(/\{\{([^}]+)\}\}/g,(a,b)=>{
      new Watcher(vm,b,(newValue)=>{
        //注意：这里不用直接用newValue去更新 否则都会变成一样的
        // updateFn&&updateFn(node,newValue) 这是错误的做法
        updateFn&&updateFn(node,this.getTextVal(vm,expr))//应该这样

      })
    })

    //这里应该watch 数据变化了 应该调用watch的callback函数
    // new Watcher(vm,expr,(newValue)=>{
    //   updateFn&&updateFn(node,newValue)
    // })


    updateFn&&updateFn(node,value)
  },
  model(node,vm,expr){//输入框处理
    let updateFn=this.updater['modelUpdater'];
    //这里应该watch 数据变化了 应该调用watch的callback函数
    new Watcher(vm,expr,(newValue)=>{
      updateFn&&updateFn(node,newValue)
    })
    //给输入框绑定输入事件
    node.addEventListener('input',(e)=>{
      let newValue=e.target.value;
      this.setValue(vm,expr,newValue)
    },false)

    //expr 可能是message.a.b类似对象套对象的深层
    updateFn&&updateFn(node,this.getVal(vm,expr))
  },
  updater:{
    textUpdater(node,value){
      node.textContent=value;
    },
    modelUpdater(node,value){
      node.value=value;
    }
  }

}
### prototype 与 __proto__

#### 先有的Object.prototype， Object.prototype构造出Function.prototype，然后Function.prototype构造出Object和Function。
`
  function Foo () {}
  var f = new Foo()
  var o = new Object()
  <!-- 实例的原型指针（__proto__） 指向构造函数的原型链 -->
  f.__proto__ === Foo.prototype
  Foo.prototype.constructor === Foo
  Foo.__proto__ === Function.prototype
  Foo.prototype.__proto__ === Object.prototype

  o.__proto__ === Object.prototype
  Object.__proto__ === Function.prototype
`
#### 如下图
![原型结构图](https://pic4.zhimg.com/0c8883d6ec7d29e65f53c82f8473e3a9_r.jpg)

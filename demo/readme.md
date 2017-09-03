## chunk Send 数据约定  
> server 向 client 传递参数，client进行解析。 约定交流方式。  



### 字段（弃用拼接buffer方式）： 
 1. 发送的方法：采用哪种方法发送数据，在前端使用约定的解释器解释
    0 - 最开始的发送全图
    1 - 发送单行数据
    2 - 发送起止点
    3 - 发送图片标签，同时显示多个图片！  
    占用一个 Uint8Array(1)

 2. 图片类 channel
    所有图片都要resize
    0 - 截屏图
    1 - 标准图
    2 - 截屏二值图
    3 - 标准二值图
    4 - 差值图 （前端算，还是后端算？ 后端算完全贴近后端计算过程）
    5 - （非图片）
    处理规则，横排摆放
    
    占用 Uint8Array （1）
3. 保留 - 图片id
   如果需要显示多个图片的对比？
   最多同时255个
    占用 Uint8Array （1）
4. 宽
   
   width new Uint16Array
   占用 Uint8Array （2）
5. 高
  
   height new Uint16Array
    占用 Uint8Array （2）
6. 行号

   line  new Uint 16 Array
    占用 Uint8Array （2）
7. 起点 
  
   startPoint new Uint32Array
   占用 Uint8Array （4）
8. 终点，选择性处理

   stopPoint new Uint32Array
   占用 Uint8Array （4）
   
9. rawdata
   剩余所有

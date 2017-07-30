# Mac 平台自动任务点击

**Section** 
1. child_process 运行`终端命令`和`osascript`
2. img-decode 图形识别


## Sections

### 终端命令  

**cliClick**  
通过终端中命令，完整模拟点击桌面任意位置。  
使用其他的软件，遇到诸多问题，如添加辅助不管用，需要sudo，mousedown 之后 mouseup丢失，后续操作失效    
osascript 中 systemEvents 点击无效，找不到UI Component

**截图**  
系统自带截图，能够设定截图位置

### AppleScript （通过osascript执行）

**激活窗口**  
osascript 中 tell application `[NAME]` to activate  

**获取位置**
set the props to ... 

**遍历窗体**  
repeat window in ...

### 点击区域计算  

设定范围，然后范围内随机取点

### 图片信息

**dataDecoder**  
使用 pngjs jpeg-js 分别处理 png、jpg图片

**操作图片像素信息**  
区域截取，根据配置信息，截指定区域，用来做对比
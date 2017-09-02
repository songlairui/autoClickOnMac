# 通过Vysor自动点击Android游戏 

> 使用了mac下的截屏与获取窗体位置，所以只支持mac   
 Vysor 只支持部分Android 手机。需要能够有效点击

## 使用方法  

### 主要应用场景   

使用前准备：  

 - Vysor 连接手机，记录Vysor 窗体名称
 - 在手机上打开阴阳师游戏
 - 为执行脚本的工具（如 脚本编辑器、终端、vscode） 在系统的辅助功能中添加权限，以能够获取窗体位置尺寸
 - 游戏中，式神阵容预先配置好。

```bash

cd action 
node 业原火.js
; 然后会自动刷业原火

```

### DEMO 场景 

**图片缩小**

**图片灰度**  

**图片转黑白图**  

**图片对比**

### Section
1. child_process 运行`终端命令`和`osascript`
2. img-decode 
3. Otsu 图形识别


## Sections

### 终端命令  

**cliClick**  
通过终端中命令，完整模拟点击桌面任意位置。  
使用其他的软件，遇到诸多问题，如添加辅助不管用，需要sudo，mousedown 之后 mouseup丢失，后续操作失效    
osascript 中 systemEvents 点击无效，找不到UI Component

**截图**  
系统自带截图，能够设定截图位置  
将截图保存在临时目录中，

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

**处理图片信息，相似对比准备**  
图像灰度处理
标齐灰度范围
依据方差标识

## TODO  

使用opencv


## TOFIX  

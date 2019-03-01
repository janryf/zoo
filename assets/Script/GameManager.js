// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var STATE_IDLE = 0;
var STATE_DRAWING = 1;
var STATE_DEALING = 2;

var GROUP_LIMIT = 100;

cc.Class({
    extends: cc.Component,
    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.MODE = 0;
        this.state = STATE_IDLE;
        this.allRects = [];
        for(var i = 0; i < 8; i++){
            var line = [];
            for(var j = 0; j < 6; j++){
                var node = cc.find('Canvas/rects/rect' + i.toString() + j.toString());
                line.push(node);
                //node.opacity = 100
                //node.color.setA(0.5);
                //console.log(node.name);
            }
            this.allRects.push(line);
        }

        this._way = [];
        this._state = STATE_IDLE;
        this._pref = this.getComponent('Pref');
        this._maxLevel = 1;
        this._txtMaxLevel = cc.find('Canvas/txtMaxLevel').getComponent(cc.Label);
        this._txtMaxLevel.string = '最大方块等级：' + this._maxLevel;
        
        this._countReset = 0;
        this._txtReset = cc.find('Canvas/txtReset').getComponent(cc.Label);
        this._txtReset.string = '次数：' + this._countReset;

        this._gameLevel = 1;
        this._txtGameLevel = cc.find('Canvas/txtGameLevel').getComponent(cc.Label);
        this._txtGameLevel.string = '游戏等级：' + this._gameLevel;
        this._gameLevelObject = 2;

        this._panelLevelUp = cc.find('Canvas/panelLevelUp');
        this._panelLevelUp.active = false;

        this._countGroup = 0;
        this._txtGroup = cc.find('Canvas/txtGroup').getComponent(cc.Label);
        this._txtGroup.string = '聚合方块数：' + this._countGroup;
        this._groupObject = GROUP_LIMIT;
    },

    calcAllLevel(){
        var allBase = 0;
        for(var i = 0; i < this.allRects.length; i++){
            for(var j = 0; j < this.allRects[0].length; j++){
                var level = this.allRects[i][j].getComponent('rect').level;
                var base = Math.pow(2, level - 1);
                allBase += base;
            }
        }
        var avgBase = allBase / (this.allRects.length * this.allRects[0].length);
        this._gameLevel = Math.log2(avgBase) + 1;
        this._txtGameLevel.string = '游戏等级：' + this._gameLevel;

        if(this._gameLevel > this._gameLevelObject){
            this._panelLevelUp.getComponent('PanelLevelUp').show();
            this._panelLevelUp.getComponent('PanelLevelUp').addTxt('恭喜你升到第' + this._gameLevelObject + '级\n重置次数：' + this._countReset + '\n聚合次数：' + this._countGroup);
            this._gameLevelObject++;
            if(this._countGroup > this._groupObject){
                this._panelLevelUp.getComponent('PanelLevelUp').addTxt('\n-------\n聚合数量突破，升级一个方块');
            }
        }
    },

    updateMaxLevel(level){
        if(level > this._maxLevel){
            this._maxLevel = level;
            this._txtMaxLevel.string = '最大方块等级：' + this._maxLevel;
            this._txtMaxLevel.getComponent(cc.Animation).play('zoom');
        }
    },

    onBtnReset(){
        for(var i = 0; i < this.allRects.length; i++)
            for(var j = 0; j < this.allRects[i].length; j++)
                this.allRects[i][j].getComponent('rect').resetColor();
        this._countReset++;
        this._txtReset.string = '次数：' + this._countReset;
    },

    start () {
    },

    getLevel(){
        if(this._maxLevel <= 3)
            return 1;
        
        var max = this._maxLevel - 1;
        var rand = Math.floor(Math.random() * (max - 1)) + 1;
        return rand;
    },

    doCancel(){
        for(var i = 0; i < this.allRects.length; i++)
            for(var j = 0; j < this.allRects[i].length; j++)
                this.allRects[i][j].opacity = 255;
        this._state = STATE_IDLE;
    },

    doDeal(){
        console.log('处理');
        this._state = STATE_DEALING;

        var addRate = 0.1 * (this._way.length - 3);
        addRate = Math.round(addRate * 10) / 10;

        this._countGroup += this._way.length - 1;
        this._txtGroup.string = '聚合方块数：' + this._countGroup;

        if(this._countGroup > this._groupObject){
            this._panelLevelUp.getComponent('PanelLevelUp').show();
            this._panelLevelUp.getComponent('PanelLevelUp').addTxt('聚合数量突破，升级一个方块');
        }

        for(var i = 0; i < this.allRects.length; i++)
            for(var j = 0; j < this.allRects[i].length; j++)
                this.allRects[i][j].opacity = 255;

        var levelArr = [];
        for(var i = 0; i < this._way.length - 1; i++){
            var rect = this._way[i].getComponent('rect');
            rect.setClear();
            levelArr.push(rect.level);
        }
        var lastRect = this._way[this._way.length - 1].getComponent('rect');
        lastRect.setAdd(levelArr, addRate);
        if(this._way.length >= 4){
            var txtLink = cc.find('Canvas/txtLink').getComponent(cc.Label);
            txtLink.string = this._way.length + '连，增加' + addRate * 100 + '%增长速度';
            this.scheduleOnce(function(){
                txtLink.string = '';
            }, 4);
        }

        this.scheduleOnce(function(){
            var height = this.allRects.length;
            var width = this.allRects[0].length;
            for(var j = 0; j < width; j++){
                var clearedIndexes = [];//找出这一列被空了哪些方块，把下标加进来
                for(var i = 0; i < height; i++){
                    var rect = this.allRects[i][j];
                    if(rect.getComponent('rect').isClear())
                        clearedIndexes.push(i);
                }
                if(clearedIndexes.length == 0)
                    continue;
                
                for(var i = height - 1; i >= 0; i--){
                    var rect = this.allRects[i][j].getComponent('rect');
                    if(rect.isClear())
                        continue;
                    for(var k = 0; k < clearedIndexes.length; k++){
                        if(i < clearedIndexes[k]){
                            var fall = clearedIndexes.length - k;
                            var target = this.allRects[i + fall][j].getComponent('rect');
                            target.copyRect(rect);
                            rect.setClear();
                            break;
                        }
                    }
                }
                
            }

            this.scheduleOnce(this.fall, 0.5);
    
        }, 0.5);
    },

    fall(){
        for(var i = 0; i < this.allRects.length; i++){
            for(var j = 0; j < this.allRects[0].length; j++){
                var rect = this.allRects[i][j].getComponent('rect');
                if(rect.isClear())
                    rect.resetRect();
            }
        }
        if(this._countGroup > this._groupObject){
            this._groupObject += GROUP_LIMIT;
            var allRect = [];
            for(var i = 0; i < this.allRects.length; i++){
                for(var j = 0; j < this.allRects[0].length; j++){
                    var rect = this.allRects[i][j].getComponent('rect');
                    var level = Math.floor(rect.level);
                    if(level < this._maxLevel)
                        allRect.push(this.allRects[i][j]);
                }
            }
            var rand = Math.floor(Math.random() * allRect.length);
            allRect[rand].getComponent('rect').level = this._maxLevel;
            //allRect[rand].getComponent('rect').txtLevel.string = Math.floor(this._maxLevel * 100) / 100;
            //console.log('突破后', this._maxLevel, rand)
            this.scheduleOnce(function(){
                allRect[rand].getComponent('rect').getComponent(cc.Animation).play('zoom');
                this.scheduleOnce(function(){
                    allRect[rand].getComponent('rect').txtLevel.string = Math.floor(this._maxLevel * 100) / 100;
                    this.calcAllLevel();
                }, 1);
            }, 2);
        }
        this._state = STATE_IDLE;
        this.calcAllLevel();
    },

    onTouchStart(startNode){
        if(this._state != STATE_IDLE)
            return;

        this._way = [];
        this._way.push(startNode);
        this._state = STATE_DRAWING;
        for(var i = 0; i < this.allRects.length; i++){
            for(var j = 0; j < this.allRects[i].length; j++){
                var node = this.allRects[i][j];
                if(node != startNode){
                    node.opacity = 90;
                }
            }
        }
    },

    onTouchMove(x,y){
        if(this._state != STATE_DRAWING)
            return;

        var indexI = -1;
        var indexJ = -1;
        for(var i = 0; i < this.allRects.length; i++){
            for(var j = 0; j < this.allRects[i].length; j++){
                var node = this.allRects[i][j];
                var left = node.x - node.width / 2;
                var right = node.x + node.width / 2;
                var top = node.y + node.height / 2;
                var bottom = node.y - node.height / 2;
                if(x >= left && x <= right && y >= bottom && y <= top){
                    indexI = i;
                    indexJ = j;
                    //console.log('!!!!!!')
                    //console.log(node.name);
                    break;
                }
            }
        }

        if(indexI != -1){
            var node = this.allRects[indexI][indexJ];
            //console.log(node.name);
            var startNode = this._way[0];
            var startRect = startNode.getComponent('rect');
            if(node.name == this._way[this._way.length - 1].name)
                return;//在最后一个有效方块里移动
            
            for(var lastI = 0; lastI < this.allRects.length; lastI++){
                for(var lastJ = 0; lastJ < this.allRects[0].length; lastJ++){
                    if(this._way[this._way.length - 1] == this.allRects[lastI][lastJ]){
                        var isEnd = false;
                        if(indexI != lastI && indexJ != lastJ)
                            isEnd = true;

                        if(indexI == lastI){
                            if(Math.abs(indexJ - lastJ) != 1)
                                isEnd = true;
                        }

                        if(indexJ == lastJ){
                            if(Math.abs(indexI - lastI) != 1)
                                isEnd = true;
                        }

                        if(isEnd){
                            if(this._way.length > 2)
                                this.doDeal();
                            else
                                this.doCancel();
                            return;
                        }
                    }
                }
            }

            for(var i = 0; i < this._way.length; i++){
                var wayNode = this._way[i];
                if(wayNode.name == node.name){
                    if(this._way.length > 2)
                        this.doDeal();
                    else
                        this.doCancel();
                    return;//移动到了已被点亮的方块里，结束移动
                }
            }

            
            if(startRect.spriteIndex != node.getComponent('rect').spriteIndex){
                if(this._way.length > 2)
                    this.doDeal();
                else
                    this.doCancel();
                return;//移动到了不同色的方块里，结束
            }

            this._way.push(node);
            node.opacity = 255;
            console.log('加入', node.name);
        }
    },

    onTouchEnd(startNode){
        if(this._state != STATE_DRAWING)
            return;

        if(this._way.length > 2)
            this.doDeal();
        else
            this.doCancel();
    },

    onTouchCancel(startNode){
        if(this._state != STATE_DRAWING)
            return;
        
        if(this._way.length > 2)
            this.doDeal();
        else
            this.doCancel();
    }
    // update (dt) {},
});

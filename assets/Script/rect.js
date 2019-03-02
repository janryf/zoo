// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var STATE_RECT_NORMAL = 0;
var STATE_RECT_CLEAR = 1;

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
        this.gameManager = cc.find('Canvas/Main Camera').getComponent('GameManager');
        this.pref = cc.find('Canvas/Main Camera').getComponent('Pref');
        this.spriteIndex = -1;
        this.state = STATE_RECT_NORMAL;
        this.txtLevel = this.node.getChildByName('level').getComponent(cc.Label);
        this.level = 1;
        this.txtLevel.string = Math.floor(this.level * 100) / 100
    },

    start () {
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            console.log('touchstart', this.name, this.spriteIndex)
            this.gameManager.onTouchStart(this.node);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            //console.log('move', event.getLocation().x)
            this.gameManager.onTouchMove(event.getLocation().x, event.getLocation().y)
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event){
            console.log('touchEND', this.name)
            this.gameManager.onTouchEnd(this.node);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
            console.log('touch cancel', this.name)
            this.gameManager.onTouchEnd(this.node);
        }, this);
        //this.getComponent(cc.Sprite).spriteFrame = this.pref.sprites[0];

        this.spriteIndex = Math.floor(Math.random() * this.pref.gameConfig.json.colorNumber);
        this.getComponent(cc.Sprite).spriteFrame = this.pref.sprites[this.spriteIndex];
    },

    resetRect(){
        this.state = STATE_RECT_NORMAL;
        this.node.opacity = 255;
        this.spriteIndex = Math.floor(Math.random() * this.pref.gameConfig.json.colorNumber);
        this.getComponent(cc.Sprite).spriteFrame = this.pref.sprites[this.spriteIndex];
        this.level = this.gameManager.getLevel();
        this.txtLevel.string = Math.floor(this.level * 100) / 100;
    },

    resetColor(){
        this.spriteIndex = Math.floor(Math.random() * this.pref.gameConfig.json.colorNumber);
        this.getComponent(cc.Sprite).spriteFrame = this.pref.sprites[this.spriteIndex];
    },

    isClear(){
        return this.state == STATE_RECT_CLEAR;
    },

    setClear(){
        this.state = STATE_RECT_CLEAR;
        this.node.opacity = 0;
        this.txtLevel.string = '';
    },

    setAdd(levelArr, addRate){
        var thisBaseNum = Math.pow(2, this.level - 1);
        for(var i = 0; i < levelArr.length; i++){
            var level = levelArr[i];
            var baseNum = Math.pow(2, level - 1);
            thisBaseNum += baseNum;
        }
        thisBaseNum += thisBaseNum * addRate;
        this.level = Math.log2(thisBaseNum) + 1;
        this.gameManager.updateMaxLevel(Math.floor(this.level));
        this.txtLevel.string = Math.floor(this.level * 100) / 100;
        this.node.setParent(this.pref.rectZoom);
        this.getComponent(cc.Animation).play('zoom');
        this.scheduleOnce(function(){
            this.node.setParent(this.pref.rects);
        }, 1);
    },
//6  2.84   7.2   
    copyRect(rect){
        this.state = rect.state;
        this.spriteIndex = rect.spriteIndex;
        this.getComponent(cc.Sprite).spriteFrame = this.pref.sprites[this.spriteIndex];
        this.node.opacity = rect.node.opacity;
        this.level = rect.level;
        this.txtLevel.string = Math.floor(this.level * 100) / 100;
    },

    // update (dt) {},
});

window.onload = function () {
    var go_object = go.GraphObject.make;    // 创建画布

    var myDiagram =
        go_object(go.Diagram, "myDiagramDiv",   // 必须与Div元素的id属性一致
            {
                initialContentAlignment: go.Spot.Center, // 居中显示内容
                "undoManager.isEnabled": true, // 启用Ctrl-Z和Ctrl-Y撤销重做功能
                allowDrop: true,  // 是否允许从Palette面板拖入元素
                "grid.visible": true,    // 画布背景
                "LinkDrawn": showLinkLabel,  // 每次画线后调用的事件：为条件连线加上标签，该方法再后面定义
                "LinkRelinked": showLinkLabel,  // 每次重画线后调用的事件：同上LinkDrawn
                scrollsPageOnFocus: false   // 图选中时页面不会滚动
            }
        );


    // 点击画布空白区域
    myDiagram.addDiagramListener("BackgroundSingleClicked", function (e) {

        document.getElementById("myInspectorDiv").style.visibility = "hidden";

    });


    myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {

        const part = e.subject.part;
        //
        // var key = part.data.key;
        // var text = part.part.data.text;

        if (part instanceof go.Node) { // 点击的是节点
            document.getElementById("myInspectorDiv").style.visibility = "visible";
        } else {
            document.getElementById("myInspectorDiv").style.visibility = "hidden";

        }
    });


    // 当图有改动时，在页面标题后加*，且启动保存按钮
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) {
            button.disabled = !myDiagram.isModified;
        }

        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });


    // 设置节点位置风格，并与模型"loc"属性绑定，该方法会在初始化各种节点模板时使用
    function nodeStyle() {
        return [
            // 将节点位置信息 Node.location 同节点模型数据中 "loc" 属性绑定：
            // 节点位置信息从 节点模型 "loc" 属性获取, 并由静态方法 Point.parse 解析.
            // 如果节点位置改变了, 会自动更新节点模型中"loc"属性, 并由 Point.stringify 方法转化为字符串
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            {
                // 节点位置 Node.location 定位在节点的中心
                locationSpot: go.Spot.Center
            }
        ];
    }

    // 创建"port"方法，"port"是一个透明的长方形细长图块，在每个节点的四个边界上，如果鼠标移到节点某个边界上，它会高亮
    // "name": "port" ID，即GraphObject.portId,
    // "align": 决定"port" 属于节点4条边的哪条
    // "spot": 控制连线连入/连出的位置，如go.Spot.Top指, go.Spot.TopSide
    // "output" / "input": 布尔型，指定是否允许连线从此"port"连入或连出
    function makePort(name, align, spot, output, input) {
        // 如果是上、下边界，则是水平"port"
        var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);

        return go_object(go.Shape,
            {
                fill: "transparent",            // 默认透明不现实
                strokeWidth: 0,                 // 无边框
                width: horizontal ? NaN : 8,    // 垂直"port"则8像素宽
                height: !horizontal ? NaN : 8,  // 水平"port"则8像素
                alignment: align,               // 同其节点对齐
                stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical), // 自动同其节点一同伸缩
                portId: name,                   // 声明ID
                fromSpot: spot,                 // 声明连线头连出此"port"的位置
                fromLinkable: output,           // 布尔型，是否允许连线从此"port"连出
                toSpot: spot,                   // 声明连线尾连入此"port"的位置
                toLinkable: input,              // 布尔型，是否允许连线从此"port"连出
                cursor: "pointer",              // 鼠标由指针改为手指，表示此处可点击生成连线
                mouseEnter: function (e, port) { // 鼠标移到"port"位置后，高亮
                    if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
                },
                mouseLeave: function (e, port) { // 鼠标移出"port"位置后，透明
                    port.fill = "transparent";
                }
            });
    }

    // 图形上的文字风格
    function textStyle() {
        return {
            font: "11pt Helvetica, Arial, sans-serif",
            stroke: "whitesmoke"
        }
    }

    // 拖动控制
    function finishDrop(e, grp) {
        var ok = (grp !== null
            ? grp.addMembers(grp.diagram.selection, true)
            : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel();
    }


    // 定义步骤（默认类型）节点的模板
    myDiagram.nodeTemplateMap.add("",  // 默认类型
        go_object(go.Node, "Table", nodeStyle(),
            // 步骤节点是一个包含可编辑文字块的长方形图块
            go_object(go.Panel, "Auto",
                go_object(go.Shape, "Rectangle",
                    {fill: "#00A9C9", strokeWidth: 0},
                    new go.Binding("figure", "figure")),
                go_object(go.TextBlock, textStyle(),
                    {
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit, // 尺寸自适应
                        editable: true  // 文字可编辑
                    },
                    new go.Binding("text").makeTwoWay()),  // 双向绑定模型中"text"属性
                go_object(go.TextBlock, textStyle(),
                    {
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit, // 尺寸自适应
                        editable: true  // 文字可编辑
                    },
                    new go.Binding("data").makeTwoWay()),  // 双向绑定模型中"text"属性

            ),

            // 上、左、右可以入，左、右、下可以出
            // "Top"表示中心，"TopSide"表示上方任一位置，自动选择
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ));

    // 定义条件节点的模板
    myDiagram.nodeTemplateMap.add("Conditional",
        go_object(go.Node, "Table", nodeStyle(),
            // 条件节点是一个包含可编辑文字块的菱形图块
            go_object(go.Panel, "Auto",
                go_object(go.Shape, "Diamond",
                    {fill: "#00A9C9", strokeWidth: 0},
                    new go.Binding("figure", "figure")),
                go_object(go.TextBlock, textStyle(),
                    {
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit, // 尺寸自适应
                        editable: true  // 文字可编辑
                    },
                    new go.Binding("text").makeTwoWay())
            ),

            // 上、左、右可以入，左、右、下可以出
            makePort("T", go.Spot.Top, go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        )
    );

    // 定义开始节点的模板
    myDiagram.nodeTemplateMap.add("Start",
        go_object(go.Node, "Table", nodeStyle(),
            // 开始节点是一个圆形图块，文字不可编辑
            go_object(go.Panel, "Auto",
                go_object(go.Shape, "Circle",
                    {minSize: new go.Size(40, 40), fill: "#79C900", strokeWidth: 0}),
                go_object(go.TextBlock, "Start", textStyle(),
                    new go.Binding("text"))
            ),

            // 左、右、下可以出，但都不可入
            makePort("L", go.Spot.Left, go.Spot.Left, true, false),
            makePort("R", go.Spot.Right, go.Spot.Right, true, false),
            makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        )
    );

    // 定义结束节点的模板
    myDiagram.nodeTemplateMap.add("End",
        go_object(go.Node, "Table", nodeStyle(),
            // 结束节点是一个圆形图块，文字不可编辑
            go_object(go.Panel, "Auto",
                go_object(go.Shape, "Circle",
                    {minSize: new go.Size(40, 40), fill: "#DC3C00", strokeWidth: 0}),
                go_object(go.TextBlock, "End", textStyle(),
                    new go.Binding("text"))
            ),

            // 上、左、右可以入，但都不可出
            makePort("T", go.Spot.Top, go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, go.Spot.Left, false, true),
            makePort("R", go.Spot.Right, go.Spot.Right, false, true)
        )
    );

    // 定义注释节点的模板
    myDiagram.nodeTemplateMap.add("Comment",
        go_object(go.Node, "Auto", nodeStyle(),
            // 注释节点是一个包含可编辑文字块的文件图块
            go_object(go.Shape, "Rectangle",
                {fill: "#EFFAB4", strokeWidth: 0}),
            go_object(go.TextBlock, textStyle(),
                {
                    margin: 5,
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit, // 尺寸自适应
                    textAlign: "center",
                    editable: true,  // 文字可编辑
                    font: "bold 12pt Helvetica, Arial, sans-serif",
                    stroke: '#454545'
                },
                new go.Binding("text").makeTwoWay())
            // 不支持连线入和出
        ));


    myDiagram.groupTemplateMap.add(
        'OfGroups',   // 注册组名
        go_object(go.Group, 'Auto',  // 设置组属性和排版
            {
                background: 'transparent',
                handlesDragDropForMembers: true,
                // 使用网格布局
                layout: go_object(go.GridLayout, {
                    wrappingWidth: Infinity,
                    alignment: go.GridLayout.Position,
                    cellSize: new go.Size(10, 10), // 每个part的最小尺寸
                    spacing: new go.Size(4, 4) // 间隔
                }),
                mouseDrop: finishDrop,
            },
            // 整个黄色的矩形大框框
            go_object(go.Shape, 'Rectangle', {fill: null, stroke: '#FFDD33', strokeWidth: 2}),
            // 填充在矩形框里的标题部分，这里引入了go.Placeholder 对象，这个对象用于存放成员，并做一些填充
            // 标题和成员，我们竖向排版
            go_object(go.Panel, 'Vertical',
                // 标题模块，我们添加了一个展开收起的按钮，和标题文字是横向排布的
                go_object(go.Panel, 'Horizontal',
                    {stretch: go.GraphObject.Horizontal, background: '#FFDD33'},
                    // 展开收起按钮
                    go_object('SubGraphExpanderButton', {alignment: go.Spot.Right, margin: 5}),
                    // 标题文字和一些设置
                    go_object(go.TextBlock,
                        {

                            maxSize: new go.Size(200, NaN),
                            wrap: go.TextBlock.WrapFit, // 尺寸自适应
                            alignment: go.Spot.Left,
                            margin: 5,
                            editable: true,
                            font: 'bold 18px sans-serif',
                            opacity: 0.75,
                            stroke: '#404040'
                        },
                        new go.Binding('text', 'text')
                    )
                ),
                go_object(go.Placeholder, {padding: 5, alignment: go.Spot.TopLeft})
            )
        )
    );
    myDiagram.groupTemplateMap.add(
        'OfNodes',   // 注册组名
        // 分析同上
        go_object(go.Group, 'Auto',
            {
                background: 'transparent',
                ungroupable: true,
                computesBoundsAfterDrag: true,
                handlesDragDropForMembers: true,
                layout: go_object(go.GridLayout, {
                    wrappingColumn: 1,
                    alignment: go.GridLayout.Position,
                    cellSize: new go.Size(1, 1),
                    spacing: new go.Size(4, 4)
                }),
                mouseDrop: finishDrop,
            },
            go_object(go.Shape, 'Rectangle', {fill: null, stroke: '#33D3E5', strokeWidth: 2}),
            go_object(go.Panel, 'Vertical',
                go_object(go.Panel, 'Horizontal',
                    {stretch: go.GraphObject.Horizontal, background: '#33D3E5'},
                    go_object('SubGraphExpanderButton', {alignment: go.Spot.Right, margin: 5}),
                    go_object(go.TextBlock,
                        {
                            alignment: go.Spot.Left,
                            editable: true,
                            margin: 5,
                            font: 'bold 16px sans-serif',
                            opacity: 0.75,
                            stroke: '#404040'
                        },
                        new go.Binding('text', 'text')
                    )
                ),
                go_object(go.Placeholder, {padding: 5, alignment: go.Spot.TopLeft})
            )
        )
    );


    // 初始化连接线的模板
    myDiagram.linkTemplate =
        go_object(go.Link,  // 所有连接线
            {
                routing: go.Link.AvoidsNodes,   // 连接线避开节点
                curve: go.Link.JumpOver,
                corner: 5, toShortLength: 4,    // 直角弧度，箭头弧度
                relinkableFrom: true,   // 允许连线头重设
                relinkableTo: true,     // 允许连线尾重设
                reshapable: true,       // 允许线形修改
                resegmentable: true,    // 允许连线分割（折线）修改
                // 鼠标移到连线上后高亮
                mouseEnter: function (e, link) {
                    link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)";
                },
                mouseLeave: function (e, link) {
                    link.findObject("HIGHLIGHT").stroke = "transparent";
                },
                selectionAdorned: false
            },
            new go.Binding("points").makeTwoWay(),  // 双向绑定模型中"points"数组属性
            go_object(go.Shape,  // 隐藏的连线形状，8个像素粗细，当鼠标移上后显示
                {isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT"}
            ),
            go_object(go.Shape,  // 连线规格（颜色，选中/非选中，粗细）
                {isPanelMain: true, stroke: "gray", strokeWidth: 2},
                new go.Binding("stroke", "isSelected", function (sel) {
                    return sel ? "dodgerblue" : "gray";
                }).ofObject()
            ),
            go_object(go.Shape,  // 箭头规格
                {toArrow: "standard", strokeWidth: 0, fill: "gray"}
            ),
            go_object(go.Panel, "Auto",  // 连线标签，默认不显示
                {visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5},
                new go.Binding("visible", "visible").makeTwoWay(),  // 双向绑定模型中"visible"属性
                go_object(go.Shape, "RoundedRectangle",  // 连线中显示的标签形状
                    {fill: "#F8F8F8", strokeWidth: 0}),
                go_object(go.TextBlock, "是",  // 连线中显示的默认标签文字
                    {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#333333",
                        editable: true
                    },
                    new go.Binding("text").makeTwoWay())  // 双向绑定模型中"text"属性
            )
        );

    // 此事件方法由整个画板的LinkDrawn和LinkRelinked事件触发
    // 如果连线是从”conditional"条件节点出发，则将连线上的标签显示出来
    function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL");
        if (label !== null) {
            label.visible = (e.subject.fromNode.data.category === "Conditional");
        }
    }

    // 临时的连线（还在画图中），包括重连的连线，都保持直角
    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    // 在图形页面的左边初始化图例Palette面板
    myPalette =
        go_object(go.Palette, "myPaletteDiv",  // 必须同HTML中Div元素id一致
            {
                scrollsPageOnFocus: false,  // 图选中时页面不会滚动
                nodeTemplateMap: myDiagram.nodeTemplateMap,     // 同myDiagram公用一种node节点模板
                groupTemplateMap: myDiagram.groupTemplateMap,    // 同myDiagram公用一种node节点模板
                model: new go.GraphLinksModel([  // 初始化Palette面板里的内容
                    {category: "Start", text: "开始"},
                    {
                        text: "步骤1",
                        data: '{"likes": {go_objectgt:50}, go_objector: [{"user": "usr001"},{"title": "title01"}]}'
                    },
                    {category: "Conditional", text: "条件1"},
                    {category: "End", text: "结束"},
                    {category: "Comment", text: "注释"},
                    {category: 'OfGroups', text: '业务', isGroup: true},
                    {category: 'OfNodes', text: '集群', isGroup: true},
                ])
            });


    // // 初始化模型范例
    // myDiagram.model = go.Model.fromJson(
    //     {
    //         "class": "go.GraphLinksModel",
    //         "linkFromPortIdProperty": "fromPort",
    //         "linkToPortIdProperty": "toPort",
    //         "modelData": {"test": true, "hello": "world", "version": 42},
    //         "nodeDataArray": [
    //             {"category": "Start", "text": "开始", "key": 1, "loc": "88 37"},
    //             {"text": "php", "key": 2, "loc": "88 114", "data": "aaa"},
    //             {"text": "nginx", "key": 4, "loc": "88 307", "data": "bbb"},
    //             {"category": "End", "text": "结束", "key": 6, "loc": "88 445"}
    //         ],
    //         "linkDataArray": [
    //             {"from": 2, "to": 3, "fromPort": "B", "toPort": "T"},
    //             {"from": 1, "to": 2, "fromPort": "B", "toPort": "T"},
    //             {"from": 2, "to": 4, "fromPort": "B", "toPort": "T"},
    //             {"from": 4, "to": 6, "fromPort": "B", "toPort": "T"}
    //         ]
    //     }
    // );


    // 属于表格
    new Inspector('myInspectorDiv', myDiagram,
        {
            // allows for multiple nodes to be inspected at once
            multipleSelection: true,
            // max number of node properties will be shown when multiple selection is true
            showSize: 4,
            // when multipleSelection is true, when showAllProperties is true it takes the union of properties
            // otherwise it takes the intersection of properties
            showAllProperties: true,
            // uncomment this line to only inspect the named properties below instead of all properties on each object:
            // includesOwnProperties: false,
            properties: {
                "text": {},
                // key would be automatically added for nodes, but we want to declare it read-only also:
                // "key": {readOnly: true, show: Inspector.showIfPresent},
                // // color would be automatically added for nodes, but we want to declare it a color also:
                // "color": {show: Inspector.showIfPresent, type: 'color'},
                // // Comments and LinkComments are not in any node or link data (yet), so we add them here:
                // "Comments": {show: Inspector.showIfNode},
                // "LinkComments": {show: Inspector.showIfLink},
                // "isGroup": {readOnly: true, show: Inspector.showIfPresent},
                // "flag": {show: Inspector.showIfNode, type: 'checkbox'},
                // "state": {
                //     show: Inspector.showIfNode,
                //     type: "select",
                //     choices: function (node, propName) {
                //         if (Array.isArray(node.data.choices)) return node.data.choices;
                //         return ["one", "two", "three", "four", "five"];
                //     }
                // },
                // "choices": {show: false},  // must not be shown at all
                // // an example of specifying the <input> type
                // "password": {show: Inspector.showIfPresent, type: 'password'}
            }
        });


    String.prototype.signMix = function () {
        if (arguments.length === 0) return this;
        var param = arguments[0], str = this;
        if (typeof (param) === 'object') {
            for (var key in param)
                str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
            return str;
        } else {
            for (var i = 0; i < arguments.length; i++)
                str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            return str;
        }
    }

    $.post("/game/workflow/roles", {'path': window.localStorage.workflowFile}, function (data, status) {


        var nodeDataArray = new Array();
        var linkDataArray = new Array();


        for (let index in data) {


            if (index == 0) {
                nodeDataArray.push({
                    "category": "Start",
                    "text": "Start",
                    "key": "Start",
                    "loc": "{0}, {1}".signMix(100, (parseInt(index) + 1) * 100)
                });

                nodeDataArray.push({
                    "role": data[index],
                    "text": data[index],
                    "key": data[index],
                    "data": {"$and": [{"is_del": 0}, {"is_manage": 1}]},
                    "loc": "{0}, {1}".signMix(100, (parseInt(index) + 1) * 100 + 100)
                });
                linkDataArray.push({"from": "Start", "to": data[index], "fromPort": "B", "toPort": "T"},);


                if (data.length == 1) {
                    nodeDataArray.push({
                        "category": "End",
                        "text": "End",
                        "key": "End",
                        "loc": "{0}, {1}".signMix(100, (parseInt(index) + 2) * 100 + 200)
                    });

                    linkDataArray.push({"from": data[index], "to": "End", "fromPort": "B", "toPort": "T"},);

                }


            } else if ((parseInt(index) + 1) == data.length) {

                nodeDataArray.push({
                    "role": data[index],
                    "text": data[index],
                    "key": data[index],
                    "data": {"$and": [{"is_del": 0}, {"is_manage": 1}]},
                    "loc": "{0}, {1}".signMix(100, (parseInt(index) + 1) * 100 + 100)
                });
                nodeDataArray.push({
                    "category": "End",
                    "text": "End",
                    "key": "End",
                    "loc": "{0}, {1}".signMix(100, (parseInt(index) + 1) * 100 + 200)
                });
                linkDataArray.push({"from": data[index - 1], "to": data[index], "fromPort": "B", "toPort": "T"},);
                linkDataArray.push({"from": data[index], "to": "End", "fromPort": "B", "toPort": "T"},);
            } else {

                nodeDataArray.push({
                    "role": data[index],
                    "text": data[index],
                    "key": data[index],
                    "data": {"$and": [{"is_del": 0}, {"is_manage": 1}]},
                    "loc": "{0}, {1}".signMix(100, (parseInt(index) + 1) * 100 + 100)
                });

                linkDataArray.push({"from": data[index - 1], "to": data[index], "fromPort": "B", "toPort": "T"},);

            }


        }
        ;


        // 初始化模型范例
        myDiagram.model = go.Model.fromJson(
            {
                "class": "go.GraphLinksModel",
                "linkFromPortIdProperty": "fromPort",
                "linkToPortIdProperty": "toPort",
                "modelData": {"test": true, "hello": "world", "version": 42},
                "nodeDataArray": nodeDataArray,
                "linkDataArray": linkDataArray
            }
        );


    });
    // document.getElementById("mySavedModel").value = myDiagram.model.toJson();

    // // 将go模型以JSon格式保存在文本框内
    // document.getElementById("saveButton").addEventListener("click", function () {
    //
    //
    //     initCode = null;
    //     var key_one = false, key_two = false;
    //     for (arr in myDiagram.model.nodeDataArray) {
    //
    //         if (myDiagram.model.nodeDataArray[arr].text === 'Start') {
    //             key_one = true;
    //         }
    //         if (myDiagram.model.nodeDataArray[arr].text === 'End') {
    //             key_two = true;
    //         }
    //     }
    //     if (key_one && key_two) {
    //         initCode = myDiagram.model.toJson();
    //         /*缓存*/
    //         if (window.localStorage) {
    //             var wLocal = window.localStorage;
    //             wLocal.saveModel = myDiagram.model.toJson();
    //         } else {
    //             console.log('请使用高版本浏览器');
    //         }
    //         myDiagram.isModified = false;
    //     } else {
    //         alert('保存失败!开始按钮和结束按钮必须存在');
    //     }
    //
    //     // document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    //     // myDiagram.isModified = false;
    // });
    //
    // // 读取文本框内JSon格式的内容，并转化为gojs模型
    // document.getElementById("loadButton").addEventListener("click", function () {
    //     //myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    //
    //     /*缓存*/
    //     if (window.localStorage) {
    //         if (window.localStorage.saveModel) {
    //             initCode = window.localStorage.saveModel;
    //         }
    //     } else {
    //         console.log('请使用高版本浏览器');
    //     }
    //     myDiagram.model = go.Model.fromJson(initCode);
    //
    // });

    var ws = new WebSocket("ws://127.0.0.1:9000/game/ws");
    ws.onopen = function () {

        $("#myInspectorDiv2").append("<br>Server connected <br>");

    };
    ws.onmessage = function (e) {

        var ansi_up = new AnsiUp;

        var html = ansi_up.ansi_to_html(e.data);


        $("#myInspectorDiv2").append(html + "<br>");

        var divscll = document.getElementById('myInspectorDiv2');
        divscll.scrollTop = divscll.scrollHeight;


    };
    ws.onclose = function () {

        $("#myInspectorDiv2").append("<br>Server disconnected <br>");
    };

    $("#runButton").on("click", function () {

        ws.send(JSON.stringify({"path": window.localStorage.workflowFile, "query": myDiagram.model.toJson()}));
        $("#myInspectorDiv2").append("<br>>> Data sent: " + window.localStorage.workflowFile + "<br>");


    });


} // windows.onload



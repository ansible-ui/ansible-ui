window.onload = function() {
    var $ = go.GraphObject.make;    // 创建画布

    var myDiagram =
        $(go.Diagram, "myDiagramDiv",   // 必须与Div元素的id属性一致
        {
            initialContentAlignment: go.Spot.Center, // 居中显示内容
            "undoManager.isEnabled": true, // 启用Ctrl-Z和Ctrl-Y撤销重做功能
            allowDrop: true,  // 是否允许从Palette面板拖入元素
            "grid.visible":true,    // 画布背景
            "LinkDrawn": showLinkLabel,  // 每次画线后调用的事件：为条件连线加上标签，该方法再后面定义
            "LinkRelinked": showLinkLabel,  // 每次重画线后调用的事件：同上LinkDrawn
            scrollsPageOnFocus: false   // 图选中时页面不会滚动
        }
        );




    // 当图有改动时，在页面标题后加*，且启动保存按钮
    myDiagram.addDiagramListener("Modified", function(e) {
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

        return $(go.Shape,
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
            mouseEnter: function(e, port) { // 鼠标移到"port"位置后，高亮
              if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
            },
            mouseLeave: function(e, port) { // 鼠标移出"port"位置后，透明
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
        $(go.Node, "Table", nodeStyle(),
          // 步骤节点是一个包含可编辑文字块的长方形图块
          $(go.Panel, "Auto",
            $(go.Shape, "Rectangle",
              { fill: "#00A9C9", strokeWidth: 0 },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit, // 尺寸自适应
                editable: true  // 文字可编辑
              },
              new go.Binding("text").makeTwoWay())  // 双向绑定模型中"text"属性
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
        $(go.Node, "Table", nodeStyle(),
          // 条件节点是一个包含可编辑文字块的菱形图块
          $(go.Panel, "Auto",
            $(go.Shape, "Diamond",
              { fill: "#00A9C9", strokeWidth: 0 },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
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
        $(go.Node, "Table", nodeStyle(),
        // 开始节点是一个圆形图块，文字不可编辑
          $(go.Panel, "Auto",
            $(go.Shape, "Circle",
              { minSize: new go.Size(40, 40), fill: "#79C900", strokeWidth: 0 }),
            $(go.TextBlock, "Start", textStyle(),
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
        $(go.Node, "Table", nodeStyle(),
            // 结束节点是一个圆形图块，文字不可编辑
            $(go.Panel, "Auto",
                $(go.Shape, "Circle",
                { minSize: new go.Size(40, 40), fill: "#DC3C00", strokeWidth: 0 }),
                $(go.TextBlock, "End", textStyle(),
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
        $(go.Node, "Auto", nodeStyle(),
            // 注释节点是一个包含可编辑文字块的文件图块
          $(go.Shape, "Rectangle",
            { fill: "#EFFAB4", strokeWidth: 0 }),
          $(go.TextBlock, textStyle(),
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
      $( go.Group, 'Auto',  // 设置组属性和排版
        {
          background: 'transparent',
          handlesDragDropForMembers: true, 
          // 使用网格布局
          layout: $(go.GridLayout, {
            wrappingWidth: Infinity,
            alignment: go.GridLayout.Position,
            cellSize: new go.Size(10, 10), // 每个part的最小尺寸
            spacing: new go.Size(4, 4) // 间隔
          }),
          mouseDrop: finishDrop,
        },
        // 整个黄色的矩形大框框
        $(go.Shape, 'Rectangle', { fill:null, stroke: '#FFDD33', strokeWidth: 2 }), 
        // 填充在矩形框里的标题部分，这里引入了go.Placeholder 对象，这个对象用于存放成员，并做一些填充
        // 标题和成员，我们竖向排版
        $(go.Panel,'Vertical', 
          // 标题模块，我们添加了一个展开收起的按钮，和标题文字是横向排布的
          $( go.Panel, 'Horizontal', 
            { stretch: go.GraphObject.Horizontal, background: '#FFDD33' },
            // 展开收起按钮
            $('SubGraphExpanderButton', { alignment: go.Spot.Right, margin: 5 }),
            // 标题文字和一些设置
            $(go.TextBlock,
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
          $(go.Placeholder, { padding: 5, alignment: go.Spot.TopLeft })
        ) 
      )
    );
    myDiagram.groupTemplateMap.add(
      'OfNodes',   // 注册组名
      // 分析同上
      $( go.Group, 'Auto',
        {
          background: 'transparent',
          ungroupable: true,
          computesBoundsAfterDrag: true,
          handlesDragDropForMembers: true, 
          layout: $(go.GridLayout, {
            wrappingColumn: 1,
            alignment: go.GridLayout.Position,
            cellSize: new go.Size(1, 1),
            spacing: new go.Size(4, 4)
          }),
          mouseDrop: finishDrop,
        },
        $( go.Shape, 'Rectangle', { fill: null, stroke: '#33D3E5', strokeWidth: 2 }),
        $( go.Panel,'Vertical', 
          $( go.Panel, 'Horizontal', 
            { stretch: go.GraphObject.Horizontal, background: '#33D3E5' },
            $('SubGraphExpanderButton', { alignment: go.Spot.Right, margin: 5 }),
            $( go.TextBlock,
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
          $(go.Placeholder, { padding: 5, alignment: go.Spot.TopLeft })
        ) 
      )
    );


    
    // 初始化连接线的模板
    myDiagram.linkTemplate =
        $(go.Link,  // 所有连接线
        {
            routing: go.Link.AvoidsNodes,   // 连接线避开节点
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,    // 直角弧度，箭头弧度
            relinkableFrom: true,   // 允许连线头重设
            relinkableTo: true,     // 允许连线尾重设
            reshapable: true,       // 允许线形修改
            resegmentable: true,    // 允许连线分割（折线）修改
            // 鼠标移到连线上后高亮
            mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
            mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
            selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),  // 双向绑定模型中"points"数组属性
        $(go.Shape,  // 隐藏的连线形状，8个像素粗细，当鼠标移上后显示
        { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }
        ),
        $(go.Shape,  // 连线规格（颜色，选中/非选中，粗细）
        { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
        new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()
        ),
        $(go.Shape,  // 箭头规格
            { toArrow: "standard", strokeWidth: 0, fill: "gray"}
        ),
        $(go.Panel, "Auto",  // 连线标签，默认不显示
            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5},
            new go.Binding("visible", "visible").makeTwoWay(),  // 双向绑定模型中"visible"属性
            $(go.Shape, "RoundedRectangle",  // 连线中显示的标签形状
                { fill: "#F8F8F8", strokeWidth: 0 }),
            $(go.TextBlock, "是",  // 连线中显示的默认标签文字
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
    $(go.Palette, "myPaletteDiv",  // 必须同HTML中Div元素id一致
        {
        scrollsPageOnFocus: false,  // 图选中时页面不会滚动
        nodeTemplateMap: myDiagram.nodeTemplateMap,     // 同myDiagram公用一种node节点模板
        groupTemplateMap: myDiagram.groupTemplateMap,    // 同myDiagram公用一种node节点模板
        model: new go.GraphLinksModel([  // 初始化Palette面板里的内容
            { category: "Start", text: "开始" },
            { text: "步骤1" },
            { category: "Conditional", text: "条件1" },
            { category: "End", text: "结束" },
            { category: "Comment", text: "注释" },
            { category: 'OfGroups', text: '业务', isGroup: true },
            { category: 'OfNodes',  text: '集群', isGroup: true },
        ])
    });
    
    // 初始化模型范例
    myDiagram.model = go.Model.fromJson(
    { "class": "go.GraphLinksModel",
        "linkFromPortIdProperty": "fromPort",
        "linkToPortIdProperty": "toPort",
        "nodeDataArray": [ 
        {"category":"Start", "text":"开始", "key":1, "loc":"88 37"},
        {"text":"烧开水", "key":2, "loc":"88 114"},
        {"category":"Conditional", "text":"水是否烧开", "key":3, "loc":"88 210"},
        {"text":"下面条", "key":4, "loc":"87 307"},
        {"text":"等待3分钟", "key":5, "loc":"87 375"},
        {"category":"End", "text":"结束", "key":6, "loc":"87 445"}
        ],
        "linkDataArray": [ 
        {"from":2, "to":3, "fromPort":"B", "toPort":"T"},
        {"from":3, "to":2, "fromPort":"R", "toPort":"R", "visible":true, "text":"否"},
        {"from":1, "to":2, "fromPort":"B", "toPort":"T"},
        {"from":3, "to":4, "fromPort":"B", "toPort":"T", "visible":true},
        {"from":4, "to":5, "fromPort":"B", "toPort":"T"},
        {"from":5, "to":6, "fromPort":"B", "toPort":"T"}
        ]}
    );

    // 属于表格
    var inspector = new Inspector('myInspectorDiv', myDiagram,
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
          "key": { readOnly: true, show: Inspector.showIfPresent },
          // color would be automatically added for nodes, but we want to declare it a color also:
          "color": { show: Inspector.showIfPresent, type: 'color' },
          // Comments and LinkComments are not in any node or link data (yet), so we add them here:
          "Comments": { show: Inspector.showIfNode },
          "LinkComments": { show: Inspector.showIfLink },
          "isGroup": { readOnly: true, show: Inspector.showIfPresent },
          "flag": { show: Inspector.showIfNode, type: 'checkbox' },
          "state": {
          show: Inspector.showIfNode,
          type: "select",
          choices: function(node, propName) {
          if (Array.isArray(node.data.choices)) return node.data.choices;
          return ["one", "two", "three", "four", "five"];
          }
          },
          "choices": { show: false },  // must not be shown at all
          // an example of specifying the <input> type
          "password": { show: Inspector.showIfPresent, type: 'password' }
          }
    });
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  
    // 将go模型以JSon格式保存在文本框内
    document.getElementById("saveButton").addEventListener("click", function() {
        document.getElementById("mySavedModel").value = myDiagram.model.toJson();
        myDiagram.isModified = false;
    });

    // 读取文本框内JSon格式的内容，并转化为gojs模型
    document.getElementById("loadButton").addEventListener("click", function() {
        myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    });

    // 在新窗口中将图形转化为SVG，并分页打印
    document.getElementById("printButton").addEventListener("click", function() {
        var svgWindow = window.open();
        if (!svgWindow) return;  // 创建新窗口失败
        var printSize = new go.Size(700, 960);
        var bnds = myDiagram.documentBounds;
        var x = bnds.x;
        var y = bnds.y;
        while (y < bnds.bottom) {
        while (x < bnds.right) {
            var svg = myDiagram.makeSVG({ scale: 1.0, position: new go.Point(x, y), size: printSize });
            svgWindow.document.body.appendChild(svg);
            x += printSize.width;
        }
        x = bnds.x;
        y += printSize.height;
        }
        setTimeout(function() { svgWindow.print(); }, 1);
    });

} // windows.onload



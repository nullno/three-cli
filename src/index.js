

import  *as THREE from './lib.js';


import BG from './model/environment/bg.jpeg'

import hp_glb from './model/G1211/G1211.glb'
import xsr_fbx from './model/xsr/xsr.fbx'


import xsr_fbx_texture from './model/xsr/Stormland Robo 03H.png'

import xsr_fbx_logo_texture from './model/xsr/stormland_logo.png'

 const models = [
              
                {name:'白龙纹眉瓶',path:hp_glb,position:[0, 0, 50],type:'glb'
                 },
                {name:'像素人',path:xsr_fbx,position:[0, 0, 50],type:'fbx',
                texture:[{name:'gardener,hologram_2,hologram',path:xsr_fbx_texture},
                         {name:'Plane',path:xsr_fbx_logo_texture}],
                 }, 
                // {name:'石狮',path:shishi,position:[0, 0, 2000]},
                // {name:'北齐大日如来',path:rulai,position:[0, 0, 2000]},
                // {name:'彩绘侍女俑',path:ny,position:[0, 0, 50]},
                // {name:'景德镇花瓶',path:hp,position:[0, 0, 50]},
                // {name:'饕餮青铜铸壶',path:qth,position:[0, 0, 50]}
                
               ]

const modelScene={
      State:{
        showGrid:false,
        showLightOrigin:false,
        wireframe:false,
      },
      Scene:null,
      Renderer:null,
      Camera:null,
      Model:null,
      Lights:null,
      AnimationMixer:null,
      Tclock:new THREE.Clock(),
      TestGui:null,
      TestStats:null,
      Controls:null,
      GridHelper:new THREE.GridHelper( 300, 50,  0x00FF12, 0xFFFFFF ),
      
      init:{
          //添加场景
           Scene:function(){
                  this.Scene =  new THREE.Scene()
                  this.Scene.background = new THREE.Color(0x282923);
                  
                  this.Scene.background = new THREE.TextureLoader().load(BG)
         
                  // THREE.Cache.enabled = true;
         
           },
           //添加渲染器
           Renderer:function(){
                  this.Renderer = new THREE.WebGLRenderer({antialias: true,alpha: true,premultipliedAlpha:true,precision: 'highp'})
                  this.Renderer.setPixelRatio(window.devicePixelRatio);
                  this.Renderer.setSize(window.innerWidth, window.innerHeight);
                  this.Renderer.setClearColor(0xeeeeee);
                  this.Renderer.shadowMap.enabled = true;
                  this.Renderer.physicallyCorrectLights = true;
                  this.Renderer.outputEncoding = THREE.sRGBEncoding;


                  ThreeApp.appendChild(this.Renderer.domElement); 
           },
           //添加相机
           Camera:function(){
             this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,1, 10000)
             this.Camera.position.set(0, 0, 50);
             this.Camera.lookAt(this.Scene.position)
           },

         
           TestGui:function(){
                  let _this = this;
                  this.TestGui =  new THREE.Dat.GUI()
                  this.TestGui.add({
                  changeBg: function () {
                    _this.Scene.background = new THREE.Color(0x1A1A1A);

                  }
                }, "changeBg");
           },
           //帧率状态
           Stats() {
              this.TestStats = new THREE.Stats();
              document.body.appendChild(this.TestStats.dom);
            }
      
      },

      //加载模型GLTF FBX
      modelLoader:function(MODEL){

             
              const loadTip = this.addLoadTip();
             
              this.Controls.autoRotate = false;
                //添加环境hdr
              MODEL.hdr && this.HdrLoader(MODEL.hdr);
             
              let Loader = '',MTYPE = MODEL.type || 'glb';
                 
              if('glb,gltf'.indexOf(MTYPE)!=-1){
                Loader = new THREE.GLTFLoader()
              }
               else if('fbx'.indexOf(MTYPE)!=-1){
                Loader = new THREE.FBXLoader()
              }else{
                 loadTip.textContent='请使用glb,gltf,fbx格式模型';
                 return;
              }
        

   
             

               Loader.load(MODEL.path, (geometry)=> {
                
                  loadTip.textContent='加载完成！';
                  //移除模型  
                  this.Model &&  this.Scene.remove(this.Model);
                
                  //设置相机位置
                  this.Camera.position.set(...MODEL.position);
              
                  this.Model = 'fbx'.indexOf(MTYPE)!=-1?geometry:geometry.scene;
                  
                 

                  this.Model.traverse(function(child) {
                      if(MODEL.texture){
                        
                        MODEL.texture.map(item=>{
                           if(item.name.indexOf(child.name)!=-1){
                               child.material = new THREE.MeshPhongMaterial({
                                         map: THREE.ImageUtils.loadTexture(item.path)//颜色贴图
                                       });
                           }
                        }) 
                      }   
                       

                        if (child.isMesh) {
                            
                              // child.material.emissiveMap = child.material.map;
                           
                              //child.material.side = THREE.DoubleSide;
                              child.material.shininess=1;
                        
                              child.castShadow = true
                              child.receiveShadow = true

                              child.material.transparent=true;//材质允许透明
                              child.material.opacity=1;//材质默认透明度                        
                            
                          }
                      } 
                   );

                  //模型自动居中
                  THREE.ModelAutoCenter(this.Model)
              
                  if(this.Model.animations.length>0){

                       this.AnimationMixer = new THREE.AnimationMixer(this.Model);
                       this.AnimationMixer.clipAction(this.Model.animations[0]).play();

                       /* 其他模型动画方案：
                        const animationClip = this.Model.animations.find(animationClip => animationClip.name === "Walk");
                        this.AnimationMixer.clipAction(animationClip).play();
                        */
                  }
              
                  this.Scene.add(this.Model);

                  
                  setTimeout(()=>{
                     loadTip.style.display='none';
                     this.Controls.autoRotate = true;
                  
                   },1000);
                  
                },
                (xhr)=>{
                   loadTip.textContent=(parseInt(xhr.loaded/xhr.total*100))+'%加载中...';
              
                },
               );
                (err)=>{
                    loadTip.textContent='模型加载失败！'
                    console.log('模型加载失败！')
                }
      },
      //加载光源
      addLight:function(){
            this.Lights = [
                  {name:'AmbientLight',obj:new THREE.AmbientLight(0xFFFFFF,1)},
                  {name:'DirectionalLight_top',obj:new THREE.DirectionalLight(0xFFFFFF,3),position:[0, 15, 0]},
                  {name:'DirectionalLight_bottom',obj:new THREE.DirectionalLight(0x1B1B1B,3),position:[0, -200, 0]},
                  {name:'DirectionalLight_right1',obj:new THREE.DirectionalLight(0xFFFFFF,1.5),position:[0, -5, 20]},
                  {name:'DirectionalLight_right2',obj:new THREE.DirectionalLight(0xFFFFFF,1.5),position:[0, -5, -20]},
            ];
           

           this.Lights.map(item=>{
            item.obj.name=item.name;
            item.position && item.obj.position.set(...item.position);
            item.Helper = new THREE.PointLightHelper( item.obj );
            this.Scene.add(item.obj);
           })  
           

      }, 
      //加载HDR贴图环境光
      HdrLoader:function(HDR){
          const pmremGenerator = new THREE.PMREMGenerator(this.Renderer); // 使用hdr作为背景色
                pmremGenerator.compileEquirectangularShader();
          const textureLoader = new THREE.RGBELoader()
               textureLoader.load(HDR,(texture, textureData)=> {
             
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;

                envMap.isPmremTexture = true;
                pmremGenerator.dispose();
           
                this.Scene.environment = envMap; // 给场景添加环境光效果
                this.Scene.background = envMap; // 给场景添加背景图


              });
      },
      //添加事件
      addControls:function() {
         this.Controls = new THREE.OrbitControls(this.Camera, this.Renderer.domElement);
        // 如果使用animate方法时，将此函数删除
        //controls.addEventListener( 'change', render );
        // 使动画循环使用时阻尼或自转 意思是否有惯性
         this.Controls.enableDamping = true;
        //是否可以缩放
         this.Controls.enableZoom = true;
        //设置相机距离原点的最远距离-可以控制缩放程度
         this.Controls.minDistance = 0;
        //设置相机距离原点的最远距离
         this.Controls.maxDistance = 3000;//800
        //是否开启右键拖拽
         this.Controls.enablePan = false;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
         this.Controls.dampingFactor = 0.5;
        //是否自动旋转
         this.Controls.autoRotate = false;
         this.Controls.autoRotateSpeed = 1;
      },
      //模型切换
      switchModel(){
           const _scope = this; 
   
          var switchModelStyle = document.createElement('style');
             switchModelStyle.type = "text/css";
             switchModelStyle.innerText +='.modelList{position:fixed;width:100%; display:flex;justify-content:space-around; bottom:0;left:0;color:#0EF4F4;background:rgba(14,14,44,0.9);cursor:pointer;}\
                .modelList li{width:50%;line-height:30px;padding:5px;text-align:center;font-size:14px;}.modelList li:last-child{border:0;}.modelList li:hover,.modelList li.on{background:#0E2440;}'

          const modelUL = document.createElement('ul');
                modelUL.className='modelList'

                models.map((item,index)=>{
                
                    modelUL.innerHTML+='<li class="'+(index==0?'on':'')+'">'+item.name+'</li>';
                }) 


          document.head.insertBefore(switchModelStyle, document.head.lastChild);
          ThreeApp.insertBefore(modelUL,ThreeApp.firstChild);
       

            let LIS = modelUL.children;
      
              for(let i=0;i<LIS.length;i++){
              
                LIS[i].onclick=function(){
                    for(let j=0; j<LIS.length; j++){
                       LIS[j].className='';
                    }
                     this.className='on'
                     _scope.modelLoader(models[i]);
                     
                  }
              }

      },  
     //添加加载进度
     addLoadTip:function(){
       
            document.querySelector('.loadTip') && ThreeApp.removeChild(document.querySelector('.loadTip'));
           let  loadTip =  document.createElement('div');
                loadTip.className='loadTip'
                loadTip.style.cssText+='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:5px;background-color:rgba(0,0,0,0.5);padding:5px 10px;color:#fff;';
                ThreeApp.appendChild(loadTip);
              return loadTip;
      },
    
      //添加辅助面板
      addPanel:function(){

            const _scope = this;
            
            //帧率状态
            this.init.Stats.call(this)   
    

             // 添加
            const Panels=[
                  {
                    name:'辅助网格',
                    todo:function(){
                    
                        if(_scope.State.showGrid){
                          _scope.Scene.remove(_scope.GridHelper);
                          _scope.State.showGrid=false;
                             
                        }else{
                           _scope.Scene.add(_scope.GridHelper);
                          _scope.State.showGrid=true;
                        }
                       
                    }
                  },
                  {
                    name:'显示光源',
                    todo:function(){
                       
                            if(_scope.State.showLightOrigin){
                               _scope.Lights.map(item=>{_scope.Scene.remove(item.Helper)})
                              _scope.State.showLightOrigin = false
                            }else{
                              _scope.Lights.map(item=>{_scope.Scene.add(item.Helper)})
                              
                              _scope.State.showLightOrigin = true
                            }
                        
                    }
                  },
                   {
                    name:'骨架模式',
                    todo:function(){
                            if(_scope.State.wireframe){
                                _scope.Model.traverse( child=> {
                                     if ( child.isMesh ) {
                                        child.material.wireframe=false 
                                      }
                                })
                              _scope.State.wireframe = false
                            }else{
                               _scope.Model.traverse( child=> {
                                    if ( child.isMesh ) {
                                      child.material.wireframe=true 
                                    }
                                })
                              _scope.State.wireframe = true
                            }
                        
                    }
                  },

             ]
          
            
            //辅助面板DomTree
            var helpPanelStyle = document.createElement('style');
             helpPanelStyle.type = "text/css";
             helpPanelStyle.innerText +='#helpPanel{position:fixed;width:80px;top:50px;left:0;color:#0EF4F4;background:#0E0E2C;cursor:pointer;}\
                 #helpPanel li{border-bottom:1px solid #fff;line-height:30px;text-align:center;font-size:14px;}#helpPanel li:last-child{border:0;}#helpPanel li.on{color:green;}';
            var helpPanel =  document.createElement('ul');
                helpPanel.id='helpPanel'; 
            

            Panels.forEach(item=>{
               let LI  =  document.createElement('li');
               
                LI.innerText=item.name;
                LI.onclick=function(){
       
                  this.className = this.className=='on'?'':'on'
                  item.todo(this)
                }
                helpPanel.appendChild(LI);
            })
           
         

            document.head.insertBefore(helpPanelStyle, document.head.lastChild);
            ThreeApp.insertBefore(helpPanel,ThreeApp.firstChild)

      },
      animation:function(){
          //更新控制器
            this.Renderer.render(this.Scene, this.Camera);
            this.TestStats.update();
            this.Controls.update();
            this.AnimationMixer && this.AnimationMixer.update(this.Tclock.getDelta());
            requestAnimationFrame(()=>this.animation());
      },
      onWindowResize:function() {
            this.Camera.aspect = window.innerWidth / window.innerHeight;
            this.Camera.updateProjectionMatrix();
            this.Renderer.setSize(window.innerWidth, window.innerHeight);
            this.Renderer.render(this.Scene, this.Camera);
      },
      run:function(){
            this.init.Renderer.call(this) 
            this.init.Scene.call(this)
            this.init.Camera.call(this)

            this.addControls();
             //添加环境光
            this.addLight() 
            this.modelLoader(models[0]);
            
            //添加辅助面板
            this.addPanel();
            this.animation(); 
            this.switchModel()
            
        
            window.onresize = ()=>this.onWindowResize(); 
                 
      }



}


modelScene.run();








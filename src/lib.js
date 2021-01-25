import * as THREE from 'three'   

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import  Dat  from 'three/examples/jsm/libs/dat.gui.module.js';

import  Stats  from 'three/examples/jsm/libs/stats.module.js';


//模型加载器
THREE.GLTFLoader = GLTFLoader;

THREE.FBXLoader = FBXLoader;

// THREE.DRACOLoader = DRACOLoader

//HDR加载器
THREE.RGBELoader = RGBELoader;

//控制器
THREE.OrbitControls = OrbitControls;

//状态面板
THREE.Dat = Dat;
THREE.Stats = Stats;

// 让模型自动居中
THREE.ModelAutoCenter =function(group){
		/**
		 * 包围盒全自动计算：模型整体居中
		 */
		var box3 = new THREE.Box3()
		// 计算层级模型group的包围盒
		// 模型group是加载一个三维模型返回的对象，包含多个网格模型
		box3.expandByObject(group)
		// 计算一个层级模型对应包围盒的几何体中心在世界坐标中的位置
		var center = new THREE.Vector3()
		box3.getCenter(center)
		// console.log('查看几何体中心坐标', center);

		// 重新设置模型的位置，使之居中。
		group.position.x = group.position.x - center.x
		group.position.y = group.position.y - center.y
		group.position.z = group.position.z - center.z
}

export default THREE;
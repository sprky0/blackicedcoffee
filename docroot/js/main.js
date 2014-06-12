require.config({
	paths : {
		jquery : '../vendor/jquery/dist/jquery.min',
		three : '../vendor/threejs/build/three.min',
		oculus  : '../vendor/oculus/index'
	}
});

require(['jquery'],function($){

	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

	// requestAnimationFrame polyfill by Erik Möller
	// fixes from Paul Irish and Tino Zijdel

	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
	                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
	    }

	    if (!window.requestAnimationFrame)
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };

	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
							};
	}());

	// oculus mode or not?
	var oculus_mode = window.location.hash == "#oculus" ? true : false;
	var show_log = false;

	var spin_deg = .5;
	var spin_deg2 = 1;
	var zoom_out = 1.03;
	var zoom_in = 0.97;
	var dir = zoom_in;
	var zooming = true;
	var spinning = true;
	var log_entries = {z : 0};

	if (oculus_mode) {
		$("a.computer").removeClass('hidden');
		$("a.headset").addClass('hidden');
	} else {
		$("a.computer").addClass('hidden');
		$("a.headset").removeClass('hidden');
	}

	var $log = $("#log");
	var width = window.innerWidth;
	var height = window.innerHeight;
	var $container = $('<div/>').attr("id","main").addClass("full").appendTo("body");
	var scene = new THREE.Scene();

	var renderer = new THREE.WebGLRenderer();
	// var renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);
	$container.get(0).appendChild( renderer.domElement );

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
	// var camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);

	var effect = new THREE.OculusRiftEffect(renderer, {worldScale: 100});
	effect.setSize(width, height);

	var light = new THREE.AmbientLight(0xFFFFFF);
	scene.add(light);

	var texture = THREE.ImageUtils.loadTexture( 'media/images/black_iced_coffee256.jpg' );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 5000, 5000 );

	var texture2 = THREE.ImageUtils.loadTexture( 'media/images/black_iced_coffee256.jpg' );
	texture2.wrapS = THREE.RepeatWrapping;
	texture2.wrapT = THREE.RepeatWrapping;
	texture2.repeat.set( 2, 2 );

	var material = new THREE.MeshBasicMaterial({
	// var material =  new THREE.MeshPhongMaterial({
	// var material = new THREE.MeshLambertMaterial({
		map : texture,
		// ambient: 0xFFFFFF,
		// color: 0xFFFFFF,
		// specular: 0xffffff,
		// shininess: 100,
		shading: THREE.SmoothShading
	});

  // plane
  var plane = new THREE.Mesh(
		new THREE.PlaneGeometry(5000, 5000),
		material
		// new THREE.MeshNormalMaterial()
	);
  // plane.overdraw = true;
  scene.add(plane);


	// plane
	var plane2 = new THREE.Mesh(
		new THREE.PlaneGeometry(5000, 5000),
		material
		// new THREE.MeshNormalMaterial()
	);
	plane2.material.side = THREE.DoubleSide;
	plane2.position.z = 100;
	plane2.overdraw = true;
	scene.add(plane2);



	camera.position.z = 50;

	// controls = new THREE.TrackballControls( camera );
	// controls.target.set( 0, 0, 0 )

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	var spheres = [];

	function addSpheres() {

		for (var i = 0; i < 200; i++) {

			console.log( 'add sphere' );

			var _material = new THREE.MeshBasicMaterial({
				map: texture2
			});
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(randomBetween(.1,2), 20, 20), _material);
      sphere.overdraw = true;
			sphere.position.x = randomBetween(-100,100);
			sphere.position.y = randomBetween(-100,100);
			sphere.position.z = Math.random() * 100;
      scene.add(sphere);

			spheres.push({
				object : sphere,
				xmove : 0,
				ymove : 0,
				zmove : -.1
			});

		}

	}

	addSpheres();


	function log() {
		$log.empty();
		for(var i in log_entries) {
			$log.append(i + ": " + log_entries[i] + "\n");
		}
	}

	function degToRad(deg) {
		return deg * Math.PI / 180;
	}

	// render looop
	function render() {
		if (zooming) {

			if (camera.position.z >  90) {
				dir = zoom_in;
			} else if (camera.position.z <= .5) {
				dir = zoom_out;
			}

			camera.position.z *= dir;
			log_entries.z = camera.position.z;

		}
		if (spinning) {
			camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), degToRad(spin_deg));
			camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), degToRad(1));
			camera.rotateOnAxis(new THREE.Vector3(1, 0, 1), degToRad( Math.sin(spin_deg2) ));
			// spin_deg *= .99;
		}

		for (var i = 0; i < spheres.length; i++) {

			var s = spheres[i];

			if (s.xmove != 0) {
				s.object.position.z += s.xmove;
			}
			if (s.ymove != 0) {
				s.object.position.y += s.ymove;
			}
			if (s.zmove != 0) {
				s.object.position.z += s.zmove;
				if (s.object.position.z < 0) {
					s.zmove *= -1;
				}
				s.zmove -= .01;
			}

		}

		if (oculus_mode) {
			effect.render(scene, camera);
		} else {
			renderer.render(scene, camera);
		}
		requestAnimationFrame(render);

		spin_deg2 += .01;

		if (show_log) {
			log();
		}
	}

	function resize() {

		width = window.innerWidth;
		height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width,height);
		effect,setSize(width,height);
	}

	if (show_log) {
		$log.removeClass('hidden');
	}

	$(window).on("resize",resize);

	$("a.computer").on("click",function(){
		oculus_mode = false;
		$("a.headset").removeClass('hidden');

		// fuck it, this gets too funky switching renderers ... someday i will learn it better
		window.location = "?" + new Date().getTime() + "#desktop";

		$(this).addClass("hidden");
	});

	$("a.headset").on("click",function(){
		oculus_mode = true;
		$("a.computer").removeClass('hidden');
		$(this).addClass("hidden");
	});

	// start loop!
	render();

});

require.config({
	paths : {
		jquery : '../vendor/jquery/dist/jquery.min',
		three : '../vendor/threejs/build/three.min',
		oculus  : '../vendor/oculus/index'
	}
});

require(['jquery','animationframe'],function($){

	// oculus mode or not?
	var oculus_mode = window.location.hash == "#oculus" ? true : false;
	var show_log = false;

	var spin_deg = .5;
	var spin_deg2 = 1;
	var zoom_out = 1.03;
	var zoom_in = 0.97;
	var dir = zoom_in;
	var zooming = true;
	var spinning = false;
	var flipping = true;
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

	scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0025 );

	// var renderer = new THREE.CanvasRenderer();
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xFFFFFF, 1);
	renderer.setSize(width, height);
	$container.get(0).appendChild( renderer.domElement );

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
	// var camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);

	var effect = new THREE.OculusRiftEffect(renderer, {worldScale: 100});
	effect.setSize(width, height);

	var light = new THREE.AmbientLight(0xFFFFFF);
	scene.add(light);

	var texture = THREE.ImageUtils.loadTexture( 'media/images/black_iced_coffee256.jpg' );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 500, 500 );

	var texture2 = THREE.ImageUtils.loadTexture( 'media/images/dude512.jpg' );
	var texture3 = THREE.ImageUtils.loadTexture( 'media/images/dude256.jpg' );
	// texture2.wrapS = THREE.RepeatWrapping;
	// texture2.wrapT = THREE.RepeatWrapping;
	// texture2.repeat.set( 1, 1 );

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
		new THREE.PlaneGeometry(10000, 10000),
		material
		// new THREE.MeshNormalMaterial()
	);
  // plane.overdraw = true;
  scene.add(plane);


	// plane
	var plane2 = new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000),
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
				map: (Math.random() > .5 ? texture2 : texture3)
			});
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(randomBetween(.05,6), 20, 20), _material);
      sphere.overdraw = true;
			sphere.position.x = randomBetween(-100,100);
			sphere.position.y = randomBetween(-100,100);
			sphere.position.z = Math.random() * 100;
      scene.add(sphere);

			spheres.push({
				object : sphere,
				xmove : 0,
				ymove : 0,
				zmove : -.1,
				xrot : randomBetween(Math.random() * -.1, Math.random() * .1),
				yrot : randomBetween(Math.random() * -.1, Math.random() * .1),
				zrot : randomBetween(Math.random() * -.1, Math.random() * .1)
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
			// spin_deg *= .99;
		}
		if (flipping) {
			camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), degToRad(1));
			camera.rotateOnAxis(new THREE.Vector3(1, 0, 1), degToRad( Math.sin(spin_deg2) ));
		}

		for (var i = 0; i < spheres.length; i++) {

			var s = spheres[i];

			if (s.xrot != 0) {
				s.object.rotation.x += s.xrot;
			}
			if (s.yrot != 0) {
				s.object.rotation.y += s.yrot;
			}
			if (s.zrot != 0) {
				s.object.rotation.z += s.zrot;
			}
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

World = function(camera, rendererElement) {
	var world = this;
	this.camera = camera;
	this.rendererElement = rendererElement;
	this.objects = [];
	this.registerPicker();
	var controls = new this.Controls(camera, rendererElement);

	// move item, without overlay
	var intersectedPreMaterial;
	controls.objectControl.addEventListener('preObjectChange', () => {
		controls.objectControl.enableMove = true;
		var intersected = controls.objectControl.object;
		var objects = world.objects;
		let isIntersected = false;
		let intersectedBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		intersectedBB.setFromObject(intersected);
		for (var i = objects.length - 1; i >= 0; i--) {
			var box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
			box.setFromObject(objects[i]);
			if (intersected !== objects[i] && intersectedBB.intersectsBox(box)) {
				isIntersected = true;
			}
		}
		if (isIntersected) {
			intersected.material = world.materials.colliding;
			controls.objectControl.enableMove = false;
		} else {
			intersected.material = intersectedPreMaterial;
		}
	});
	controls.objectControl.addEventListener('mouseDown', () => {
		intersectedPreMaterial = controls.objectControl.object.material;
	})
	controls.objectControl.addEventListener('mouseUp', () => {
		controls.objectControl.object.material = intersectedPreMaterial;
	})
	this.controls = controls;
};
World.prototype.materials = {
	shadow: new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0.5
	}),
	solid: new THREE.MeshNormalMaterial({}),
	colliding: new THREE.MeshBasicMaterial({
		color: 0xff0000,
		transparent: true,
		opacity: 0.5
	}),
	dot: new THREE.MeshBasicMaterial({
		color: 0x0000ff
	})
};
// controls
((ns) => {
	var Controls = function(camera, rendererElement) {
		let objectControl = new THREE.TransformControls(camera, rendererElement);
		let worldViewControl = new THREE.TrackballControls(camera, rendererElement);

		// objectControl.setTranslationSnap( 1 );
		worldViewControl.rotateSpeed = 1.0;
		worldViewControl.zoomSpeed = 1.2;
		worldViewControl.panSpeed = 0.8;
		worldViewControl.noZoom = false;
		worldViewControl.noPan = false;
		worldViewControl.staticMoving = true;
		worldViewControl.dynamicDampingFactor = 0.3;
		worldViewControl.keys = [65, 83, 68];

		Controls.prototype.update = () => {
			objectControl.update();
			worldViewControl.update();
		}
		Controls.prototype.addEventListener = (eventName, f) => {
			objectControl.addEventListener(eventName, f);
			worldViewControl.addEventListener(eventName, f);
		}
		Controls.prototype.bind = (scene) => {
			scene.add(objectControl);
		}
		this.objectControl = objectControl;
		this.worldViewControl = worldViewControl;
	}
	ns.prototype.Controls = Controls;
})(World);

// raycaster
((ns) => {
	ns.prototype.registerPicker = function() {
		var world = this;
		var intersected;
		var material = world.materials.colliding;
		var materialPre;
		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		var objects = world.objects;
		world.rendererElement.addEventListener('click', onDocumentMouseClick, false);

		// pick item for control
		function onDocumentMouseClick(event) {
			event.preventDefault();
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, world.camera);
			var octreeObjects;
			var numObjects;
			var intersections;

			intersections = raycaster.intersectObjects(objects);
			numObjects = objects.length;

			if (intersections.length > 0) {
				if (intersected != intersections[0].object) {
					intersected = intersections[0].object;
					world.controls.objectControl.attach(intersected);
				}
			} else if (intersected) {
				intersected = null;
				world.controls.objectControl.detach();
			}
		}
	}

	// items
	ns.prototype.newItem = function(geometry) {
		var item = new THREE.Mesh( geometry, this.materials.solid );

		// add for click listen
		this.objects.push(item);

		return item;
	}
})(World);
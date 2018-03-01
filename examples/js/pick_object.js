World = function(camera, rendererElement) {
	this.camera = camera;
	this.rendererElement = rendererElement;
	this.objects = [];
	this.registerPicker();
	this.controls = new this.Controls(camera, rendererElement);
};
// controls
((ns) => {
	var Controls = function( camera, rendererElement ) {
		let objectControl = new THREE.TransformControls( camera, rendererElement );
		let worldViewControl = new THREE.TrackballControls( camera, rendererElement );

		worldViewControl.rotateSpeed = 1.0;
		worldViewControl.zoomSpeed = 1.2;
		worldViewControl.panSpeed = 0.8;
		worldViewControl.noZoom = false;
		worldViewControl.noPan = false;
		worldViewControl.staticMoving = true;
		worldViewControl.dynamicDampingFactor = 0.3;
		worldViewControl.keys = [ 65, 83, 68 ];

		Controls.prototype.update = () => {
			objectControl.update();
			worldViewControl.update();
		}
		Controls.prototype.attach = (mesh) => {
			objectControl.attach(mesh);
		}
		Controls.prototype.addEventListener = ( eventName, f ) => {
			objectControl.addEventListener( eventName, f );
			worldViewControl.addEventListener( eventName, f );
		}
		Controls.prototype.bind = ( scene ) => {
			scene.add( objectControl );
		}
	}
	ns.prototype.Controls = Controls;
})(World);

// raycaster
((ns) => {
	ns.prototype.registerPicker = function() {
		var world = this;
		var intersected;
		var intersectColor = 0x00D66B;
		var preColor;
		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		var objects = world.objects;
		world.rendererElement.addEventListener( 'click', onDocumentMouseClick, false );

		function onDocumentMouseClick( event ) {
			event.preventDefault();
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			raycaster.setFromCamera( mouse, world.camera );
			var octreeObjects;
			var numObjects;
			var intersections;

			intersections = raycaster.intersectObjects( objects );
			numObjects = objects.length;

			if ( intersections.length > 0 ) {
				if ( intersected != intersections[ 0 ].object ) {
					if ( intersected ) {
						intersected.material.color.setHex( preColor );
					}
					intersected = intersections[ 0 ].object;
					preColor = intersected.material.color.getHex();
					intersected.material.color.setHex( intersectColor );
					world.controls.attach(intersected);
				}
			}
			else if ( intersected ) {
				intersected.material.color.setHex( preColor );
				intersected = null;
			}
			// update tracker
			console.log(' using infinite ray from camera found [ ' + numObjects + ' / ' + objects.length + ' ] objects, and [ ' + intersections.length + ' ] intersections.');
		}
	}

	// items
	ns.prototype.newItem = function(geometry) {
		var wireframe = new THREE.WireframeGeometry(geometry);
		var item = new THREE.LineSegments(wireframe);
		item.material.depthTest = false;
		item.material.transparent = true;

		// add for click listen
		this.objects.push(item);

		return item;
	}
})(World);
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

let renderer,
scene,
camera,
sphereBg,
nucleus,
stars,
controls,
container = document.getElementById("canvas_container"),
noise = new SimplexNoise(),
blobScale = 3

function init() {
    //Scene initialization
    scene = new THREE.Scene()
    
    //camera Setup
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.set(0,0,230)
    
    //Light Setup
    const directionalLight = new THREE.DirectionalLight('#fff', 2)
    directionalLight.position.set(0, 50, -20)
    scene.add(directionalLight)

    let ambientLight = new THREE.AmbientLight('#fff', 2)
    ambientLight.position.set(0, 20, 20)
    scene.add(ambientLight)

    console.log(ambientLight)

    //RenderSetup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Controls Setup
    controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = true

    //Texture Loaders
    const textureLoader = new THREE.TextureLoader()
    const textureSphereBg = textureLoader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg')
    const textureNucleus = textureLoader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg')
    const textureStar = textureLoader.load('https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png')
    const texture1 = textureLoader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png") 
    const texture2 = textureLoader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png")
    const texture4 = textureLoader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png")


    textureNucleus.anisotropy = 16
    let icosahedronGeometry = new THREE.IcosahedronGeometry(30, 10)
    let lambertMaterial = new THREE.MeshPhongMaterial({map: textureNucleus})
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial)

    scene.add(nucleus)

    textureSphereBg.anisotropy = 16
    let geometrySphereBg = new THREE.SphereBufferGeometry(150, 40, 40)
    let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
    })
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg)

    scene.add(sphereBg)

    let starsGeometry = new THREE.Geometry()

    for (let i = 0; i < 50; i++) {
        let particleStar = randomPointSphere(150)

        particleStar.velocity = THREE.MathUtils.randInt(50, 200)

        particleStar.startX = particleStar.x
        particleStar.startY = particleStar.y
        particleStar.startZ = particleStar.z

        starsGeometry.vertices.push(particleStar)
    }

    let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
    })

    starsMaterial.depthWrite = false  
    stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)


    function createStars(texture, size, total) {
        let pointGeometry = new THREE.Geometry()
        let pointMaterial = new THREE.PointsMaterial({
            size: size,
            map: texture,
            blending: THREE.AdditiveBlending,
        });

        for (let i = 0; i < total; i++) {
            let radius = THREE.MathUtils.randInt(149, 70) 
            let particles = randomPointSphere(radius)
            pointGeometry.vertices.push(particles)
        }
        return new THREE.Points(pointGeometry, pointMaterial)
    }
    scene.add(createStars(texture1, 15, 35))
    scene.add(createStars(texture2, 5, 5))
    scene.add(createStars(texture4, 7, 5))


    function randomPointSphere (radius) {
        let theta = 2 * Math.PI * Math.random()
        let phi = Math.acos(2 * Math.random() - 1)
        let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta))
        let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta))
        let dz = 0 + (radius * Math.cos(phi))
        return new THREE.Vector3(dx, dy, dz)
    }

}

function animate() {

    stars.geometry.vertices.forEach(v => {
        v.x += (0 - v.x) / v.velocity
        v.y += (0 - v.y) / v.velocity
        v.z += (0 - v.z) / v.velocity

        v.velocity -= 0.3

        if (v.x <= 5 && v.x >= -5 && v.z <= 5 && v.z >= -5) {
            v.x = v.startX
            v.y = v.startY
            v.z = v.startZ
            v.velocity = new THREE.MathUtils.randInt(50, 300)
        }
    })

    //Nucleus Animation
    nucleus.geometry.vertices.forEach(function (v) {
        let time = Date.now();
        v.normalize();
        let distance = nucleus.geometry.parameters.radius + noise.noise3D(
            v.x + time * 0.0005,
            v.y + time * 0.0003,
            v.z + time * 0.0008
        ) * blobScale;
        v.multiplyScalar(distance);
    })
    nucleus.geometry.verticesNeedUpdate = true
    nucleus.geometry.normalsNeedUpdate = true
    nucleus.geometry.computeVertexNormals()
    nucleus.geometry.computeFaceNormals()
    nucleus.rotation.y += 0.002

    sphereBg.rotation.x += 0.002
    sphereBg.rotation.y += 0.002
    sphereBg.rotation.z += 0.002
    controls.update()

    stars.geometry.verticesNeedUpdate = true
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

init()
animate()
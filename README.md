# Rapier Probe

This project is an interactive 3D dental visualization tool built with React, Vite, Three.js, and Rapier physics. It allows you to load, view, and interact with 3D models of teeth crowns and roots, with support for collision detection and physical simulation.

## Features
- Load and display STL models of teeth crowns and roots from the `public/crowns` and `public/shortRoots` folders
- Realistic 3D rendering using Three.js and @react-three/fiber
- Physics simulation and collision detection using @react-three/rapier
- Interactive camera controls (TrackballControls)
- Customizable material and lighting
- Texture support for teeth surfaces (`public/textures/teeth.png`)
- Easily extensible for more teeth or other dental models

## Project Structure
- `src/` — React components and main application logic
- `public/crowns/` — STL files for teeth crowns
- `public/shortRoots/` — STL files for teeth roots
- `public/textures/teeth.png` — Texture for teeth
- `index.html` — Main HTML entry point

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**
   Go to [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## Usage
- Use your mouse to rotate, zoom, and pan the 3D scene.
- Teeth models are loaded from the `public/crowns` and `public/shortRoots` folders.
- Physics and collisions are handled by Rapier; you can configure teeth as static or dynamic in the code.

## Dependencies
- React
- Vite
- three
- @react-three/fiber
- @react-three/drei
- @react-three/rapier
- zustand

## License
MIT
